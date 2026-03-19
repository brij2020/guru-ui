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

const AI_PROVIDER = String(process.env.AI_PROVIDER || "local").trim().toLowerCase();

const LOCAL_LLM_URL =
  process.env.LOCAL_LLM_URL ||
  `${String(process.env.LOCAL_LLM_BASE_URL || "http://localhost:1234").replace(/\/$/, "")}${
    String(process.env.LOCAL_LLM_CHAT_PATH || "/api/v1/chat").startsWith("/") ? "" : "/"
  }${String(process.env.LOCAL_LLM_CHAT_PATH || "/api/v1/chat")}`;

const LOCAL_LLM_MODEL = String(process.env.LOCAL_LLM_MODEL || "").trim();
const LOCAL_LLM_BATCH_SIZE = Math.max(1, Math.min(50, Number(process.env.LOCAL_LLM_BATCH_SIZE || 10)));
const LOCAL_LLM_DELAY_MS = Math.max(0, Number(process.env.LOCAL_LLM_DELAY_MS || 0));
const LOCAL_LLM_DEBUG = String(process.env.LOCAL_LLM_DEBUG || "").trim() === "1";

const PUTER_AI_MODEL = String(process.env.PUTER_AI_MODEL || "claude-sonnet-4-20250514").trim();

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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const debugLog = (...args: unknown[]) => {
  if (!LOCAL_LLM_DEBUG) return;
  // eslint-disable-next-line no-console
  console.log("[pdf-parse-parserv2-ai-api]", ...args);
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

const sanitizeJsonOutput = (text: string) =>
  String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

const extractJsonCandidate = (text: string) => {
  const raw = sanitizeJsonOutput(text);
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1);
  }
  const firstBracket = raw.indexOf("[");
  const lastBracket = raw.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return raw.slice(firstBracket, lastBracket + 1);
  }
  return raw;
};

const parseModelJson = (text: string) => {
  const candidates = [sanitizeJsonOutput(text), extractJsonCandidate(text)];
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // next candidate
    }
  }
  return null;
};

const callLocalLlmCleanup = async (payload: {
  fileName: string;
  questions: unknown[];
}) => {
  if (AI_PROVIDER === "puter") {
    return callPuterAiCleanup(payload);
  }
  return callLocalLlmDirect(payload);
};

