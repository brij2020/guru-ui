import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
const MAX_FILE_BYTES = 10 * 1024 * 1024;

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
    if (await fileExists(guruApiDir)) return candidate;
  }
  return candidates[0];
};

const sanitizeName = (name: string) =>
  String(name || "asset")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

export async function GET() {
  try {
    const uploadsRoot = await resolveGuruApiUploadsRoot();
    const folder = path.join(uploadsRoot, "question-assets");
    await fs.mkdir(folder, { recursive: true });
    const files = await fs.readdir(folder);
    const items = await Promise.all(
      files.map(async (fileName) => {
        const abs = path.join(folder, fileName);
        const stat = await fs.stat(abs);
        return {
          fileName,
          url: `${API_BASE_URL}/uploads/question-assets/${fileName}`,
          size: Number(stat.size || 0),
          updatedAt: stat.mtime.toISOString(),
        };
      })
    );

    items.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

    return NextResponse.json({ data: { items } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown asset list error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as Array<{
      arrayBuffer?: () => Promise<ArrayBuffer>;
      size?: number;
      name?: string;
      type?: string;
    }>;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files in form-data (key: files)." }, { status: 400 });
    }

    const uploadsRoot = await resolveGuruApiUploadsRoot();
    const folder = path.join(uploadsRoot, "question-assets");
    await fs.mkdir(folder, { recursive: true });

    const uploaded = [];

    for (const file of files) {
      if (typeof file.arrayBuffer !== "function") continue;

      const size = Number(file.size || 0);
      if (!size || size <= 0) continue;
      if (size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: `File too large: ${file.name}. Max 10MB.` }, { status: 413 });
      }

      const ext = path.extname(String(file.name || "")) || ".png";
      const safeBase = sanitizeName(path.basename(String(file.name || "asset"), ext)) || "asset";
      const finalName = `${Date.now()}-${randomUUID()}-${safeBase}${ext.toLowerCase()}`;
      const absPath = path.join(folder, finalName);
      const bytes = new Uint8Array(await file.arrayBuffer());
      await fs.writeFile(absPath, bytes);

      uploaded.push({
        fileName: finalName,
        url: `${API_BASE_URL}/uploads/question-assets/${finalName}`,
        size: bytes.length,
      });
    }

    return NextResponse.json({ data: { items: uploaded } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json({ error: "Missing file name" }, { status: 400 });
    }

    const uploadsRoot = await resolveGuruApiUploadsRoot();
    const folder = path.join(uploadsRoot, "question-assets");
    const filePath = path.join(folder, fileName);

    console.log(`[DELETE] Trying to delete: ${filePath}`);
    console.log(`[DELETE] uploadsRoot: ${uploadsRoot}`);
    console.log(`[DELETE] folder: ${folder}`);

    if (!(await fileExists(filePath))) {
      console.log(`[DELETE] File not found: ${filePath}`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await fs.unlink(filePath);
    console.log(`[DELETE] Successfully deleted: ${filePath}`);

    return NextResponse.json({ data: { deleted: fileName } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown delete error";
    console.log(`[DELETE] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
