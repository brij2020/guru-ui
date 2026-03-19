"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert, Button, Card, Col, Form, Image, Input, InputNumber, Row, Select, Space, Switch, Table, Tag, Typography, Upload, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadFile } from "antd/es/upload/interface";
import { FilePdfOutlined, PlayCircleOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import { GOV_EXAMS } from "@/lib/mockTestBuilder";

const { Title, Text } = Typography;

type CoverageRow = {
  sectionKey: string;
  sectionLabel: string;
  difficulty: string;
  target: number;
  availableApproved: number;
  gapApproved: number;
};

type CoverageResponse = {
  data?: {
    sectionDifficulty?: CoverageRow[];
  };
};

type JobRow = {
  id: string;
  status: string;
  totalQuestions: number;
  generatedCount: number;
  insertedCount: number;
  progress: number;
  createdAt?: string;
};

type PdfJobRow = {
  id: string;
  status: string;
  examSlug: string;
  stageSlug: string;
  paperFolder: string;
  outputFolder: string;
  chunkSize: number;
  outputFilesCount: number;
  imported?: {
    imported?: number;
    inserted?: number;
    updated?: number;
    duplicatesSkipped?: number;
    files?: number;
    importedAt?: string | null;
  };
  createdAt?: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  lastError?: string;
};

type PdfExtractionReport = {
  paperFolder?: string;
  outputFolder?: string;
  filesProcessed?: number;
  perFile?: Array<{ file?: string; extracted?: number }>;
  totalExtracted?: number;
  uniqueAfterDedupe?: number;
  duplicatesSkipped?: number;
  chunkSize?: number;
  outputFiles?: string[];
};

type PdfJobDetail = PdfJobRow & {
  report?: PdfExtractionReport | null;
  outputFiles?: string[];
  logs?: {
    stdout?: string;
    stderr?: string;
  };
};

type PdfJobsListResponse = {
  data?: {
    items?: PdfJobRow[];
  };
};

type PdfJobDetailResponse = {
  data?: PdfJobDetail;
};

type JobsListResponse = {
  data?: {
    items?: JobRow[];
  };
};

type TopicApiItem = {
  _id: string;
  name: string;
};

type ListTopicsResponse = {
  data?: TopicApiItem[];
};

type DifficultyApiItem = {
  _id: string;
  level: string;
};

type ListDifficultiesResponse = {
  data?: DifficultyApiItem[];
};

type BlueprintSection = {
  key: string;
  label: string;
};

type BlueprintResponse = {
  data?: {
    sections?: BlueprintSection[];
  } | null;
};

type ProcessNextResponse = {
  data?: {
    processed?: boolean;
    message?: string;
    batch?: {
      status?: string;
      generatedCount?: number;
      insertedOrUpdatedCount?: number;
    };
  };
};

type PastePreview = {
  valid: boolean;
  count: number;
  invalidCount: number;
  message: string;
  payload: {
    examSlug: string;
    stageSlug: string;
    domain: string;
    provider: string;
    testId: string;
    testTitle: string;
    promptContext: string;
    questions: Array<Record<string, unknown>>;
  } | null;
};

type ParsedPdfQuestion = {
  key: string;
  questionNumber?: number | null;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  hasVisual?: boolean;
  assets?: Array<{
    kind?: string;
    url?: string;
    alt?: string;
    width?: number | null;
    height?: number | null;
    caption?: string;
    sourcePage?: number | null;
  }>;
  groupType?: "none" | "rc_passage";
  groupId?: string;
  groupTitle?: string;
  passageText?: string;
  groupOrder?: number | null;
};

type PdfParseMeta = {
  fileName: string;
  pages: number;
  length: number;
  parser: string;
  durationMs: number;
};

type PdfParserMode =
  | "auto"
  | "legacy"
  | "hybrid"
  | "line_state"
  | "inline_option"
  | "multi_layout"
  | "python_no_node"
  | "adda247_direct"
  | "adda247_v2"
  | "adda247_v2_ai";

const DIFFICULTY_CYCLE = ["medium", "easy", "hard"];
const REAL_EXAM_TOPICS: Record<string, string[]> = {
  "sbi-clerk:prelims": [
    "English Language",
    "Reading Comprehension",
    "Cloze Test",
    "Fill in the blanks",
    "Para Jumbles",
    "Error Detection",
    "Numerical Ability",
    "Simplification",
    "Data Interpretation",
    "Quadratic Equations",
    "Number Series",
    "Reasoning Ability",
    "Puzzles",
    "Seating Arrangement",
    "Puzzle / Seating Arrangement",
    "Syllogism",
    "Coding Decoding",
    "Statement based MCQ",
    "Assertion Reason",
    "Mathematical Word Problems",
  ],
  "ssc-cgl:tier-1": [
    "General Intelligence and Reasoning",
    "Analogy",
    "Classification",
    "Series",
    "General Awareness",
    "History",
    "Geography",
    "Polity",
    "Quantitative Aptitude",
    "Percentage",
    "Profit and Loss",
    "Time and Work",
    "English Comprehension",
    "Reading Comprehension",
    "Cloze Test",
    "Fill in the blanks",
    "Error Detection",
    "Para Jumbles",
    "Vocabulary",
    "Grammar",
    "Data Interpretation",
    "Puzzle / Seating Arrangement",
    "Coding Decoding",
    "Syllogism",
    "Statement based MCQ",
    "Assertion Reason",
    "Mathematical Word Problems",
  ],
  "rrb-ntpc:cbt-1": [
    "General Awareness",
    "Current Affairs",
    "Indian Economy",
    "Mathematics",
    "Arithmetic",
    "Simplification",
    "Number System",
    "General Intelligence and Reasoning",
    "Statement Conclusion",
    "Puzzles",
    "Puzzle / Seating Arrangement",
    "Coding Decoding",
    "Reading Comprehension",
    "Cloze Test",
    "Fill in the blanks",
    "Error Detection",
    "Para Jumbles",
    "Data Interpretation",
    "Syllogism",
    "Statement based MCQ",
    "Assertion Reason",
    "Mathematical Word Problems",
  ],
};

const STRATEGY_FOCUS_KEYWORDS = [
  "time management",
  "negative marking",
  "elimination strategy",
  "attempt strategy",
  "speed",
  "accuracy",
];

const DEFAULT_FULL_COVERAGE_STYLES = [
  "Reading Comprehension",
  "Cloze Test",
  "Fill in the blanks",
  "Error Detection",
  "Para Jumbles",
  "Data Interpretation",
  "Puzzle / Seating Arrangement",
  "Coding Decoding",
  "Syllogism",
  "Statement based MCQ",
  "Assertion Reason",
  "Mathematical Word Problems",
];

const buildQuestionTypeTargetMixLine = (styles: string[], totalQuestions: number) => {
  const targets = (Array.isArray(styles) && styles.length > 0 ? styles : DEFAULT_FULL_COVERAGE_STYLES)
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  if (targets.length === 0) return "";
  const total = Math.max(1, Number(totalQuestions || 0));
  const base = Math.floor(total / targets.length);
  let rem = total % targets.length;
  const parts = targets.map((style) => {
    const count = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
    return `${style}:${count}`;
  });
  return `Question-type target mix: ${parts.join(" | ")}.`;
};

const normalizeTopic = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ");

const normalizeText = (value: string) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeDifficultyForSchema = (value: string) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "easy" || normalized === "beginner") return "easy";
  if (normalized === "hard" || normalized === "advanced") return "hard";
  if (normalized === "medium" || normalized === "intermediate") return "medium";
  return "medium";
};

const stripPrefix = (value: string) =>
  value
    .replace(/^\s*(\(?\d+\)?[\).\s-]+|qu(?:e|estion)?\.?\s*\d+\s*[:.)-]\s*)/i, "")
    .trim();

const extractOption = (line: string) =>
  line.replace(/^\s*([A-Ea-e]|[1-5])[\).:\-\s]+/, "").trim();

const parseAnswerText = (answerLine: string, options: string[]) => {
  const raw = String(answerLine || "").trim();
  if (!raw) return "";
  const match = raw.match(/\b([A-Ea-e]|[1-5])\b/);
  if (!match) return raw;
  const token = match[1].toUpperCase();
  const index = token >= "1" && token <= "5" ? Number(token) - 1 : token.charCodeAt(0) - 65;
  return options[index] || raw;
};

const cleanLegacyParserText = (value: string) =>
  String(value || "")
    .replace(/Adda247/gi, "")
    .replace(/FREE QUIZZES/gi, "")
    .replace(/FREE PDFs/gi, "")
    .replace(/Test Prime/gi, "")
    .replace(/Solutions[\s\S]*/gi, "")
    .replace(/\s+/g, " ")
    .trim();

const parseMcqFromLegacyPattern = (rawText: string): ParsedPdfQuestion[] => {
  const cleaned = cleanLegacyParserText(rawText);
  if (!cleaned) return [];

  const markers = Array.from(cleaned.matchAll(/Q\s*(\d{1,4})\./gi));
  const questionBlocks = markers.map((current, i) => {
    const next = markers[i + 1];
    const markerText = String(current?.[0] || "");
    const start = Number(current?.index || 0) + markerText.length;
    const end = next ? Number(next?.index || cleaned.length) : cleaned.length;
    return [current?.[0] || "", current?.[1] || "", cleaned.slice(start, end)] as const;
  });
  const out: ParsedPdfQuestion[] = [];

  for (const [idx, match] of questionBlocks.entries()) {
    const qNumber = Number(match?.[1] || idx + 1);
    const block = String(match?.[2] || "").trim();
    if (!block) continue;

    const stem = normalizeText(block.split(/\([a-e]\)/i)[0] || "");
    const options = Array.from(block.matchAll(/\([a-e]\)\s*([\s\S]*?)(?=\([a-e]\)|$)/gi))
      .map((m) => normalizeText(String(m?.[1] || "")))
      .filter(Boolean)
      .slice(0, 5);

    if (!stem) continue;
    out.push({
      key: `legacy-pdf-q-${qNumber}-${idx + 1}`,
      questionNumber: Number.isFinite(qNumber) ? qNumber : null,
      question: stem,
      options,
      answer: options[0] || "",
      explanation: "",
      difficulty: "medium",
      topic: "",
    });
  }

  return out;
};

const resolveAnswerOptionLabel = (answer: string, options: string[]) => {
  const normalizedAnswer = normalizeText(answer).toLowerCase();
  if (!normalizedAnswer || !Array.isArray(options) || options.length === 0) return "";
  const idx = options.findIndex((opt) => normalizeText(opt).toLowerCase() === normalizedAnswer);
  if (idx < 0) return "";
  return String.fromCharCode(65 + idx);
};

const resolveAnswerIndex = (answer: string, options: string[]) => {
  if (!Array.isArray(options) || options.length === 0) return -1;
  const normalizedAnswer = normalizeText(answer).toLowerCase();
  if (!normalizedAnswer) return -1;

  const letterMatch = normalizedAnswer.match(/^[a-e]$/i);
  if (letterMatch) {
    const idx = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
    return idx >= 0 && idx < options.length ? idx : -1;
  }

  return options.findIndex((opt) => normalizeText(opt).toLowerCase() === normalizedAnswer);
};

