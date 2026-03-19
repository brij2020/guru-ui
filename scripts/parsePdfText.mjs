#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "node:fs/promises";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Missing PDF path argument");
  process.exit(1);
}

const normalizeToken = (item) => {
  if (!item || typeof item !== "object" || !("str" in item)) return "";
  const token = String(item.str || "");
  const hasEOL = Boolean(item.hasEOL);
  return `${token}${hasEOL ? "\n" : " "}`;
};

const run = async () => {
  const pdfjsModule = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdfjs = pdfjsModule.default || pdfjsModule;
  if (typeof pdfjs.getDocument !== "function") {
    throw new Error("pdfjs getDocument is unavailable");
  }

  const bytes = new Uint8Array(await fs.readFile(inputPath));
  const task = pdfjs.getDocument({ data: bytes, disableWorker: true });
  if (!task?.promise) {
    throw new Error("Invalid pdf loading task");
  }

  const pdf = await task.promise;
  const pages = Number(pdf.numPages || 0);
  const chunks = [];

  for (let pageNo = 1; pageNo <= pages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    const text = Array.isArray(content?.items) ? content.items.map(normalizeToken).join("") : "";
    chunks.push(text);
  }

  const merged = chunks.join("\n");
  process.stdout.write(
    JSON.stringify({
      text: merged,
      pages,
      length: merged.length,
      parser: "pdfjs-dist/legacy/build/pdf.mjs",
    })
  );
};

run().catch((error) => {
  const message = typeof error?.message === "string" ? error.message : "Unknown parse failure";
  process.stdout.write(JSON.stringify({ error: message }));
  process.exit(1);
});
