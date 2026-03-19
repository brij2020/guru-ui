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

export async function POST(request: Request) {
  let tempPdfPath = "";
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
    tempPdfPath = path.join(os.tmpdir(), `question-factory-parserv2-${randomUUID()}.pdf`);
    await fs.writeFile(tempPdfPath, bytes);

    const parserScriptPath = path.resolve(process.cwd(), "..", "parser", "parserv2.js");
    const startedAt = Date.now();
    const { stdout, stderr } = await execFileAsync(process.execPath, [parserScriptPath, "--input", tempPdfPath, "--json-stdout"], {
      timeout: 180_000,
      maxBuffer: 40 * 1024 * 1024,
    });

    if (stderr?.trim()) {
      console.warn("[pdf-parse-parserv2-api] parser stderr:", stderr.trim());
    }

    const stdoutText = String(stdout || "").trim();
    const parsed = stdoutText ? (JSON.parse(stdoutText) as { questions?: unknown[]; error?: string }) : null;
    if (parsed?.error) {
      throw new Error(parsed.error);
    }

    const questions = Array.isArray(parsed?.questions) ? parsed?.questions || [] : [];
    const durationMs = Date.now() - startedAt;

    return NextResponse.json({
      data: {
        fileName: name,
        parser: "parser/parserv2.js",
        durationMs,
        questions,
        count: questions.length,
      },
    });
  } catch (error) {
    const details =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message || "")
        : "Unknown parserv2 parse failure";
    console.error("[pdf-parse-parserv2-api] failure", error);
    return NextResponse.json({ error: `PDF parse failed: ${details}` }, { status: 500 });
  } finally {
    if (tempPdfPath) {
      try {
        await fs.unlink(tempPdfPath);
      } catch {}
    }
  }
}