const parseMcqFromText = (rawText: string): ParsedPdfQuestion[] => {
  const text = String(rawText || "").replace(/\r/g, "\n");
  const blocks = text
    .split(/\n(?=\s*(?:\d+[\).\s]|Qu(?:e|estion)?\.?\s*\d+[:.)\s-]))/gi)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const parsed: ParsedPdfQuestion[] = [];
  for (const [idx, block] of blocks.entries()) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const isOptionLine = (line: string) => /^\s*([A-Ea-e]|[1-5])[\).:\-\s]+/.test(line);
    const isAnswerLine = (line: string) => /^answer\s*[:\-]/i.test(line);
    const isExplanationLine = (line: string) => /^explanation\s*[:\-]/i.test(line);

    const rawFirstLine = String(lines[0] || "");
    const questionNumberMatch = rawFirstLine.match(/^\s*(?:qu(?:e|estion)?\.?\s*)?(\d{1,4})[\).\s:-]*/i);
    const questionNumber = questionNumberMatch ? Number(questionNumberMatch[1]) : idx + 1;
    let question = stripPrefix(rawFirstLine);
    let cursorStart = 1;
    // Handle PDFs where question number is alone on one line: "5." and stem is on next line.
    if (!question && lines.length > 1) {
      for (let i = 1; i < lines.length; i += 1) {
        const candidate = lines[i];
        if (isOptionLine(candidate) || isAnswerLine(candidate) || isExplanationLine(candidate)) break;
        question = stripPrefix(candidate);
        cursorStart = i + 1;
        if (question) break;
      }
    }

    const options: string[] = [];
    let answer = "";
    let explanation = "";
    let lastOptionIndex = -1;

    for (let i = cursorStart; i < lines.length; i += 1) {
      const line = lines[i];
      if (isOptionLine(line)) {
        const opt = extractOption(line);
        if (opt) {
          options.push(opt);
          lastOptionIndex = options.length - 1;
        }
        continue;
      }
      if (isAnswerLine(line)) {
        answer = parseAnswerText(line.replace(/^answer\s*[:\-]\s*/i, ""), options);
        continue;
      }
      if (isExplanationLine(line)) {
        explanation = line.replace(/^explanation\s*[:\-]\s*/i, "").trim();
        continue;
      }

      if (!line) continue;

      if (options.length === 0) {
        // Question stem often wraps into multiple lines before options start.
        question = normalizeText(`${question} ${line}`);
        continue;
      }

      if (lastOptionIndex >= 0) {
        // Option text continuation for wrapped PDF lines.
        options[lastOptionIndex] = normalizeText(`${options[lastOptionIndex]} ${line}`);
      }
    }

    if (!question || options.length < 2) continue;
    const normalizedOptions = options.slice(0, 5);
    parsed.push({
      key: `pdf-q-${idx + 1}`,
      questionNumber: Number.isFinite(questionNumber) ? questionNumber : null,
      question,
      options: normalizedOptions,
      answer: answer || normalizedOptions[0] || "",
      explanation,
      difficulty: "medium",
      topic: "",
    });
  }

  return parsed;
};

const parseMcqFromLineState = (rawText: string): ParsedPdfQuestion[] => {
  const lines = String(rawText || "")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const isQuestionStart = (line: string) =>
    /^\s*(?:q(?:uestion)?\.?\s*)?\d{1,4}[\).:\-\s]+/i.test(line);
  const parseQuestionNumber = (line: string) => {
    const m = line.match(/^\s*(?:q(?:uestion)?\.?\s*)?(\d{1,4})[\).:\-\s]+/i);
    return m ? Number(m[1]) : null;
  };
  const optionLabelToIndex = (token: string) => {
    const up = String(token || "").toUpperCase();
    if (/^[1-5]$/.test(up)) return Number(up) - 1;
    if (/^[A-E]$/.test(up)) return up.charCodeAt(0) - 65;
    return -1;
  };

  const out: ParsedPdfQuestion[] = [];
  let currentQuestionNumber: number | null = null;
  let currentQuestion = "";
  const currentOptions: string[] = [];
  let currentAnswer = "";
  let currentExplanation = "";
  let currentOptionIndex = -1;

  const flush = () => {
    const question = normalizeText(currentQuestion);
    const options = currentOptions.map((opt) => normalizeText(opt)).filter(Boolean).slice(0, 5);
    if (question && options.length >= 2) {
      out.push({
        key: `line-state-q-${out.length + 1}`,
        questionNumber: currentQuestionNumber,
        question,
        options,
        answer: currentAnswer || options[0] || "",
        explanation: normalizeText(currentExplanation),
        difficulty: "medium",
        topic: "",
      });
    }
    currentQuestionNumber = null;
    currentQuestion = "";
    currentOptions.length = 0;
    currentAnswer = "";
    currentExplanation = "";
    currentOptionIndex = -1;
  };

  for (const line of lines) {
    if (isQuestionStart(line)) {
      flush();
      currentQuestionNumber = parseQuestionNumber(line);
      currentQuestion = stripPrefix(line);
      continue;
    }

    const optionMatch = line.match(/^\s*([A-Ea-e]|[1-5])[\).:\-\s]+(.*)$/);
    if (optionMatch) {
      const idx = optionLabelToIndex(optionMatch[1]);
      const text = normalizeText(optionMatch[2] || "");
      if (idx >= 0 && text) {
        while (currentOptions.length <= idx) currentOptions.push("");
        currentOptions[idx] = text;
        currentOptionIndex = idx;
      }
      continue;
    }

    const ansMatch = line.match(/^\s*(?:ans(?:wer)?|correct(?:\s+option|\s+answer)?)\s*[:\-]?\s*(.+)$/i);
    if (ansMatch) {
      currentAnswer = parseAnswerText(ansMatch[1], currentOptions);
      continue;
    }

    const expMatch = line.match(/^\s*(?:exp(?:lanation)?|solution)\s*[:\-]?\s*(.+)$/i);
    if (expMatch) {
      currentExplanation = normalizeText(`${currentExplanation} ${expMatch[1]}`);
      continue;
    }

    if (currentOptions.length === 0) {
      currentQuestion = normalizeText(`${currentQuestion} ${line}`);
      continue;
    }

    if (currentOptionIndex >= 0) {
      currentOptions[currentOptionIndex] = normalizeText(`${currentOptions[currentOptionIndex]} ${line}`);
    } else {
      currentQuestion = normalizeText(`${currentQuestion} ${line}`);
    }
  }

  flush();
  return out;
};

const parseMcqFromInlineOptions = (rawText: string): ParsedPdfQuestion[] => {
  const text = String(rawText || "").replace(/\r/g, "\n");
  const blocks = text
    .split(/\n(?=\s*(?:\d+[\).\s]|Q(?:uestion)?\.?\s*\d+[:.)\s-]))/gi)
    .map((chunk) => normalizeText(chunk))
    .filter(Boolean);

  const out: ParsedPdfQuestion[] = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    const questionNumberMatch = block.match(/^\s*(?:q(?:uestion)?\.?\s*)?(\d{1,4})[\).:\-\s]+/i);
    const questionNumber = questionNumberMatch ? Number(questionNumberMatch[1]) : i + 1;
    const stem = stripPrefix(block);

    const options = Array.from(
      stem.matchAll(/(?:^|\s)([A-Ea-e]|[1-5])[\).:\-]\s*([\s\S]*?)(?=(?:\s(?:[A-Ea-e]|[1-5])[\).:\-]\s)|$)/g)
    )
      .map((match) => normalizeText(match[2] || ""))
      .filter(Boolean)
      .slice(0, 5);

    const question = normalizeText(stem.split(/(?:^|\s)(?:[A-Ea-e]|[1-5])[\).:\-]\s*/)[0] || "");
    if (!question || options.length < 2) continue;

    out.push({
      key: `inline-q-${i + 1}`,
      questionNumber,
      question,
      options,
      answer: options[0] || "",
      explanation: "",
      difficulty: "medium",
      topic: "",
    });
  }
  return out;
};

const dedupeParsedQuestions = (items: ParsedPdfQuestion[]): ParsedPdfQuestion[] => {
  const map = new Map<string, ParsedPdfQuestion>();
  for (const item of items) {
    const key = normalizeText(item.question).toLowerCase();
    if (!key) continue;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
      continue;
    }
    const existingScore = (existing.options?.length || 0) + (existing.explanation ? 1 : 0);
    const nextScore = (item.options?.length || 0) + (item.explanation ? 1 : 0);
    if (nextScore > existingScore) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
};

const extractDirectionRanges = (rawText: string) => {
  const text = String(rawText || "").replace(/\r/g, "\n");
  const ranges: Array<{
    start: number;
    end: number;
    groupId: string;
    groupTitle: string;
    passageText: string;
  }> = [];
  const regex =
    /Directions?\s*\(?\s*(\d{1,3})\s*[-–]\s*(\d{1,3})\s*\)?[:.\-]?\s*([\s\S]*?)(?=\n\s*(?:Directions?\s*\(?\s*\d{1,3}\s*[-–]\s*\d{1,3}\s*\)?|Q(?:uestion)?\.?\s*\d{1,4}|\d{1,4}[.)]))/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const start = Number(match[1] || 0);
    const end = Number(match[2] || 0);
    const passageText = normalizeText(String(match[3] || ""));
    if (!start || !end || end < start || !passageText) continue;
    ranges.push({
      start,
      end,
      groupId: `rc-${start}-${end}`,
      groupTitle: `Directions (${start}-${end})`,
      passageText,
    });
  }
  return ranges;
};

const attachRcMetaFromRanges = (questions: ParsedPdfQuestion[], ranges: ReturnType<typeof extractDirectionRanges>) =>
  questions.map((question) => {
    const qNo = Number(question.questionNumber || 0);
    const matched = ranges.find((range) => qNo >= range.start && qNo <= range.end);
    if (!matched) {
      return {
        ...question,
        groupType: "none" as const,
        groupId: "",
        groupTitle: "",
        passageText: "",
        groupOrder: null,
      };
    }
    return {
      ...question,
      groupType: "rc_passage" as const,
      groupId: matched.groupId,
      groupTitle: matched.groupTitle,
      passageText: matched.passageText,
      groupOrder: qNo - matched.start + 1,
    };
  });

const readPdfText = async (file: File): Promise<{ text: string; meta: PdfParseMeta | null }> => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await fetch("/api/admin/pdf-parse", {
    method: "POST",
    body: formData,
  });

  const result = (await response.json().catch(() => null)) as
    | {
        data?: { text?: string; pages?: number; length?: number };
        error?: string;
      }
    | null;

  if (!response.ok) {
    if (result?.error) {
      throw new Error(result.error);
    }
    const fallbackText = await response.text().catch(() => "");
    throw new Error(fallbackText || `PDF parse API failed with status ${response.status}`);
  }

  const safeResult = (result || {}) as {
    data?: { text?: string; pages?: number; length?: number; parser?: string; durationMs?: number; fileName?: string };
    error?: string;
  };
  return {
    text: String(safeResult?.data?.text || ""),
    meta: safeResult?.data
      ? {
          fileName: String(safeResult.data.fileName || file.name),
          pages: Number(safeResult.data.pages || 0),
          length: Number(safeResult.data.length || 0),
          parser: String(safeResult.data.parser || ""),
          durationMs: Number(safeResult.data.durationMs || 0),
        }
      : null,
  };
};

