import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const execFileAsync = promisify(execFile);
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

const safeBasename = (value: string) => path.basename(String(value || "").replace(/\\/g, "/"));

const ensureDir = async (dirPath: string) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const resolveGuruApiUploadsRoot = async () => {
  const candidates = [
    path.resolve(process.cwd(), "..", "guru-api", "uploads"),
    path.resolve(process.cwd(), "guru-api", "uploads"),
    path.resolve(process.cwd(), "..", "..", "guru-api", "uploads"),
  ];
  for (const candidate of candidates) {
    const guruApiDir = path.resolve(candidate, "..");
    if (await fileExists(guruApiDir)) {
      return candidate;
    }
  }
  return candidates[0];
};

export async function POST(request: Request) {
  let tempPdfPath = "";
  let tempOutputPath = "";
  let tempAssetsDir = "";
  try {
    const formData = await request.formData();
    const file = formData.get("file") as
      | null
      | {
          arrayBuffer?: () => Promise<ArrayBuffer>;
          size?: number;
          name?: string;
        };

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "Missing file in form-data (key: file)." }, { status: 400 });
    }

    const size = Number(file.size || 0);
    const name = String(file.name || "uploaded.pdf");
    if (size <= 0) {
      return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
    }
    if (size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `PDF too large. Max supported size is ${MAX_FILE_BYTES / (1024 * 1024)}MB.` },
        { status: 413 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    tempPdfPath = path.join(os.tmpdir(), `question-factory-parserjs-${randomUUID()}.pdf`);
    tempOutputPath = path.join(os.tmpdir(), `question-factory-parserjs-${randomUUID()}.json`);
    tempAssetsDir = path.join(os.tmpdir(), `question-factory-assets-${randomUUID()}`);
    await fs.writeFile(tempPdfPath, bytes);

    const parserScriptPath = path.resolve(process.cwd(), "..", "parser", "parser.js");
    const startedAt = Date.now();
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      [
        parserScriptPath,
        "--input",
        tempPdfPath,
        "--output",
        tempOutputPath,
        "--assets-dir",
        tempAssetsDir,
        "--extract-images",
        "--json-stdout",
      ],
      {
        timeout: 180_000,
        maxBuffer: 40 * 1024 * 1024,
      }
    );

    if (stderr?.trim()) {
      console.warn("[pdf-parse-parserjs-api] parser stderr:", stderr.trim());
    }

    let parsed: { questions?: unknown[] } | null = null;
    const stdoutText = String(stdout || "").trim();
    if (stdoutText) {
      const parseJsonFromStdout = (raw: string) => {
        try {
          return JSON.parse(raw) as { questions?: unknown[] };
        } catch {
          const first = raw.indexOf("{");
          const last = raw.lastIndexOf("}");
          if (first >= 0 && last > first) {
            return JSON.parse(raw.slice(first, last + 1)) as { questions?: unknown[] };
          }
          throw new Error("parser.js stdout did not contain valid JSON");
        }
      };
      parsed = parseJsonFromStdout(stdoutText);
    } else {
      const outputRaw = await fs.readFile(tempOutputPath, "utf8");
      parsed = JSON.parse(outputRaw) as { questions?: unknown[] };
    }

    const questions = Array.isArray(parsed?.questions) ? parsed?.questions || [] : [];
    const durationMs = Date.now() - startedAt;

    const hasAnyAssetHint = questions.some((q) => {
      if (!q || typeof q !== "object") return false;
      const assets = (q as Record<string, unknown>).assets;
      return Array.isArray(assets) && assets.length > 0;
    });

    const uploadsRoot = await resolveGuruApiUploadsRoot();
    const uploadFolder = hasAnyAssetHint ? path.join("pdf-question-assets", `${Date.now()}-${randomUUID()}`) : "";
    const uploadAbsFolder = uploadFolder ? path.join(uploadsRoot, uploadFolder) : "";
    if (uploadAbsFolder) {
      await ensureDir(uploadAbsFolder);
    }

    const rewrittenQuestions = await Promise.all(
      questions.map(async (q) => {
        if (!q || typeof q !== "object") return q;
        const record = q as Record<string, unknown>;
        const assets = Array.isArray(record.assets) ? (record.assets as unknown[]) : [];
        if (assets.length === 0) return q;

        const rewrittenAssets = [];
        for (const asset of assets) {
          if (!asset || typeof asset !== "object") continue;
          const assetRecord = asset as Record<string, unknown>;
          const fileName = safeBasename(String(assetRecord.fileName || ""));
          if (!fileName) continue;

          const sourcePath = path.join(tempAssetsDir, fileName);
          if (!(await fileExists(sourcePath))) continue;

          if (!uploadAbsFolder || !uploadFolder) continue;

          const destPath = path.join(uploadAbsFolder, fileName);
          await fs.copyFile(sourcePath, destPath);

          const url = `${API_BASE_URL}/uploads/${uploadFolder}/${fileName}`;
          rewrittenAssets.push({
            ...assetRecord,
            fileName,
            url,
          });
        }

        return {
          ...record,
          hasVisual: Boolean(record.hasVisual) || rewrittenAssets.length > 0,
          assets: rewrittenAssets,
        };
      })
    );

    return NextResponse.json({
      data: {
        fileName: name,
        parser: "parser/parser.js",
        durationMs,
        questions: rewrittenQuestions,
        count: rewrittenQuestions.length,
      },
    });
  } catch (error) {
    const details =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message || "")
        : "Unknown parser.js parse failure";
    console.error("[pdf-parse-parserjs-api] failure", error);
    return NextResponse.json({ error: `PDF parse failed: ${details}` }, { status: 500 });
  } finally {
    if (tempPdfPath) {
      try {
        await fs.unlink(tempPdfPath);
      } catch {}
    }
    if (tempOutputPath) {
      try {
        await fs.unlink(tempOutputPath);
      } catch {}
    }
    if (tempAssetsDir) {
      try {
        await fs.rm(tempAssetsDir, { recursive: true, force: true });
      } catch {}
    }
  }
}
