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
  let tempPath = "";
  try {
    const formData = await request.formData();
    const file = formData.get("file") as
      | null
      | {
          arrayBuffer?: () => Promise<ArrayBuffer>;
          size?: number;
          name?: string;
          type?: string;
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
    tempPath = path.join(os.tmpdir(), `question-factory-${randomUUID()}.pdf`);
    await fs.writeFile(tempPath, bytes);

    const parserScriptPath = path.join(process.cwd(), "scripts", "parsePdfText.mjs");
    const startedAt = Date.now();
    const { stdout, stderr } = await execFileAsync(process.execPath, [parserScriptPath, tempPath], {
      timeout: 120_000,
      maxBuffer: 20 * 1024 * 1024,
    });

    if (stderr?.trim()) {
      console.warn("[pdf-parse-api] parser stderr:", stderr.trim());
    }

    const parsed = JSON.parse(String(stdout || "{}")) as {
      text?: string;
      pages?: number;
      length?: number;
      parser?: string;
      error?: string;
    };

    if (parsed?.error) {
      throw new Error(parsed.error);
    }

    const text = String(parsed?.text || "");
    const pages = Number(parsed?.pages || 0);
    const length = Number(parsed?.length || text.length || 0);
    const parser = String(parsed?.parser || "node-worker");
    const durationMs = Date.now() - startedAt;

    return NextResponse.json({
      data: {
        text,
        pages,
        length,
        fileName: name,
        parser,
        durationMs,
      },
    });
  } catch (error) {
    const details =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message || "")
        : "Unknown PDF parse error";
    console.error("[pdf-parse-api] failure", error);
    return NextResponse.json({ error: `PDF parse failed: ${details}` }, { status: 500 });
  } finally {
    if (tempPath) {
      try {
        await fs.unlink(tempPath);
      } catch {}
    }
  }
}