const readPdfWithParserJs = async (
  file: File
): Promise<{ questions: ParsedPdfQuestion[]; meta: PdfParseMeta | null }> => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await fetch("/api/admin/pdf-parse-parserjs", {
    method: "POST",
    body: formData,
  });

  const result = (await response.json().catch(() => null)) as
    | {
        data?: {
          fileName?: string;
          parser?: string;
          durationMs?: number;
          questions?: Array<{
            question?: string;
            options?: Array<string | { id?: string; text?: string; value?: string; label?: string }>;
            answer?: string;
            explanation?: string;
            difficulty?: string;
            topic?: string;
            hasVisual?: boolean;
            assets?: Array<{
              kind?: string;
              url?: string;
              alt?: string;
              width?: number | null;
              height?: number | null;
              caption?: string;
              sourcePage?: number | null;
            }>;
          }>;
        };
        error?: string;
      }
    | null;

  if (!response.ok) {
    if (result?.error) throw new Error(result.error);
    throw new Error(`Parser.js API failed with status ${response.status}`);
  }

  const sourceQuestions = Array.isArray(result?.data?.questions) ? result?.data?.questions || [] : [];
  const questions: ParsedPdfQuestion[] = sourceQuestions.map((item: Record<string, unknown>, idx) => {
    const options = Array.isArray(item?.options)
      ? item.options
          .map((opt) => {
            if (typeof opt === "string") return normalizeText(opt);
            return normalizeText(String(opt?.text || opt?.value || opt?.label || ""));
          })
          .filter(Boolean)
          .slice(0, 5)
      : [];
    const normalizedQuestion = normalizeText(String(item?.question || ""));
    return {
      key: `parserjs-q-${idx + 1}`,
      questionNumber: Number.isFinite(Number(item?.questionNumber)) ? Number(item?.questionNumber) : idx + 1,
      question: normalizedQuestion || `Q${idx + 1}. [Question text missing - review required]`,
      options,
      answer: normalizeText(String(item?.answer || "")),
      explanation: normalizeText(String(item?.explanation || "")),
      difficulty: normalizeDifficultyForSchema(String(item?.difficulty || "medium")) as "easy" | "medium" | "hard",
      topic: normalizeText(String(item?.topic || "")),
      hasVisual: Boolean(item?.hasVisual) || (Array.isArray(item?.assets) && item.assets.length > 0),
      assets: Array.isArray(item?.assets)
        ? item.assets
            .map((asset) => ({
              kind: String(asset?.kind || "image"),
              url: String(asset?.url || ""),
              alt: String(asset?.alt || ""),
              width: asset?.width === null || asset?.width === undefined ? null : Number(asset.width),
              height: asset?.height === null || asset?.height === undefined ? null : Number(asset.height),
              caption: String(asset?.caption || ""),
              sourcePage:
                asset?.sourcePage === null || asset?.sourcePage === undefined ? null : Number(asset.sourcePage),
            }))
            .filter((asset) => Boolean(asset.url))
        : [],
      groupType: String(item?.groupType || "none").trim().toLowerCase() === "rc_passage" ? "rc_passage" : "none",
      groupId: normalizeText(String(item?.groupId || "")),
      groupTitle: normalizeText(String(item?.groupTitle || "")),
      passageText: normalizeText(String(item?.passageText || "")),
      groupOrder: Number.isFinite(Number(item?.groupOrder)) ? Number(item?.groupOrder) : null,
    };
  });

  return {
    questions,
    meta: {
      fileName: String(result?.data?.fileName || file.name),
      pages: 0,
      length: questions.length,
      parser: String(result?.data?.parser || "parser/parser.js"),
      durationMs: Number(result?.data?.durationMs || 0),
    },
  };
};

const readPdfWithParserV2 = async (
  file: File
): Promise<{ questions: ParsedPdfQuestion[]; meta: PdfParseMeta | null }> => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await fetch("/api/admin/pdf-parse-parserv2", {
    method: "POST",
    body: formData,
  });

  const result = (await response.json().catch(() => null)) as
    | {
        data?: {
          fileName?: string;
          parser?: string;
          durationMs?: number;
          questions?: Array<{
            questionNumber?: number | null;
            question?: string;
            options?: Array<string | { id?: string; text?: string; value?: string; label?: string }>;
            answer?: string;
            explanation?: string;
            difficulty?: string;
            topic?: string;
            groupType?: string;
            groupId?: string;
            groupTitle?: string;
            passageText?: string;
            groupOrder?: number | null;
            hasVisual?: boolean;
            assets?: Array<{
              kind?: string;
              url?: string;
              alt?: string;
              width?: number | null;
              height?: number | null;
              caption?: string;
              sourcePage?: number | null;
            }>;
          }>;
        };
        error?: string;
      }
    | null;

  if (!response.ok) {
    if (result?.error) throw new Error(result.error);
    throw new Error(`ParserV2 API failed with status ${response.status}`);
  }

  const sourceQuestions = Array.isArray(result?.data?.questions) ? result?.data?.questions || [] : [];
  const questions: ParsedPdfQuestion[] = sourceQuestions.map((item, idx) => {
    const options = Array.isArray(item?.options)
      ? item.options
          .map((opt) => {
            if (typeof opt === "string") return normalizeText(opt);
            return normalizeText(String(opt?.text || opt?.value || opt?.label || ""));
          })
          .filter(Boolean)
          .slice(0, 5)
      : [];
    const normalizedQuestion = normalizeText(String(item?.question || ""));
    return {
      key: `parserv2-q-${idx + 1}`,
      questionNumber: Number.isFinite(Number(item?.questionNumber)) ? Number(item?.questionNumber) : idx + 1,
      question: normalizedQuestion || `Q${idx + 1}. [Question text missing - review required]`,
      options,
      answer: normalizeText(String(item?.answer || "")),
      explanation: normalizeText(String(item?.explanation || "")),
      difficulty: normalizeDifficultyForSchema(String(item?.difficulty || "medium")) as "easy" | "medium" | "hard",
      topic: normalizeText(String(item?.topic || "")),
      hasVisual: Boolean(item?.hasVisual) || (Array.isArray(item?.assets) && item.assets.length > 0),
      assets: Array.isArray(item?.assets)
        ? item.assets
            .map((asset) => ({
              kind: String(asset?.kind || "image"),
              url: String(asset?.url || ""),
              alt: String(asset?.alt || ""),
              width: asset?.width === null || asset?.width === undefined ? null : Number(asset.width),
              height: asset?.height === null || asset?.height === undefined ? null : Number(asset.height),
              caption: String(asset?.caption || ""),
              sourcePage:
                asset?.sourcePage === null || asset?.sourcePage === undefined ? null : Number(asset.sourcePage),
            }))
            .filter((asset) => Boolean(asset.url))
        : [],
      groupType: String(item?.groupType || "none").trim().toLowerCase() === "rc_passage" ? "rc_passage" : "none",
      groupId: normalizeText(String(item?.groupId || "")),
      groupTitle: normalizeText(String(item?.groupTitle || "")),
      passageText: normalizeText(String(item?.passageText || "")),
      groupOrder: Number.isFinite(Number(item?.groupOrder)) ? Number(item?.groupOrder) : null,
    };
  });

  return {
    questions,
    meta: {
      fileName: String(result?.data?.fileName || file.name),
      pages: 0,
      length: questions.length,
      parser: String(result?.data?.parser || "parser/parserv2.js"),
      durationMs: Number(result?.data?.durationMs || 0),
    },
  };
};

const readPdfWithParserV2Ai = async (
  file: File
): Promise<{ questions: ParsedPdfQuestion[]; meta: PdfParseMeta | null }> => {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await fetch("/api/admin/pdf-parse-parserv2-ai", {
    method: "POST",
    body: formData,
  });

  const result = (await response.json().catch(() => null)) as
    | {
        data?: {
          fileName?: string;
          parser?: string;
          durationMs?: number;
          questions?: Array<{
            questionNumber?: number | null;
            question?: string;
            options?: Array<string | { id?: string; text?: string; value?: string; label?: string }>;
            answer?: string;
            explanation?: string;
            difficulty?: string;
            topic?: string;
            groupType?: string;
            groupId?: string;
            groupTitle?: string;
            passageText?: string;
            groupOrder?: number | null;
            hasVisual?: boolean;
            assets?: Array<{
              kind?: string;
              url?: string;
              alt?: string;
              width?: number | null;
              height?: number | null;
              caption?: string;
              sourcePage?: number | null;
            }>;
          }>;
        };
        error?: string;
      }
    | null;

  if (!response.ok) {
    if (result?.error) throw new Error(result.error);
    throw new Error(`ParserV2+AI API failed with status ${response.status}`);
  }

  const sourceQuestions = Array.isArray(result?.data?.questions) ? result?.data?.questions || [] : [];
  const questions: ParsedPdfQuestion[] = sourceQuestions.map((item, idx) => {
    const options = Array.isArray(item?.options)
      ? item.options
          .map((opt) => {
            if (typeof opt === "string") return normalizeText(opt);
            return normalizeText(String(opt?.text || opt?.value || opt?.label || ""));
          })
          .filter(Boolean)
          .slice(0, 5)
      : [];
    const normalizedQuestion = normalizeText(String(item?.question || ""));
    return {
      key: `parserv2-ai-q-${idx + 1}`,
      questionNumber: Number.isFinite(Number(item?.questionNumber)) ? Number(item?.questionNumber) : idx + 1,
      question: normalizedQuestion || `Q${idx + 1}. [Question text missing - review required]`,
      options,
      answer: normalizeText(String(item?.answer || "")),
      explanation: normalizeText(String(item?.explanation || "")),
      difficulty: normalizeDifficultyForSchema(String(item?.difficulty || "medium")) as "easy" | "medium" | "hard",
      topic: normalizeText(String(item?.topic || "")),
      hasVisual: Boolean(item?.hasVisual) || (Array.isArray(item?.assets) && item.assets.length > 0),
      assets: Array.isArray(item?.assets)
        ? item.assets
            .map((asset) => ({
              kind: String(asset?.kind || "image"),
              url: String(asset?.url || ""),
              alt: String(asset?.alt || ""),
              width: asset?.width === null || asset?.width === undefined ? null : Number(asset.width),
              height: asset?.height === null || asset?.height === undefined ? null : Number(asset.height),
              caption: String(asset?.caption || ""),
              sourcePage:
                asset?.sourcePage === null || asset?.sourcePage === undefined ? null : Number(asset.sourcePage),
            }))
            .filter((asset) => Boolean(asset.url))
        : [],
      groupType: String(item?.groupType || "none").trim().toLowerCase() === "rc_passage" ? "rc_passage" : "none",
      groupId: normalizeText(String(item?.groupId || "")),
      groupTitle: normalizeText(String(item?.groupTitle || "")),
      passageText: normalizeText(String(item?.passageText || "")),
      groupOrder: Number.isFinite(Number(item?.groupOrder)) ? Number(item?.groupOrder) : null,
    };
  });

  return {
    questions,
    meta: {
      fileName: String(result?.data?.fileName || file.name),
      pages: 0,
      length: questions.length,
      parser: String(result?.data?.parser || "parser/parserv2.js + local llm"),
      durationMs: Number(result?.data?.durationMs || 0),
    },
  };
};