const callPuterAiCleanup = async (payload: {
  fileName: string;
  questions: unknown[];
}) => {
  const { puter } = await import("@heyputer/puter.js");
  
  const cleanupRequestId = randomUUID();
  const chunks: unknown[][] = [];
  for (let i = 0; i < payload.questions.length; i += LOCAL_LLM_BATCH_SIZE) {
    chunks.push(payload.questions.slice(i, i + LOCAL_LLM_BATCH_SIZE));
  }

  const cleaned: unknown[] = [];
  
  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    debugLog(
      `puter-ai request=${cleanupRequestId} chunk=${idx + 1}/${chunks.length} items=${chunk.length} model=${PUTER_AI_MODEL}`
    );
    
    const prompt = `
You are cleaning imported MCQ questions extracted from a PDF.
Return strict JSON only (no markdown, no prose).

Input file: ${payload.fileName}
Chunk: ${idx + 1}/${chunks.length}

Task:
- Fix broken line breaks, spacing, and punctuation.
- Ensure options are exactly 4 or 5 strings (A-E). Preserve order.
- Keep questionNumber stable.
- Normalize answer to be either option text OR option letter (A-E). Prefer letter if obvious.
- Keep RC metadata: groupType, groupId, groupTitle, passageText, groupOrder.
- DO NOT remove assets. Keep assets array as-is (URLs, fileName, sourcePage, etc).
- If a field is unknown, leave it as empty string or null.

Required output schema:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "string",
      "options": ["string"],
      "answer": "string",
      "explanation": "string",
      "difficulty": "easy|medium|hard",
      "topic": "string",
      "groupType": "none|rc_passage",
      "groupId": "string",
      "groupTitle": "string",
      "passageText": "string",
      "groupOrder": 1,
      "hasVisual": true,
      "assets": [
        { "kind": "image", "url": "string", "fileName": "string", "alt": "string", "width": 0, "height": 0, "caption": "string", "sourcePage": 1 }
      ]
    }
  ]
}

Input JSON:
${JSON.stringify({ questions: chunk })}
`.trim();

    const requestStartedAt = Date.now();
    
    try {
      const response = await puter.ai.chat.completions.create({
        model: PUTER_AI_MODEL,
        messages: [
          { role: "system", content: "Return strict JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      });

      debugLog(
        `puter-ai response=${cleanupRequestId} chunk=${idx + 1}/${chunks.length} durationMs=${
          Date.now() - requestStartedAt
        }`
      );

      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("Puter AI returned empty response");
      }

      const finalJson = parseModelJson(content);
      const questions = (finalJson as any)?.questions;
      if (!Array.isArray(questions)) {
        throw new Error("Puter AI returned invalid JSON: missing questions[]");
      }

      cleaned.push(...questions);
    } catch (puterError: any) {
      console.error("[pdf-parse-parserv2-ai-api] Puter AI error:", puterError);
      throw new Error(`Puter AI request failed: ${puterError?.message || "Unknown error"}`);
    }

    if (LOCAL_LLM_DELAY_MS > 0 && idx < chunks.length - 1) {
      debugLog(`puter-ai sleep=${cleanupRequestId} ms=${LOCAL_LLM_DELAY_MS}`);
      await sleep(LOCAL_LLM_DELAY_MS);
    }
  }

  return cleaned;
};

const callLocalLlmDirect = async (payload: {
  fileName: string;
  questions: unknown[];
}) => {
  const cleanupRequestId = randomUUID();
  const chunks: unknown[][] = [];
  for (let i = 0; i < payload.questions.length; i += LOCAL_LLM_BATCH_SIZE) {
    chunks.push(payload.questions.slice(i, i + LOCAL_LLM_BATCH_SIZE));
  }

  const cleaned: unknown[] = [];
  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    debugLog(
      `local-llm request=${cleanupRequestId} chunk=${idx + 1}/${chunks.length} items=${chunk.length} url=${LOCAL_LLM_URL}`
    );
    const prompt = `
You are cleaning imported MCQ questions extracted from a PDF.
Return strict JSON only (no markdown, no prose).

Input file: ${payload.fileName}
Chunk: ${idx + 1}/${chunks.length}

Task:
- Fix broken line breaks, spacing, and punctuation.
- Ensure options are exactly 4 or 5 strings (A-E). Preserve order.
- Keep questionNumber stable.
- Normalize answer to be either option text OR option letter (A-E). Prefer letter if obvious.
- Keep RC metadata: groupType, groupId, groupTitle, passageText, groupOrder.
- DO NOT remove assets. Keep assets array as-is (URLs, fileName, sourcePage, etc).
- If a field is unknown, leave it as empty string or null.

Required output schema:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "string",
      "options": ["string"],
      "answer": "string",
      "explanation": "string",
      "difficulty": "easy|medium|hard",
      "topic": "string",
      "groupType": "none|rc_passage",
      "groupId": "string",
      "groupTitle": "string",
      "passageText": "string",
      "groupOrder": 1,
      "hasVisual": true,
      "assets": [
        { "kind": "image", "url": "string", "fileName": "string", "alt": "string", "width": 0, "height": 0, "caption": "string", "sourcePage": 1 }
      ]
    }
  ]
}

Input JSON:
${JSON.stringify({ questions: chunk })}
`.trim();

    const body = {
      ...(LOCAL_LLM_MODEL ? { model: LOCAL_LLM_MODEL } : {}),
      messages: [
        { role: "system", content: "Return strict JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    };

    const requestStartedAt = Date.now();
    const response = await fetch(LOCAL_LLM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const rawText = await response.text();
    debugLog(
      `local-llm response=${cleanupRequestId} chunk=${idx + 1}/${chunks.length} status=${response.status} durationMs=${
        Date.now() - requestStartedAt
      } bodyPreview=${JSON.stringify(String(rawText || "").slice(0, 200))}`
    );
    if (!response.ok) {
      throw new Error(`Local LLM request failed (${response.status}): ${rawText.slice(0, 300)}`);
    }

    const parsed = parseModelJson(rawText);
    const content =
      typeof parsed === "object" && parsed
        ? // OpenAI-ish
          (parsed as any)?.choices?.[0]?.message?.content ||
          // Other common local shapes
          (parsed as any)?.message?.content ||
          (parsed as any)?.content ||
          (parsed as any)?.text
        : null;

    const finalJson =
      typeof content === "string"
        ? parseModelJson(content)
        : parsed;

    const questions = (finalJson as any)?.questions;
    if (!Array.isArray(questions)) {
      throw new Error("Local LLM returned invalid JSON: missing questions[]");
    }

    cleaned.push(...questions);

    if (LOCAL_LLM_DELAY_MS > 0 && idx < chunks.length - 1) {
      debugLog(`local-llm sleep=${cleanupRequestId} ms=${LOCAL_LLM_DELAY_MS}`);
      await sleep(LOCAL_LLM_DELAY_MS);
    }
  }

  return cleaned;
};

export async function POST(request: Request) {
  let tempPdfPath = "";
  let tempAssetsDir = "";
  try {
    const requestId = randomUUID();
    debugLog(`start request=${requestId} localLlmUrl=${LOCAL_LLM_URL}`);
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
    tempPdfPath = path.join(os.tmpdir(), `question-factory-parserv2-ai-${randomUUID()}.pdf`);
    tempAssetsDir = path.join(os.tmpdir(), `question-factory-assets-${randomUUID()}`);
    await fs.writeFile(tempPdfPath, bytes);
    debugLog(`saved request=${requestId} tempPdfPath=${tempPdfPath} bytes=${bytes.length}`);

    const parserV2Path = path.resolve(process.cwd(), "..", "parser", "parserv2.js");
    const parserJsPath = path.resolve(process.cwd(), "..", "parser", "parser.js");

    const startedAt = Date.now();
    const { stdout: v2Stdout, stderr: v2Stderr } = await execFileAsync(
      process.execPath,
      [parserV2Path, "--input", tempPdfPath, "--json-stdout"],
      {
        timeout: 180_000,
        maxBuffer: 40 * 1024 * 1024,
      }
    );
    if (v2Stderr?.trim()) console.warn("[pdf-parse-parserv2-ai-api] parserv2 stderr:", v2Stderr.trim());
    debugLog(`parserv2 done request=${requestId} stdoutBytes=${String(v2Stdout || "").length}`);

    const v2Parsed = String(v2Stdout || "").trim()
      ? (JSON.parse(String(v2Stdout || "").trim()) as { questions?: unknown[]; error?: string })
      : null;
    if (v2Parsed?.error) throw new Error(v2Parsed.error);

    const sourceQuestions = Array.isArray(v2Parsed?.questions) ? v2Parsed?.questions || [] : [];
    let jsQuestions: unknown[] = [];
    try {
      const { stdout: jsStdout, stderr: jsStderr } = await execFileAsync(
        process.execPath,
        [parserJsPath, "--input", tempPdfPath, "--assets-dir", tempAssetsDir, "--extract-images", "--json-stdout"],
        {
          timeout: 180_000,
          maxBuffer: 40 * 1024 * 1024,
        }
      );
      if (jsStderr?.trim()) console.warn("[pdf-parse-parserv2-ai-api] parser.js stderr:", jsStderr.trim());
      const jsParsed = String(jsStdout || "").trim()
        ? (JSON.parse(String(jsStdout || "").trim()) as { questions?: unknown[]; error?: string })
        : null;
      if ((jsParsed as any)?.error) {
        console.warn("[pdf-parse-parserv2-ai-api] parser.js returned error:", String((jsParsed as any)?.error || ""));
      } else {
        jsQuestions = Array.isArray(jsParsed?.questions) ? jsParsed?.questions || [] : [];
      }
    } catch (assetError) {
      console.warn("[pdf-parse-parserv2-ai-api] parser.js image extraction failed:", assetError);
      jsQuestions = [];
    }
    debugLog(`parser.js images request=${requestId} questionsWithMaybeAssets=${jsQuestions.length}`);

    // Persist image assets extracted by parser.js into guru-api/uploads and rewrite URLs.
    const uploadsRoot = await resolveGuruApiUploadsRoot();
    const uploadFolder = path.join("pdf-question-assets", `${Date.now()}-${randomUUID()}`);
    const uploadAbsFolder = path.join(uploadsRoot, uploadFolder);
    await ensureDir(uploadAbsFolder);

    const rewrittenAssetsByQuestionNumber = new Map<number, unknown[]>();
    for (const q of jsQuestions) {
      if (!q || typeof q !== "object") continue;
      const record = q as Record<string, unknown>;
      const questionNumber = Number(record.questionNumber);
      if (!Number.isFinite(questionNumber)) continue;
      const assets = Array.isArray(record.assets) ? (record.assets as unknown[]) : [];
      if (assets.length === 0) continue;

      const rewrittenAssets = [];
      for (const asset of assets) {
        if (!asset || typeof asset !== "object") continue;
        const assetRecord = asset as Record<string, unknown>;
        const fileName = safeBasename(String(assetRecord.fileName || ""));
        if (!fileName) continue;
        const sourcePath = path.join(tempAssetsDir, fileName);
        if (!(await fileExists(sourcePath))) continue;

        const destPath = path.join(uploadAbsFolder, fileName);
        await fs.copyFile(sourcePath, destPath);
        const url = `${API_BASE_URL}/uploads/${uploadFolder}/${fileName}`;
        rewrittenAssets.push({
          ...assetRecord,
          fileName,
          url,
        });
      }

      if (rewrittenAssets.length > 0) {
        rewrittenAssetsByQuestionNumber.set(questionNumber, rewrittenAssets);
      }
    }

    const mergedQuestions = sourceQuestions.map((q) => {
      if (!q || typeof q !== "object") return q;
      const record = q as Record<string, unknown>;
      const questionNumber = Number(record.questionNumber);
      if (!Number.isFinite(questionNumber)) return q;
      const assets = rewrittenAssetsByQuestionNumber.get(questionNumber) || [];
      if (!Array.isArray(assets) || assets.length === 0) return q;
      return {
        ...record,
        hasVisual: Boolean(record.hasVisual) || assets.length > 0,
        assets,
      };
    });

    // AI cleanup using local LLM.
    let cleanedQuestions: unknown[] = mergedQuestions;
    let aiCleanupError = "";
    if (mergedQuestions.length > 0) {
      try {
        cleanedQuestions = await callLocalLlmCleanup({ fileName: name, questions: mergedQuestions });
      } catch (cleanupError) {
        aiCleanupError =
          typeof cleanupError === "object" && cleanupError && "message" in cleanupError
            ? String((cleanupError as { message?: unknown }).message || "")
            : "AI cleanup failed";
        console.warn("[pdf-parse-parserv2-ai-api] AI cleanup failed, returning merged parser output:", cleanupError);
        cleanedQuestions = mergedQuestions;
      }
    }

    const durationMs = Date.now() - startedAt;
    debugLog(
      `done request=${requestId} questions=${cleanedQuestions.length} durationMs=${durationMs} aiCleanupError=${JSON.stringify(
        aiCleanupError
      )}`
    );
    return NextResponse.json({
      data: {
        fileName: name,
        parser: "parser/parserv2.js + local-llm-cleanup + parser.js(images)",
        durationMs,
        questions: cleanedQuestions,
        count: cleanedQuestions.length,
        localLlmUrl: LOCAL_LLM_URL,
        aiCleanupError,
      },
    });
  } catch (error) {
    const details =
      typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message || "")
        : "Unknown parserv2+AI parse failure";
    console.error("[pdf-parse-parserv2-ai-api] failure", error);
    return NextResponse.json({ error: `PDF parse failed: ${details}` }, { status: 500 });
  } finally {
    if (tempPdfPath) {
      try {
        await fs.unlink(tempPdfPath);
      } catch {}
    }
    if (tempAssetsDir) {
      try {
        await fs.rm(tempAssetsDir, { recursive: true, force: true });
      } catch {}
    }
  }
}