export default function QuestionFactoryPage() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || "en";
  const [manualForm] = Form.useForm();

  const [examSlug, setExamSlug] = useState("sbi-clerk");
  const [stageSlug, setStageSlug] = useState("prelims");
  const [domain, setDomain] = useState("Government Exam - SBI Clerk");
  const [isDomainCustom, setIsDomainCustom] = useState(false);
  const [provider, setProvider] = useState<"openai" | "gemini" | "chatgpt" | "local">("gemini");
  const [jobSize, setJobSize] = useState(1000);
  const [totalTarget, setTotalTarget] = useState(1000);
  const [batchSize, setBatchSize] = useState(10);
  const [topicsCsv, setTopicsCsv] = useState("time management, negative marking, prelims pattern");
  const [stylesCsv, setStylesCsv] = useState(DEFAULT_FULL_COVERAGE_STYLES.join(", "));
  const [strictSyllabusMode, setStrictSyllabusMode] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [pdfJobs, setPdfJobs] = useState<PdfJobRow[]>([]);
  const [pdfPaperFolder, setPdfPaperFolder] = useState("/tmp/papers");
  const [pdfOutputFolder, setPdfOutputFolder] = useState("/tmp/output");
  const [pdfChunkSize, setPdfChunkSize] = useState(1000);
  const [isCreatingPdfJob, setIsCreatingPdfJob] = useState(false);
  const [activePdfJobId, setActivePdfJobId] = useState<string>("");
  const [activePdfJobDetail, setActivePdfJobDetail] = useState<PdfJobDetail | null>(null);
  const [isLoadingPdfDetail, setIsLoadingPdfDetail] = useState(false);
  const [pdfFileList, setPdfFileList] = useState<UploadFile[]>([]);
  const [pdfTopic, setPdfTopic] = useState("");
  const [pdfParserMode, setPdfParserMode] = useState<PdfParserMode>("hybrid");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isImportingPdf, setIsImportingPdf] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [showManualCreator, setShowManualCreator] = useState(false);
  const [queueDelayMs, setQueueDelayMs] = useState(120000);
  const [pasteJson, setPasteJson] = useState("");
  const [isImportingPaste, setIsImportingPaste] = useState(false);
  const [pastePreview, setPastePreview] = useState<PastePreview>({
    valid: false,
    count: 0,
    invalidCount: 0,
    message: "",
    payload: null,
  });
  const [manualTopicOptions, setManualTopicOptions] = useState<string[]>([]);
  const [manualSectionOptions, setManualSectionOptions] = useState<string[]>([]);
  const [manualDifficultyOptions, setManualDifficultyOptions] = useState<string[]>(["easy", "medium", "hard"]);
  const [parsedPdfQuestions, setParsedPdfQuestions] = useState<ParsedPdfQuestion[]>([]);
  const [parseReport, setParseReport] = useState<{
    status: "idle" | "success" | "error";
    message: string;
    filesProcessed: number;
    questionsDetected: number;
    details: PdfParseMeta[];
  }>({
    status: "idle",
    message: "",
    filesProcessed: 0,
    questionsDetected: 0,
    details: [],
  });
  const [stepVisibility, setStepVisibility] = useState({
    step1: true,
    step2: true,
    step3: true,
    step4: true,
    step5: true,
    step6: true,
    step7: true,
    step8: true,
    step9: true,
  });

  const [textInput, setTextInput] = useState("");
  const [isParsingText, setIsParsingText] = useState(false);
  const [parsedTextQuestions, setParsedTextQuestions] = useState<ParsedPdfQuestion[]>([]);

  const stageOptions = useMemo(() => {
    const exam = GOV_EXAMS.find((item) => item.slug === examSlug);
    return (exam?.stages || []).map((stage) => ({ value: stage.slug, label: `${stage.name} (${stage.slug})` }));
  }, [examSlug]);

  const parseCsv = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const topicPlan = useMemo(() => {
    const userTopics = parseCsv(topicsCsv);
    const catalog = REAL_EXAM_TOPICS[`${examSlug}:${stageSlug}`] || [];
    if (catalog.length === 0) {
      return {
        alignedTopics: userTopics,
        focusTopics: [],
      };
    }

    const normalizedCatalog = catalog.map(normalizeTopic);
    const inCatalog = userTopics.filter((topic) => normalizedCatalog.includes(normalizeTopic(topic)));
    const outsideCatalog = userTopics.filter((topic) => !normalizedCatalog.includes(normalizeTopic(topic)));
    const focusTopics = outsideCatalog.filter((topic) =>
      STRATEGY_FOCUS_KEYWORDS.some((kw) => normalizeTopic(topic).includes(kw))
    );
    const syllabusExtras = outsideCatalog.filter((topic) => !focusTopics.includes(topic));

    const alignedTopics = strictSyllabusMode
      ? [...new Set([...inCatalog, ...catalog])]
      : [...new Set([...inCatalog, ...catalog, ...syllabusExtras])];

    return {
      alignedTopics,
      focusTopics,
    };
  }, [examSlug, stageSlug, strictSyllabusMode, topicsCsv]);

  const allTopicOptions = useMemo(() => {
    const catalog = REAL_EXAM_TOPICS[`${examSlug}:${stageSlug}`] || [];
    return Array.from(
      new Set([...catalog, ...topicPlan.alignedTopics, ...manualTopicOptions].map((item) => String(item || "").trim()).filter(Boolean))
    );
  }, [examSlug, stageSlug, manualTopicOptions, topicPlan.alignedTopics]);

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [topicsRes, difficultiesRes] = await Promise.all([
          apiClient.get<ListTopicsResponse>(API_ENDPOINTS.topics.list),
          apiClient.get<ListDifficultiesResponse>(API_ENDPOINTS.difficultyLevels.list),
        ]);

        const topics = Array.isArray(topicsRes.data?.data)
          ? topicsRes.data!.data!.map((item) => String(item?.name || "").trim()).filter(Boolean)
          : [];
        if (topics.length > 0) {
          setManualTopicOptions(Array.from(new Set(topics)));
        }

        const difficulties = Array.isArray(difficultiesRes.data?.data)
          ? difficultiesRes.data!.data!
              .map((item) => normalizeDifficultyForSchema(String(item?.level || "")))
              .filter(Boolean)
          : [];
        if (difficulties.length > 0) {
          setManualDifficultyOptions(Array.from(new Set(difficulties)));
        }
      } catch {
        // keep fallback options when meta services are unavailable
      }
    };

    void loadMeta();
  }, []);

  useEffect(() => {
    const loadSectionOptions = async () => {
      try {
        const response = await apiClient.get<BlueprintResponse>(API_ENDPOINTS.paperBlueprints.get, {
          params: { examSlug, stageSlug },
        });
        const sections = Array.isArray(response.data?.data?.sections) ? response.data?.data?.sections || [] : [];
        const sectionValues = sections
          .flatMap((section) => [String(section?.label || "").trim(), String(section?.key || "").trim()])
          .filter(Boolean);
        if (sectionValues.length > 0) {
          setManualSectionOptions(Array.from(new Set(sectionValues)));
        } else {
          setManualSectionOptions([]);
        }
      } catch {
        setManualSectionOptions([]);
      }
    };

    void loadSectionOptions();
  }, [examSlug, stageSlug]);

  const refreshJobs = useCallback(async () => {
    try {
      const response = await apiClient.get<JobsListResponse>(API_ENDPOINTS.aiGenerationJobs.list, {
        params: { limit: 20 },
      });
      setJobs(Array.isArray(response.data?.data?.items) ? response.data?.data?.items || [] : []);
    } catch {
      message.error("Unable to refresh job list.");
    }
  }, []);

  const refreshPdfJobs = useCallback(async () => {
    try {
      const response = await apiClient.get<PdfJobsListResponse>(API_ENDPOINTS.questionBank.pdfJobs, {
        params: { limit: 20 },
      });
      const items = Array.isArray(response.data?.data?.items) ? response.data?.data?.items || [] : [];
      setPdfJobs(items);
      setActivePdfJobId((prev) => prev || (items[0]?.id || ""));
    } catch {
      message.error("Unable to refresh PDF jobs.");
    }
  }, []);

  const fetchPdfJobDetail = useCallback(async (id: string) => {
    if (!id) {
      setActivePdfJobDetail(null);
      return;
    }
    setIsLoadingPdfDetail(true);
    try {
      const response = await apiClient.get<PdfJobDetailResponse>(API_ENDPOINTS.questionBank.pdfJobById(id));
      setActivePdfJobDetail(response.data?.data || null);
    } catch {
      setActivePdfJobDetail(null);
      message.error("Unable to load selected PDF job details.");
    } finally {
      setIsLoadingPdfDetail(false);
    }
  }, []);

  useEffect(() => {
    void refreshJobs();
    void refreshPdfJobs();
  }, [refreshJobs, refreshPdfJobs]);

  useEffect(() => {
    if (!activePdfJobId) {
      setActivePdfJobDetail(null);
      return;
    }
    void fetchPdfJobDetail(activePdfJobId);
  }, [activePdfJobId, fetchPdfJobDetail]);

  const createPdfJob = async () => {
    setIsCreatingPdfJob(true);
    try {
      const response = await apiClient.post<{ data?: PdfJobRow }>(API_ENDPOINTS.questionBank.pdfJobs, {
        examSlug,
        stageSlug,
        domain,
        provider: "pyq-extractor",
        testIdPrefix: `${examSlug}-${stageSlug}-pyq`,
        testTitlePrefix: `${examSlug} ${stageSlug} PYQ`,
        promptContext: "Extracted from exam papers",
        paperFolder: pdfPaperFolder,
        outputFolder: pdfOutputFolder,
        chunkSize: pdfChunkSize,
      });
      const createdId = String(response.data?.data?.id || "");
      if (createdId) setActivePdfJobId(createdId);
      message.success("PDF extraction job created.");
      await refreshPdfJobs();
      if (createdId) {
        await fetchPdfJobDetail(createdId);
      }
    } catch (error) {
      const details =
        typeof error === "object" && error && "response" in error
          ? String((error as { response?: { data?: { error?: string } } }).response?.data?.error || "")
          : "";
      message.error(details || "Failed to create PDF job.");
    } finally {
      setIsCreatingPdfJob(false);
    }
  };

  const runPdfJob = async (id: string) => {
    if (!id) return;
    setActivePdfJobId(id);
    try {
      message.loading({ content: "Running quiz.py extraction...", key: "pdf-run", duration: 0 });
      await apiClient.post(API_ENDPOINTS.questionBank.runPdfJob(id), {});
      message.success({ content: "PDF extraction completed.", key: "pdf-run" });
      await refreshPdfJobs();
      await fetchPdfJobDetail(id);
    } catch (error) {
      const details =
        typeof error === "object" && error && "response" in error
          ? String((error as { response?: { data?: { error?: string } } }).response?.data?.error || "")
          : "";
      message.error({ content: details || "Failed to run PDF job.", key: "pdf-run" });
    }
  };

  const importPdfJob = async (id: string) => {
    if (!id) return;
    setActivePdfJobId(id);
    try {
      message.loading({ content: "Importing extracted JSON to question bank...", key: "pdf-import", duration: 0 });
      await apiClient.post(API_ENDPOINTS.questionBank.importPdfJob(id), {});
      message.success({ content: "PDF job output imported.", key: "pdf-import" });
      await refreshPdfJobs();
      await fetchPdfJobDetail(id);
    } catch (error) {
      const details =
        typeof error === "object" && error && "response" in error
          ? String((error as { response?: { data?: { error?: string } } }).response?.data?.error || "")
          : "";
      message.error({ content: details || "Failed to import PDF job output.", key: "pdf-import" });
    }
  };

  const createTargetCampaign = async () => {
    setIsCreating(true);
    try {
      const topics = topicPlan.alignedTopics;
      const focusTopics = topicPlan.focusTopics;
      const questionStyles = parseCsv(stylesCsv);
      const totalJobs = Math.max(1, Math.ceil(totalTarget / Math.max(1, jobSize)));

      let created = 0;
      for (let i = 0; i < totalJobs; i += 1) {
        const difficulty = DIFFICULTY_CYCLE[i % DIFFICULTY_CYCLE.length];
        const remaining = totalTarget - created * jobSize;
        const thisJobTotal = Math.min(jobSize, remaining);
        if (thisJobTotal <= 0) break;
        const questionTypeTargetMix = buildQuestionTypeTargetMixLine(questionStyles, thisJobTotal);

        console.log('[QuestionFactory] Creating job with provider:', provider);
        await apiClient.post(API_ENDPOINTS.aiGenerationJobs.create, {
          provider,
          totalQuestions: thisJobTotal,
          batchSize: Math.min(batchSize, thisJobTotal),
          maxRetries: 2,
          payload: {
            testId: `campaign-${examSlug}-${stageSlug}-${Date.now()}-${i + 1}`,
            testTitle: `${examSlug} ${stageSlug} pool campaign batch ${i + 1}`,
            domain,
            attemptMode: "exam",
            difficulty,
            topics,
            questionStyles,
            examSlug,
            stageSlug,
            promptContext: [
              `Generate realistic ${examSlug} ${stageSlug} government exam questions.`,
              `Strict syllabus mapping: ${strictSyllabusMode ? "enabled" : "disabled"}.`,
              `Use previous-year style patterns inspired by standard exam-prep books and coaching test language.`,
              questionTypeTargetMix,
              topics.length ? `Syllabus topics: ${topics.join(", ")}.` : "",
              focusTopics.length ? `Student strategy focus (not syllabus): ${focusTopics.join(", ")}.` : "",
              "Focus on exam authenticity, elimination strategy, and balanced options.",
            ]
              .filter(Boolean)
              .join(" "),
          },
        });

        created += 1;
      }

      message.success(`Created ${created} AI generation jobs.`);
      await refreshJobs();
    } catch {
      message.error("Failed to create campaign jobs.");
    } finally {
      setIsCreating(false);
    }
  };

  const createGapCampaign = async () => {
    setIsCreating(true);
    try {
      const styles = parseCsv(stylesCsv);
      const questionTypeTargetMix = buildQuestionTypeTargetMixLine(styles, Math.max(1, Number(batchSize || 50)));
      const coverageResponse = await apiClient.get<CoverageResponse>(API_ENDPOINTS.questionBank.coverage, {
        params: { examSlug, stageSlug },
      });
      const rows = Array.isArray(coverageResponse.data?.data?.sectionDifficulty)
        ? coverageResponse.data?.data?.sectionDifficulty || []
        : [];
      const gaps = rows.filter((row) => Number(row.gapApproved || 0) > 0);

      let created = 0;
      for (const row of gaps) {
        const totalQuestions = Number(row.gapApproved || 0);
        if (totalQuestions <= 0) continue;

        await apiClient.post(API_ENDPOINTS.aiGenerationJobs.create, {
          provider,
          totalQuestions,
          batchSize: Math.min(batchSize, totalQuestions),
          maxRetries: 2,
          payload: {
            testId: `gap-${examSlug}-${stageSlug}-${row.sectionKey}-${row.difficulty}`,
            testTitle: `${examSlug} ${stageSlug} gap fill ${row.sectionLabel}`,
            domain,
            attemptMode: "exam",
            difficulty: row.difficulty,
            topics: [row.sectionLabel, row.sectionKey, "gap-fill"],
            questionStyles: styles.length > 0 ? styles : ["Single Correct MCQ"],
            examSlug,
            stageSlug,
            promptContext: `Generate ${totalQuestions} realistic questions for section ${row.sectionLabel} (${row.sectionKey}) at ${row.difficulty} level for ${examSlug} ${stageSlug}.${questionTypeTargetMix ? ` ${questionTypeTargetMix}` : ''}`,
          },
        });

        created += 1;
      }

      if (created === 0) {
        message.info("No gap buckets found. Coverage looks filled.");
      } else {
        message.success(`Created ${created} gap-fill jobs from coverage.`);
      }
      await refreshJobs();
    } catch {
      message.error("Unable to create gap-based jobs.");
    } finally {
      setIsCreating(false);
    }
  };

  const processQueue = async () => {
    setIsProcessing(true);
    try {
      let processedCount = 0;
      let generatedCount = 0;
      let insertedCount = 0;

      const effectiveDelayMs = provider === "gemini" ? Math.max(120000, queueDelayMs) : queueDelayMs;
      const maxBatches = Math.min(2500, Math.max(50, Math.ceil(totalTarget / Math.max(1, batchSize)) + 50));
      for (let i = 0; i < maxBatches; i += 1) {
        const response = await apiClient.post<ProcessNextResponse>(API_ENDPOINTS.aiGenerationJobs.processNext, {});
        const processed = Boolean(response.data?.data?.processed);
        const noQueue = String(response.data?.data?.message || "").toLowerCase().includes("no queued jobs");
        if (!processed || noQueue) break;
        processedCount += 1;
        generatedCount += Number(response.data?.data?.batch?.generatedCount || 0);
        insertedCount += Number(response.data?.data?.batch?.insertedOrUpdatedCount || 0);
        if (effectiveDelayMs > 0 && i < maxBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, effectiveDelayMs));
        }
      }

      if (processedCount === 0) {
        message.info("No queued jobs to process.");
      } else {
        message.success(
          `Processed ${processedCount} batches • Generated ${generatedCount} • Saved ${insertedCount} • Delay ${effectiveDelayMs}ms`
        );
      }
      await refreshJobs();
    } catch {
      message.error("Failed while processing job queue.");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: ColumnsType<JobRow> = [
    {
      title: "Job",
      dataIndex: "id",
      width: 220,
      render: (v) => <Text code>{String(v).slice(-8)}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (v) => <Tag color={v === "completed" ? "green" : v === "failed" ? "red" : "blue"}>{v}</Tag>,
    },
    { title: "Target", dataIndex: "totalQuestions", width: 100 },
    { title: "Generated", dataIndex: "generatedCount", width: 120 },
    { title: "Saved", dataIndex: "insertedCount", width: 100 },
    { title: "Progress %", dataIndex: "progress", width: 110 },
  ];

  const parsedColumns: ColumnsType<ParsedPdfQuestion> = [
    {
      title: "Question",
      key: "question",
      width: "52%",
      render: (value: string, row: ParsedPdfQuestion, index: number) => (
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="mb-1 flex items-center gap-2">
            <Tag color="blue" className="!mb-0">{`Q${index + 1}`}</Tag>
            <Tag color="default" className="!mb-0">{row.difficulty}</Tag>
            {row.groupType === "rc_passage" ? (
              <Tag color="purple" className="!mb-0">
                RC {row.groupOrder ? `#${row.groupOrder}` : ""}
              </Tag>
            ) : null}
          </div>
          <Text className="!text-[13px] !leading-6 !text-slate-900">{row.question || "-"}</Text>
        </div>
      ),
    },
    {
      title: "Images",
      dataIndex: "assets",
      width: "12%",
      render: (value: ParsedPdfQuestion["assets"], row: ParsedPdfQuestion) => {
        const assets = Array.isArray(value) ? value.filter((a) => Boolean(a?.url)) : [];
        if (assets.length === 0) return <Text type="secondary">-</Text>;
        return (
          <div className="space-y-1">
            <div className="flex flex-wrap gap-2">
              {assets.slice(0, 2).map((asset, idx) => (
                <a key={`${asset?.url}-${idx}`} href={String(asset?.url || "")} target="_blank" rel="noreferrer">
                  <Image
                    src={String(asset?.url || "")}
                    alt={String(asset?.alt || "Question asset")}
                    width={96}
                    preview={false}
                    className="!rounded border border-slate-200 bg-white"
                  />
                </a>
              ))}
            </div>
            {assets.length > 2 ? (
              <Text type="secondary" className="!text-[11px]">
                +{assets.length - 2} more
              </Text>
            ) : null}
          </div>
        );
      },
    },
    {
      title: "Options",
      dataIndex: "options",
      width: "34%",
      render: (value: string[], row: ParsedPdfQuestion) => {
        const answerIdx = resolveAnswerIndex(row.answer || "", value || []);
        return (
        <div className="space-y-1.5">
          {(value || []).map((opt, idx) => (
            <div
              key={`${opt}-${idx}`}
              className={`rounded-md border px-2.5 py-1.5 text-xs leading-5 ${
                idx === answerIdx
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span
                className={`mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full font-semibold ${
                  idx === answerIdx ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )},
    },
    {
      title: "Answer",
      dataIndex: "answer",
      width: "14%",
      render: (v: string, row) => {
        const label = resolveAnswerOptionLabel(v, row.options || []);
        return (
          <div className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-2">
            {label ? (
              <Tag color="blue" className="!mb-1">
                Option {label}
              </Tag>
            ) : null}
            <div className="line-clamp-3 text-xs leading-5 text-blue-900">{v || "-"}</div>
          </div>
        );
      },
    },
  ];

  const parseUploadedPdf = async () => {
    console.log("[QuestionFactory] Parse PDF clicked");
    if (pdfParserMode === "python_no_node") {
      message.info("No Node.js parser mode selected. Use Step 5: Python PDF Jobs (quiz.py) for extraction.");
      return;
    }
    const files = pdfFileList
      .map((item) => item.originFileObj)
      .filter((file) => file && typeof file === 'object' && 'name' in file && 'size' in file) as File[];
    console.log("[QuestionFactory] Candidate files:", files.map((f) => ({ name: f.name, size: f.size, type: f.type })));
    if (files.length === 0) {
      console.warn("[QuestionFactory] Parse aborted: no valid PDF files in uploader state");
      message.warning("Upload at least one PDF file.");
      return;
    }
    setIsParsingPdf(true);
    try {
      const all: ParsedPdfQuestion[] = [];
      const details: PdfParseMeta[] = [];
      for (const file of files) {
        console.log(`[QuestionFactory] Reading PDF: ${file.name}`);
        if (pdfParserMode === "adda247_direct") {
          const { questions, meta } = await readPdfWithParserJs(file);
          if (meta) details.push(meta);
          console.log(`[QuestionFactory] parser.js questions from ${file.name}:`, questions.length);
          all.push(...questions);
          continue;
        }
        if (pdfParserMode === "adda247_v2") {
          const { questions, meta } = await readPdfWithParserV2(file);
          if (meta) details.push(meta);
          console.log(`[QuestionFactory] parserv2.js questions from ${file.name}:`, questions.length);
          all.push(...questions);
          continue;
        }
        if (pdfParserMode === "adda247_v2_ai") {
          const { questions, meta } = await readPdfWithParserV2Ai(file);
          if (meta) details.push(meta);
          console.log(`[QuestionFactory] parserv2+AI questions from ${file.name}:`, questions.length);
          all.push(...questions);
          continue;
        }

        const { text, meta } = await readPdfText(file);
        if (meta) details.push(meta);
        console.log(`[QuestionFactory] Extracted text length for ${file.name}:`, text.length);
        const directionRanges = extractDirectionRanges(text);
        const autoParsed = attachRcMetaFromRanges(parseMcqFromText(text), directionRanges);
        const legacyParsed = attachRcMetaFromRanges(parseMcqFromLegacyPattern(text), directionRanges);
        const lineStateParsed = attachRcMetaFromRanges(parseMcqFromLineState(text), directionRanges);
        const inlineParsed = attachRcMetaFromRanges(parseMcqFromInlineOptions(text), directionRanges);

        let parsed: ParsedPdfQuestion[] = [];
        if (pdfParserMode === "auto") {
          parsed = autoParsed;
        } else if (pdfParserMode === "legacy") {
          parsed = legacyParsed;
        } else if (pdfParserMode === "line_state") {
          parsed = lineStateParsed;
        } else if (pdfParserMode === "inline_option") {
          parsed = inlineParsed;
        } else if (pdfParserMode === "multi_layout") {
          parsed = dedupeParsedQuestions([
            ...autoParsed,
            ...legacyParsed,
            ...lineStateParsed,
            ...inlineParsed,
          ]);
        } else {
          parsed = dedupeParsedQuestions([...autoParsed, ...legacyParsed]);
        }

        console.log(
          `[QuestionFactory] Parsed questions from ${file.name}: auto=${autoParsed.length} legacy=${legacyParsed.length} line=${lineStateParsed.length} inline=${inlineParsed.length} final=${parsed.length}`
        );
        all.push(...parsed);
      }
      setParsedPdfQuestions(all.slice(0, 5000));
      console.log("[QuestionFactory] Total parsed questions:", all.length);
      if (all.length === 0) {
        setParseReport({
          status: "error",
          message: "No MCQ pattern detected from extracted text.",
          filesProcessed: files.length,
          questionsDetected: 0,
          details,
        });
        message.warning("No MCQ pattern detected from PDF text. Check if PDF is scanned/image-only or formatting is irregular.");
      } else {
        setParseReport({
          status: "success",
          message: "PDF parsed and question candidates extracted.",
          filesProcessed: files.length,
          questionsDetected: all.length,
          details,
        });
        message.success(`Parsed ${all.length} questions from ${files.length} PDF file(s).`);
      }
    } catch (error) {
      console.error("[QuestionFactory] Parse PDF failed:", error);
      const details =
        typeof error === "object" && error && "message" in error
          ? String((error as { message?: unknown }).message || "")
          : "";
      setParseReport({
        status: "error",
        message: details || "Unknown parse failure",
        filesProcessed: files.length,
        questionsDetected: 0,
        details: [],
      });
      message.error(`Failed to parse PDF. ${details || "Scanned/image-only PDFs need OCR support."}`);
    } finally {
      setIsParsingPdf(false);
    }
  };

  const importParsedPdfToDb = async () => {
    if (parsedPdfQuestions.length === 0) {
      message.warning("Parse PDF first to get questions.");
      return;
    }
    setIsImportingPdf(true);
    try {
      const payloadQuestions = parsedPdfQuestions.map((item) => ({
        questionNumber: item.questionNumber || undefined,
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        difficulty: item.difficulty,
        type: "mcq",
        topic: item.topic || pdfTopic,
        hasVisual: Boolean(item.hasVisual) || (item.assets?.length || 0) > 0,
        assets: Array.isArray(item.assets) ? item.assets : [],
        groupType: item.groupType || "none",
        groupId: item.groupId || "",
        groupTitle: item.groupTitle || "",
        passageText: item.passageText || "",
        groupOrder: item.groupOrder || null,
      }));

      const response = await apiClient.post<{
        data?: { imported?: number; inserted?: number; updated?: number };
      }>(API_ENDPOINTS.questionBank.importJson, {
        examSlug,
        stageSlug,
        domain,
        provider: "pdf-import",
        testId: `pdf-${examSlug}-${stageSlug}-${Date.now()}`,
        testTitle: `${examSlug} ${stageSlug} PDF import`,
        promptContext: "Imported from admin question-factory PDF parser.",
        questions: payloadQuestions,
      });

      const imported = Number(response.data?.data?.imported || 0);
      const inserted = Number(response.data?.data?.inserted || 0);
      const updated = Number(response.data?.data?.updated || 0);
      message.success(`Imported ${imported} • Inserted ${inserted} • Updated ${updated}`);
      setParsedPdfQuestions([]);
      setPdfFileList([]);
    } catch {
      message.error("Failed to import parsed PDF questions.");
    } finally {
      setIsImportingPdf(false);
    }
  };

  const saveManualQuestion = async () => {
    try {
      const values = await manualForm.validateFields();
      const optionLines = String(values.optionsText || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 5);
      const selectedTopic = Array.isArray(values.topic)
        ? String(values.topic[0] || "").trim()
        : String(values.topic || "").trim();
      const selectedSection = Array.isArray(values.section)
        ? String(values.section[0] || "").trim()
        : String(values.section || "").trim();

      setIsManualSaving(true);
      const payloadQuestion = {
        questionNumber:
          values.questionNumber === null || values.questionNumber === undefined || values.questionNumber === ""
            ? undefined
            : Number(values.questionNumber),
        source: {
          exam: String(values.sourceExam || "").trim(),
          year: values.sourceYear ? Number(values.sourceYear) : null,
          shift: values.sourceShift ? Number(values.sourceShift) : null,
          type: String(values.sourceType || "manual").trim(),
        },
        question: String(values.question || "").trim(),
        section: selectedSection,
        topic: selectedTopic,
        difficulty: normalizeDifficultyForSchema(String(values.difficulty || "medium")),
        type: "mcq",
        options: optionLines,
        answer: String(values.answer || "").trim(),
        answerKey: String(values.answerKey || "").trim(),
        explanation: String(values.explanation || "").trim(),
      };

      const response = await apiClient.post<{
        data?: { imported?: number; inserted?: number; updated?: number };
      }>(API_ENDPOINTS.questionBank.importJson, {
        examSlug,
        stageSlug,
        domain,
        provider: "manual-admin",
        testId: `manual-${examSlug}-${stageSlug}-${Date.now()}`,
        testTitle: `${examSlug} ${stageSlug} manual entry`,
        promptContext: "Manually added from Question Factory",
        questions: [payloadQuestion],
      });

      const imported = Number(response.data?.data?.imported || 0);
      const inserted = Number(response.data?.data?.inserted || 0);
      const updated = Number(response.data?.data?.updated || 0);
      message.success(`Manual question saved. Imported ${imported} • Inserted ${inserted} • Updated ${updated}`);
      manualForm.resetFields();
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) return;
      message.error("Failed to save manual question.");
    } finally {
      setIsManualSaving(false);
    }
  };

  const buildPastePayload = () => {
    const raw = String(pasteJson || "").trim();
    if (!raw) {
      setPastePreview({
        valid: false,
        count: 0,
        invalidCount: 0,
        message: "Paste JSON first.",
        payload: null,
      });
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown> | Array<Record<string, unknown>>;
      const root = Array.isArray(parsed) ? {} : parsed;
      const sourceQuestions = Array.isArray(parsed)
        ? parsed
        : Array.isArray((parsed as { questions?: unknown }).questions)
          ? ((parsed as { questions?: unknown }).questions as Array<Record<string, unknown>>)
          : [];

      if (sourceQuestions.length === 0) {
        setPastePreview({
          valid: false,
          count: 0,
          invalidCount: 0,
          message: 'JSON must be an array or object with "questions" array.',
          payload: null,
        });
        return null;
      }

      const normalizedQuestions = sourceQuestions.map((item: Record<string, unknown>) => ({
        ...item,
        difficulty: normalizeDifficultyForSchema(String(item?.difficulty || "medium")),
        type: String(item?.type || "mcq").trim().toLowerCase() || "mcq",
      }));
      const invalidCount = normalizedQuestions.filter((item: Record<string, unknown>) => !String(item?.question || "").trim()).length;

      const payload = {
        examSlug: String(root?.examSlug || examSlug).trim(),
        stageSlug: String(root?.stageSlug || stageSlug).trim(),
        domain: String(root?.domain || domain).trim(),
        provider: String(root?.provider || "manual-chatgpt").trim(),
        testId: String(root?.testId || `manual-paste-${examSlug}-${stageSlug}-${Date.now()}`).trim(),
        testTitle: String(root?.testTitle || `${examSlug} ${stageSlug} pasted set`).trim(),
        promptContext: String(root?.promptContext || "Imported from pasted JSON in Question Factory.").trim(),
        questions: normalizedQuestions,
      };

      setPastePreview({
        valid: invalidCount === 0,
        count: normalizedQuestions.length,
        invalidCount,
        message:
          invalidCount === 0
            ? "JSON is valid and ready to import."
            : `${invalidCount} question(s) missing required 'question' text.`,
        payload,
      });
      return payload;
    } catch (error) {
      setPastePreview({
        valid: false,
        count: 0,
        invalidCount: 0,
        message:
          typeof error === "object" && error && "message" in error
            ? String((error as { message?: unknown }).message || "Invalid JSON")
            : "Invalid JSON",
        payload: null,
      });
      return null;
    }
  };

  const importPastedJson = async () => {
    const payload = pastePreview.payload || buildPastePayload();
    if (!payload) return;
    if (!pastePreview.valid) {
      message.warning("Fix validation issues before import.");
      return;
    }

    setIsImportingPaste(true);
    try {
      const response = await apiClient.post<{
        data?: { imported?: number; inserted?: number; updated?: number };
      }>(API_ENDPOINTS.questionBank.importJson, payload);

      const imported = Number(response.data?.data?.imported || 0);
      const inserted = Number(response.data?.data?.inserted || 0);
      const updated = Number(response.data?.data?.updated || 0);
      message.success(`Pasted JSON imported. Imported ${imported} • Inserted ${inserted} • Updated ${updated}`);
      setPasteJson("");
      setPastePreview({
        valid: false,
        count: 0,
        invalidCount: 0,
        message: "",
        payload: null,
      });
    } catch {
      message.error("Failed to import pasted JSON.");
    } finally {
      setIsImportingPaste(false);
    }
  };

  const parseTextInput = () => {
    const text = String(textInput || "").trim();
    if (!text) {
      message.warning("Please paste some text content first.");
      return;
    }

    setIsParsingText(true);
    try {
      const questions: ParsedPdfQuestion[] = [];
      const lines = text.split("\n").filter(l => l.trim());
      let currentQuestion = "";
      let currentOptions: string[] = [];

      const flushQuestion = () => {
        if (currentQuestion || currentOptions.length > 0) {
          questions.push({
            key: `text-q-${questions.length + 1}`,
            question: currentQuestion.trim(),
            options: currentOptions,
            answer: currentOptions[0] || "",
            explanation: "",
            difficulty: "medium",
            topic: "",
          });
        }
        currentQuestion = "";
        currentOptions = [];
      };

      const parseInlineOptions = (line: string) => {
        const opts: Array<{ id: string; text: string }> = [];
        const matches = line.matchAll(/\(([a-d])\)\s*([^\(]+)/gi);
        for (const match of matches) {
          opts.push({
            id: match[1].toLowerCase(),
            text: match[2].trim(),
          });
        }
        return opts;
      };

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) {
          if (currentQuestion || currentOptions.length > 0) {
            flushQuestion();
          }
          continue;
        }

        const inlineOpts = parseInlineOptions(line);
        if (inlineOpts.length >= 2) {
          currentOptions = inlineOpts.map(o => o.text);
          continue;
        }

        const parenOptMatch = line.match(/^\(([a-d])\)\s*(.+)/i);
        if (parenOptMatch) {
          currentOptions.push(parenOptMatch[2].trim());
          continue;
        }

        if (currentQuestion) {
          currentQuestion += " " + line;
        } else {
          currentQuestion = line;
        }
      }

      if (currentQuestion || currentOptions.length > 0) {
        flushQuestion();
      }

      setParsedTextQuestions(questions);
      if (questions.length === 0) {
        message.warning("No questions detected. Make sure options are in format: (a) option (b) option");
      } else {
        message.success(`Parsed ${questions.length} question(s) from text.`);
      }
    } catch (error) {
      message.error("Failed to parse text: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsParsingText(false);
    }
  };

  const importParsedTextQuestions = async () => {
    if (parsedTextQuestions.length === 0) {
      message.warning("Parse text first to get questions.");
      return;
    }

    setIsImportingPdf(true);
    try {
      const payloadQuestions = parsedTextQuestions.map((item) => ({
        question: item.question,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        difficulty: item.difficulty,
        type: "mcq",
        topic: item.topic || pdfTopic,
      }));

      const response = await apiClient.post<{
        data?: { imported?: number; inserted?: number; updated?: number };
      }>(API_ENDPOINTS.questionBank.importJson, {
        examSlug,
        stageSlug,
        domain,
        provider: "text-import",
        testId: `text-${examSlug}-${stageSlug}-${Date.now()}`,
        testTitle: `${examSlug} ${stageSlug} text import`,
        promptContext: "Imported from text paste in Question Factory.",
        questions: payloadQuestions,
      });

      const imported = Number(response.data?.data?.imported || 0);
      const inserted = Number(response.data?.data?.inserted || 0);
      const updated = Number(response.data?.data?.updated || 0);
      message.success(`Imported ${imported} • Inserted ${inserted} • Updated ${updated}`);
      setTextInput("");
      setParsedTextQuestions([]);
    } catch {
      message.error("Failed to import text questions.");
    } finally {
      setIsImportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <Card className="border-slate-200 bg-white shadow-sm">
        <Title level={4} className="!mb-1">
          Question Factory (Gov Exams)
        </Title>
        <Text type="secondary">Create large-scale question pools in MongoDB with validated AI job campaigns and queue processing.</Text>
        <Alert
          showIcon
          type="info"
          className="!mt-3"
          message="Workflow"
          description="1) Setup context 2) Create campaign jobs 3) Process queue 4) Review and approve 5) Serve to students."
        />
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tag color="cyan">View</Tag>
            <Text strong>Toggle Steps</Text>
          </div>
          <Space size={8}>
            <Button
              size="small"
              onClick={() =>
                setStepVisibility({
                  step1: true,
                  step2: true,
                  step3: true,
                  step4: true,
                  step5: true,
                  step6: true,
                  step7: true,
                  step8: true,
                  step9: true,
                })
              }
            >
              Show All
            </Button>
            <Button
              size="small"
              onClick={() =>
                setStepVisibility({
                  step1: false,
                  step2: false,
                  step3: false,
                  step4: false,
                  step5: false,
                  step6: false,
                  step7: false,
                  step8: false,
                  step9: false,
                })
              }
            >
              Hide All
            </Button>
          </Space>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "step1", label: "Step 1 Setup" },
            { key: "step2", label: "Step 2 Campaign" },
            { key: "step3", label: "Step 3 Queue" },
            { key: "step4", label: "Step 4 PDF Import" },
            { key: "step5", label: "Step 5 Python Jobs" },
            { key: "step6", label: "Step 6 Manual" },
            { key: "step7", label: "Step 7 Paste JSON" },
            { key: "step8", label: "Step 8 Job Monitor" },
            { key: "step9", label: "Step 9 Text Import" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5"
            >
              <Text className="text-xs font-medium text-slate-700">{item.label}</Text>
              <div className="flex items-center gap-2">
                <Tag
                  color={stepVisibility[item.key as keyof typeof stepVisibility] ? "green" : "default"}
                  className="!m-0 !px-1.5 !text-[10px]"
                >
                  {stepVisibility[item.key as keyof typeof stepVisibility] ? "ON" : "OFF"}
                </Tag>
                <Switch
                  size="small"
                  checked={stepVisibility[item.key as keyof typeof stepVisibility]}
                  onChange={(checked) =>
                    setStepVisibility((prev) => ({
                      ...prev,
                      [item.key]: checked,
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {stepVisibility.step1 && (
      <Card className="border border-sky-200 bg-sky-50/40 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Tag color="blue">Step 1</Tag>
          <Title level={5} className="!mb-0 !text-sky-900">
            Step 1 · Part A: Factory Setup
          </Title>
        </div>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}>
            <Text strong>Exam</Text>
            <Select
              className="!mt-1 w-full"
              value={examSlug}
              onChange={(value) => {
                setExamSlug(value);
                const selectedExam = GOV_EXAMS.find((exam) => exam.slug === value);
                const nextStage = selectedExam?.stages?.[0]?.slug || "prelims";
                setStageSlug(nextStage);
                if (!isDomainCustom) {
                  setDomain(`Government Exam - ${selectedExam?.name || value}`);
                }
              }}
              options={GOV_EXAMS.map((exam) => ({ value: exam.slug, label: `${exam.name} (${exam.slug})` }))}
            />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Stage</Text>
            <Select className="!mt-1 w-full" value={stageSlug} onChange={setStageSlug} options={stageOptions} />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Provider</Text>
            <Select
              className="!mt-1 w-full"
              value={provider}
              onChange={(value) => setProvider(value as "openai" | "gemini" | "chatgpt" | "local")}
              options={[
                { value: "gemini", label: "gemini" },
                { value: "openai", label: "openai" },
                { value: "chatgpt", label: "chatgpt" },
                { value: "local", label: "local (LM Studio)" },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Domain</Text>
            <Input
              className="!mt-1"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setIsDomainCustom(true);
              }}
            />
            <div className="mt-1 flex justify-end">
              <Button
                size="small"
                type="link"
                className="!px-0"
                onClick={() => {
                  const selectedExam = GOV_EXAMS.find((exam) => exam.slug === examSlug);
                  setDomain(`Government Exam - ${selectedExam?.name || examSlug}`);
                  setIsDomainCustom(false);
                }}
              >
                Use Suggested Domain
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
      )}

      {stepVisibility.step2 && (
      <Card className="border border-sky-200 bg-sky-50/40 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Tag color="blue">Step 1</Tag>
          <Title level={5} className="!mb-0 !text-sky-900">
            Step 1 · Part B: AI Campaign Builder
          </Title>
        </div>

        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}>
            <Text strong>Total Target</Text>
            <InputNumber className="!mt-1 w-full" min={10} max={50000} value={totalTarget} onChange={(v) => setTotalTarget(Number(v || 0))} />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Job Size</Text>
            <InputNumber className="!mt-1 w-full" min={10} max={20000} value={jobSize} onChange={(v) => setJobSize(Number(v || 0))} />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Batch Size</Text>
            <InputNumber className="!mt-1 w-full" min={10} max={100} value={batchSize} onChange={(v) => setBatchSize(Number(v || 0))} />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Topics CSV</Text>
            <Input className="!mt-1" value={topicsCsv} onChange={(e) => setTopicsCsv(e.target.value)} />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Strict Syllabus Mode</Text>
            <div className="!mt-1">
              <Switch checked={strictSyllabusMode} onChange={setStrictSyllabusMode} checkedChildren="ON" unCheckedChildren="OFF" />
            </div>
          </Col>
          <Col xs={24}>
            <Text strong>Question Styles CSV</Text>
            <Input className="!mt-1" value={stylesCsv} onChange={(e) => setStylesCsv(e.target.value)} />
          </Col>
        </Row>
        <div className="mt-3">
          <Text type="secondary">
            Aligned Topics ({strictSyllabusMode ? "strict real-exam" : "hybrid"}): {topicPlan.alignedTopics.join(", ") || "-"}
          </Text>
        </div>
        {topicPlan.focusTopics.length > 0 && (
          <div className="mt-1">
            <Text type="secondary">Strategy Focus (separate from syllabus): {topicPlan.focusTopics.join(", ")}</Text>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button icon={<PlusOutlined />} type="primary" onClick={createTargetCampaign} loading={isCreating}>
            Create Target Campaign
          </Button>
          <Button icon={<PlusOutlined />} onClick={createGapCampaign} loading={isCreating}>
            Create Gap Campaign
          </Button>
        </div>
      </Card>
      )}

      {stepVisibility.step3 && (
      <Card className="border border-sky-200 bg-sky-50/40 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Tag color="blue">Step 1</Tag>
          <Title level={5} className="!mb-0 !text-sky-900">
            Step 1 · Part C: Queue Processing & Review
          </Title>
        </div>
        <Row gutter={[12, 12]} className="mb-3">
          <Col xs={24} md={8}>
            <Text strong>Wait Per Job (ms)</Text>
            <InputNumber
              className="!mt-1 w-full"
              min={0}
              max={600000}
              step={1000}
              value={queueDelayMs}
              onChange={(v) => setQueueDelayMs(Number(v || 0))}
            />
          </Col>
        </Row>
        <Space wrap>
          <Button icon={<PlayCircleOutlined />} type="primary" ghost onClick={processQueue} loading={isProcessing}>
            Process Queue Now
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refreshJobs}>
            Refresh Jobs
          </Button>
          <Link href={`/${lang}/admin/tests/question-review?scope=global&reviewStatus=draft&examSlug=${encodeURIComponent(examSlug)}&stageSlug=${encodeURIComponent(stageSlug)}`}>
            <Button>Open Review Queue</Button>
          </Link>
        </Space>
      </Card>
      )}

      {stepVisibility.step4 && (
      <Card className="border border-amber-200 bg-amber-50/40 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Tag color="orange">Step 4</Tag>
          <Title level={5} className="!mb-0 !text-amber-900">
            PDF Import
          </Title>
        </div>
        <Alert
          showIcon
          type="warning"
          className="!mb-3"
          message="This module does not change existing factory flow"
          description="Upload PDF books, parse MCQ text, preview, then import as draft questions to questionbanks."
        />
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Text strong>Upload PDF files</Text>
            <Upload.Dragger
              className="!mt-1"
              multiple
              accept=".pdf,application/pdf"
              fileList={pdfFileList}
              onChange={({ fileList }) => {
                setPdfFileList(
                  fileList.filter(
                    (item) =>
                      item.name.toLowerCase().endsWith(".pdf") ||
                      String(item.type || "").toLowerCase().includes("pdf")
                  )
                );
              }}
              beforeUpload={() => {
                return false;
              }}
            >
              <p className="ant-upload-drag-icon">
                <FilePdfOutlined />
              </p>
              <p className="ant-upload-text">Drop PDFs here or click to upload</p>
              <p className="ant-upload-hint">Best with text-based PDFs. Scanned images need OCR (not included yet).</p>
            </Upload.Dragger>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>Default Topic (optional)</Text>
            <Input
              className="!mt-1"
              placeholder="e.g., English Language"
              value={pdfTopic}
              onChange={(e) => setPdfTopic(e.target.value)}
            />
            <div className="mt-3">
              <Text strong>Parser Mode</Text>
              <Select
                className="!mt-1 w-full"
                value={pdfParserMode}
                onChange={(value) => setPdfParserMode(value as PdfParserMode)}
                options={[
                  { value: "adda247_v2_ai", label: "Adda247 V2 + AI Cleanup (Local LLM @ :1234)" },
                  { value: "adda247_v2", label: "Adda247 V2 (run /parser/parserv2.js)" },
                  { value: "adda247_direct", label: "Adda247 Direct (run /parser/parser.js)" },
                  { value: "python_no_node", label: "No Node.js parser (Use Python Step 5)" },
                  { value: "multi_layout", label: "Multi-Layout (Auto + Legacy + Line + Inline)" },
                  { value: "hybrid", label: "Hybrid (Auto + Legacy parser.js)" },
                  { value: "line_state", label: "Line-state parser (best for wrapped text PDFs)" },
                  { value: "inline_option", label: "Inline option parser (A) ... B) ... format)" },
                  { value: "auto", label: "Auto parser (current)" },
                  { value: "legacy", label: "Legacy parser.js pattern (Q1 + (a)(b)(c)(d))" },
                ]}
              />
            </div>
            <div className="mt-4">
              <Space wrap>
                <Button icon={<UploadOutlined />} onClick={parseUploadedPdf} loading={isParsingPdf}>
                  Parse PDF
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={importParsedPdfToDb} loading={isImportingPdf}>
                  Import Parsed Questions
                </Button>
                <Button
                  onClick={() => {
                    setPdfFileList([]);
                    setParsedPdfQuestions([]);
                    setParseReport({
                      status: "idle",
                      message: "",
                      filesProcessed: 0,
                      questionsDetected: 0,
                      details: [],
                    });
                  }}
                >
                  Clear
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        {parseReport.status !== "idle" && (
          <Alert
            className="!mt-4"
            type={parseReport.status === "success" ? "success" : "error"}
            showIcon
            message={parseReport.message}
            description={
              <div className="space-y-1 text-xs">
                <div>Files processed: {parseReport.filesProcessed}</div>
                <div>Questions detected: {parseReport.questionsDetected}</div>
                {parseReport.details.slice(0, 3).map((item) => (
                  <div key={`${item.fileName}-${item.length}`}>
                    {item.fileName}: {item.pages} pages, {item.length} chars, parser={item.parser || "n/a"}, {item.durationMs}ms
                  </div>
                ))}
              </div>
            }
          />
        )}

        <div className="mt-4">
          <Text type="secondary">
            Parsed preview: {parsedPdfQuestions.length} questions
          </Text>
          <Table
            className="!mt-2"
            rowKey="key"
            columns={parsedColumns}
            dataSource={parsedPdfQuestions.slice(0, 30)}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </Card>
      )}

      {stepVisibility.step5 && (
      <Card className="border border-orange-200 bg-orange-50/35 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Tag color="orange">Step 5</Tag>
          <Title level={5} className="!mb-0 !text-orange-900">
            Python PDF Jobs (quiz.py)
          </Title>
        </div>
        <Text type="secondary">
          Server-side extraction pipeline using <Text code>guru-api/pyscript/quiz.py</Text>. Use for large folders and 10k+ scaling.
        </Text>

        <Row gutter={[12, 12]} className="mt-3">
          <Col xs={24} md={8}>
            <Text strong>Paper Folder (server path)</Text>
            <Input className="!mt-1" value={pdfPaperFolder} onChange={(e) => setPdfPaperFolder(e.target.value)} />
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Output Folder (server path)</Text>
            <Input className="!mt-1" value={pdfOutputFolder} onChange={(e) => setPdfOutputFolder(e.target.value)} />
          </Col>
          <Col xs={24} md={4}>
            <Text strong>Chunk Size</Text>
            <InputNumber className="!mt-1 w-full" min={100} max={5000} value={pdfChunkSize} onChange={(v) => setPdfChunkSize(Number(v || 1000))} />
          </Col>
          <Col xs={24} md={4}>
            <Text strong>Active Job</Text>
            <Select
              className="!mt-1 w-full"
              value={activePdfJobId || undefined}
              onChange={(value) => setActivePdfJobId(value)}
              placeholder="Select job"
              options={pdfJobs.map((job) => ({ value: job.id, label: `${job.id.slice(-8)} • ${job.status}` }))}
              allowClear
            />
          </Col>
        </Row>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="primary" onClick={createPdfJob} loading={isCreatingPdfJob}>
            Create PDF Job
          </Button>
          <Button onClick={() => activePdfJobId && runPdfJob(activePdfJobId)} disabled={!activePdfJobId}>
            Run Extraction
          </Button>
          <Button onClick={() => activePdfJobId && importPdfJob(activePdfJobId)} disabled={!activePdfJobId}>
            Import Job Output
          </Button>
          <Button icon={<ReloadOutlined />} onClick={refreshPdfJobs}>
            Refresh PDF Jobs
          </Button>
        </div>

        <Table
          className="!mt-3"
          rowKey="id"
          pagination={{ pageSize: 5 }}
          dataSource={pdfJobs}
          columns={[
            {
              title: "Job",
              dataIndex: "id",
              width: 120,
              render: (value: string) => <Text code>{String(value).slice(-8)}</Text>,
            },
            {
              title: "Status",
              dataIndex: "status",
              width: 120,
              render: (value: string) => (
                <Tag color={value === "completed" ? "green" : value === "failed" ? "red" : value === "running" ? "blue" : "default"}>
                  {value}
                </Tag>
              ),
            },
            {
              title: "Folders",
              key: "folders",
              render: (_, row: PdfJobRow) => (
                <div className="text-xs text-slate-600">
                  <div>in: {row.paperFolder}</div>
                  <div>out: {row.outputFolder}</div>
                </div>
              ),
            },
            {
              title: "Output",
              key: "output",
              width: 170,
              render: (_, row: PdfJobRow) => (
                <div className="text-xs">
                  <div>files: {Number(row.outputFilesCount || 0)}</div>
                  <div>inserted: {Number(row.imported?.inserted || 0)}</div>
                  <div>dup skipped: {Number(row.imported?.duplicatesSkipped || 0)}</div>
                </div>
              ),
            },
            {
              title: "Actions",
              key: "actions",
              width: 280,
              render: (_, row: PdfJobRow) => (
                <Space>
                  <Button size="small" onClick={() => runPdfJob(row.id)} disabled={row.status === "running"}>
                    Run
                  </Button>
                  <Button size="small" type="primary" onClick={() => importPdfJob(row.id)} disabled={row.status !== "completed"}>
                    Import
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setActivePdfJobId(row.id);
                      void fetchPdfJobDetail(row.id);
                    }}
                  >
                    Details
                  </Button>
                </Space>
              ),
            },
          ]}
        />

        {activePdfJobId && (
          <Card
            loading={isLoadingPdfDetail}
            className="mt-3 border border-slate-200 bg-white/80"
            size="small"
            title={
              <div className="flex items-center gap-2">
                <Text strong>Selected Job Details</Text>
                <Tag color="default">{activePdfJobId.slice(-8)}</Tag>
                <Tag color={activePdfJobDetail?.status === "completed" ? "green" : activePdfJobDetail?.status === "failed" ? "red" : "blue"}>
                  {activePdfJobDetail?.status || "loading"}
                </Tag>
              </div>
            }
          >
            <Row gutter={[12, 8]}>
              <Col xs={12} md={6}>
                <Text type="secondary">Files Processed</Text>
                <div className="font-semibold">{Number(activePdfJobDetail?.report?.filesProcessed || 0)}</div>
              </Col>
              <Col xs={12} md={6}>
                <Text type="secondary">Extracted</Text>
                <div className="font-semibold">{Number(activePdfJobDetail?.report?.totalExtracted || 0)}</div>
              </Col>
              <Col xs={12} md={6}>
                <Text type="secondary">Unique After Dedupe</Text>
                <div className="font-semibold">{Number(activePdfJobDetail?.report?.uniqueAfterDedupe || 0)}</div>
              </Col>
              <Col xs={12} md={6}>
                <Text type="secondary">Duplicates Skipped</Text>
                <div className="font-semibold">{Number(activePdfJobDetail?.report?.duplicatesSkipped || 0)}</div>
              </Col>
            </Row>

            {Array.isArray(activePdfJobDetail?.report?.perFile) && activePdfJobDetail.report.perFile.length > 0 && (
              <div className="mt-3">
                <Text strong className="text-xs">Per-file extraction</Text>
                <Table
                  className="!mt-1"
                  size="small"
                  rowKey={(row) => `${String(row.file || "file")}-${Number(row.extracted || 0)}`}
                  dataSource={(activePdfJobDetail?.report?.perFile || []).slice(0, 20)}
                  pagination={false}
                  columns={[
                    { title: "File", dataIndex: "file", key: "file" },
                    {
                      title: "Extracted",
                      dataIndex: "extracted",
                      key: "extracted",
                      width: 120,
                      render: (value: number) => Number(value || 0),
                    },
                  ]}
                />
              </div>
            )}

            {activePdfJobDetail?.lastError ? (
              <Alert className="!mt-3" type="error" showIcon message="Last error" description={activePdfJobDetail.lastError} />
            ) : null}

            {String(activePdfJobDetail?.logs?.stderr || "").trim() ? (
              <div className="mt-3 rounded border border-rose-200 bg-rose-50 p-2">
                <Text strong className="text-xs text-rose-700">stderr (tail)</Text>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-rose-900">
                  {String(activePdfJobDetail?.logs?.stderr || "").slice(-4000)}
                </pre>
              </div>
            ) : null}
          </Card>
        )}
      </Card>
      )}

      {stepVisibility.step6 && (
      <Card className="border border-fuchsia-200 bg-fuchsia-50/35 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Tag color="magenta">Step 6</Tag>
          <Title level={5} className="!mb-0 !text-fuchsia-900">
            Manual Question Creator
          </Title>
        </div>
        <Text type="secondary">
          Add single trusted questions directly into the same question bank schema used by AI/PDF imports.
        </Text>

        <div className="mt-3">
          <Button
            type={showManualCreator ? "default" : "primary"}
            onClick={() => setShowManualCreator((prev) => !prev)}
          >
            {showManualCreator ? "Hide Manual Creator" : "Create Manual Question"}
          </Button>
        </div>

        {showManualCreator && (
          <Form form={manualForm} layout="vertical" className="mt-3">
          <Form.Item
            label="Question"
            name="question"
            rules={[{ required: true, message: "Question is required" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Form.Item label="Section" name="section">
                <Select
                  mode="tags"
                  showSearch
                  placeholder="Select or type section"
                  options={manualSectionOptions.map((section) => ({ value: section, label: section }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Topic" name="topic">
                <Select
                  mode="tags"
                  showSearch
                  placeholder="Select or type topic"
                  options={allTopicOptions.map((topic) => ({ value: topic, label: topic }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Difficulty" name="difficulty" initialValue="medium">
                <Select
                  showSearch
                  options={manualDifficultyOptions.map((level) => ({ value: level, label: level }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Question Number" name="questionNumber">
                <InputNumber min={1} max={500} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Options (one per line, max 5)"
            name="optionsText"
            rules={[
              { required: true, message: "Add at least 2 options" },
              {
                validator: (_, value) => {
                  const count = String(value || "")
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean).length;
                  if (count < 2) return Promise.reject(new Error("At least 2 options required"));
                  if (count > 5) return Promise.reject(new Error("Maximum 5 options allowed"));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.TextArea rows={5} placeholder={"Option A\nOption B\nOption C\nOption D"} />
          </Form.Item>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={8}>
              <Form.Item label="Answer (text)" name="answer" rules={[{ required: true, message: "Answer is required" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Answer Key" name="answerKey">
                <Select
                  allowClear
                  options={[
                    { value: "A", label: "A" },
                    { value: "B", label: "B" },
                    { value: "C", label: "C" },
                    { value: "D", label: "D" },
                    { value: "E", label: "E" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Explanation" name="explanation">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={6}>
              <Form.Item label="Source Exam" name="sourceExam" initialValue={domain.replace(/^Government Exam -\s*/i, "")}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Year" name="sourceYear">
                <InputNumber min={1900} max={2100} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Shift" name="sourceShift">
                <InputNumber min={1} max={20} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={10}>
              <Form.Item label="Source Type" name="sourceType" initialValue="manual">
                <Input placeholder="manual / memory-based / pyq-book" />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" onClick={saveManualQuestion} loading={isManualSaving}>
              Save Manual Question
            </Button>
            <Button onClick={() => manualForm.resetFields()}>Reset</Button>
          </Space>
          </Form>
        )}
      </Card>
      )}

      {stepVisibility.step7 && (
      <Card className="border border-indigo-200 bg-indigo-50/35 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Tag color="geekblue">Step 7</Tag>
          <Title level={5} className="!mb-0 !text-indigo-900">
            Paste ChatGPT JSON Import
          </Title>
        </div>
        <Text type="secondary">Paste JSON generated in chat.openai.com and import with schema validation.</Text>

        <div className="mt-3">
          <Input.TextArea
            rows={10}
            value={pasteJson}
            onChange={(e) => setPasteJson(e.target.value)}
            placeholder='Paste JSON array or {"questions":[...]} here'
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={buildPastePayload}>Validate JSON</Button>
          <Button type="primary" onClick={importPastedJson} loading={isImportingPaste}>
            Import Pasted JSON
          </Button>
          <Button
            onClick={() => {
              setPasteJson("");
              setPastePreview({
                valid: false,
                count: 0,
                invalidCount: 0,
                message: "",
                payload: null,
              });
            }}
          >
            Clear
          </Button>
        </div>

        {pastePreview.message && (
          <Alert
            className="!mt-3"
            type={pastePreview.valid ? "success" : "warning"}
            showIcon
            message={pastePreview.message}
            description={`Questions: ${pastePreview.count} • Invalid: ${pastePreview.invalidCount}`}
          />
        )}
      </Card>
      )}

      {stepVisibility.step8 && (
      <Card className="border border-cyan-200 bg-cyan-50/35 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Tag color="cyan">Step 8</Tag>
          <Title level={5} className="!mb-0 !text-cyan-900">
            Recent AI Generation Jobs
          </Title>
        </div>
        <Table rowKey="id" columns={columns} dataSource={jobs} pagination={{ pageSize: 10 }} />
      </Card>
      )}

      {stepVisibility.step9 && (
      <Card className="border border-lime-200 bg-lime-50/35 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Tag color="lime">Step 9</Tag>
          <Title level={5} className="!mb-0 !text-lime-900">
            Text Import
          </Title>
        </div>
        <Text type="secondary">
          Paste exam questions as text with options in format: (a) option (b) option (c) option (d) option
        </Text>

        <div className="mt-3">
          <Input.TextArea
            rows={12}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={`Paste your questions here...

Example format:
mark (?) in the following equation, if '+' and '-' are interchanged?
4515 x 5 - 431 / 3 + 821 = ?
(a) 1335 (b) 1775 (c) 1575 (d) 1375

31 is related to 152 by certain logic. Following the same logic, 47 is related to 168. To which of the following is 66 related?
(a) 144 (b) 182 (c) 156 (d) 168`}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="primary" onClick={parseTextInput} loading={isParsingText}>
            Parse Text
          </Button>
          <Button type="primary" onClick={importParsedTextQuestions} loading={isImportingPdf} disabled={parsedTextQuestions.length === 0}>
            Import {parsedTextQuestions.length} Questions
          </Button>
          <Button
            onClick={() => {
              setTextInput("");
              setParsedTextQuestions([]);
            }}
          >
            Clear
          </Button>
        </div>

        {parsedTextQuestions.length > 0 && (
          <div className="mt-4">
            <Text strong>Parsed Questions ({parsedTextQuestions.length})</Text>
            <Table
              className="!mt-2"
              rowKey="key"
              columns={parsedColumns}
              dataSource={parsedTextQuestions.slice(0, 30)}
              pagination={{ pageSize: 10 }}
            />
          </div>
        )}
      </Card>
      )}
    </div>
  );
}
