"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Divider, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Switch, Tag, Typography, message, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined, EyeOutlined, ClearOutlined, UploadOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import { GOV_EXAMS } from "@/lib/mockTestBuilder";
import { useParams } from "next/navigation";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type Difficulty = "easy" | "medium" | "hard";
type QuestionType = "mcq" | "coding" | "theory" | "output" | "scenario";
type GroupType = "none" | "rc_passage";

interface QuestionFormData {
  examSlug: string;
  stageSlug: string;
  section: string;
  topic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  groupType: GroupType;
  groupId: string;
  groupOrder: number;
  groupTitle: string;
  passageText: string;
  question: string;
  options: string[];
  answer: string;
  answerKey: string;
  explanation: string;
  assets: Array<{
    kind?: string;
    url?: string;
    alt?: string;
    width?: number | null;
    height?: number | null;
    caption?: string;
    sourcePage?: number | null;
  }>;
  tags: string[];
  sourceExam: string;
  sourceYear: number;
  sourceShift: number;
}

interface RcBulkQuestionItem {
  order: number;
  question: string;
  options: string[];
  answer: string;
  answerKey: string;
  explanation: string;
}

interface ParsedDraft {
  question: string;
  options: string[];
  answer: string;
  answerKey: string;
  explanation: string;
  rawQuestionLines: string[];
}

interface LibraryAssetItem {
  fileName: string;
  url: string;
  size?: number;
  updatedAt?: string;
}

type BlueprintSection = {
  key: string;
  label: string;
  count?: number;
  topics?: string[];
};

type BlueprintItem = {
  examSlug: string;
  stageSlug: string;
  sections?: BlueprintSection[];
};

type BlueprintResponse = {
  data?:
    | {
        sections?: BlueprintSection[];
      }
    | BlueprintItem[]
    | null;
};

const INITIAL_QUESTION: QuestionFormData = {
  examSlug: "sbi-clerk",
  stageSlug: "prelims",
  section: "",
  topic: "",
  difficulty: "medium",
  questionType: "mcq",
  groupType: "none",
  groupId: "",
  groupOrder: 1,
  groupTitle: "",
  passageText: "",
  question: "",
  options: ["", "", "", ""],
  answer: "",
  answerKey: "",
  explanation: "",
  assets: [],
  tags: [],
  sourceExam: "",
  sourceYear: new Date().getFullYear(),
  sourceShift: 1,
};

const SECTIONS: Record<string, Record<string, string[]>> = {
  "sbi-clerk": {
    prelims: ["English", "Quantitative Aptitude", "Reasoning Ability"],
    mains: ["English", "Quantitative Aptitude", "Reasoning Ability", "General Awareness"],
  },
  "ssc-cgl": {
    "tier-1": ["General Intelligence and Reasoning", "General Awareness", "Quantitative Aptitude", "English Comprehension"],
    "tier-2": ["Quantitative Abilities", "English Language and Comprehension", "Statistics", "General Studies-Finance and Economics"],
  },
  "ibps-po": {
    prelims: ["English", "Quantitative Aptitude", "Reasoning Ability"],
    mains: ["English", "Reasoning and Computer Aptitude", "Quantitative Aptitude", "General Awareness"],
  },
  "upsc-cse": {
    prelims: ["General Studies I", "General Studies II (CSAT)"],
    mains: ["General Studies I", "General Studies II", "General Studies III", "General Studies IV", "English", "Hindi"],
  },
  "rrb-ntpc": {
    "cbt-1": ["General Awareness", "Mathematics", "General Intelligence and Reasoning"],
    "cbt-2": ["General Awareness", "Mathematics", "General Intelligence and Reasoning"],
  },
  "state-psc": {
    prelims: ["General Studies", "Aptitude"],
    mains: ["General Studies I", "General Studies II"],
  },
};

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice (MCQ)" },
  { value: "coding", label: "Coding/Programming" },
  { value: "theory", label: "Theory/Concept" },
  { value: "output", label: "Output Prediction" },
  { value: "scenario", label: "Scenario Based" },
];

const QUESTION_TOPICS = [
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
  "Simplification",
  "Quadratic Equations",
  "Number Series",
  "Percentage",
  "Profit and Loss",
  "Time and Work",
  "Ratio and Proportion",
  "Average",
  "Interest",
  "Mixture and Alligation",
  "Speed, Time and Distance",
  "Boats and Streams",
  "Mensuration",
  "Algebra",
  "Trigonometry",
  "Geometry",
  "Analogy",
  "Classification",
  "Series",
  "Statement Conclusion",
  "Blood Relations",
  "Direction Sense",
  "Order and Ranking",
  "Mirror Images",
  "Venn Diagram",
  "Input Output",
  "Inequality",
  "Decision Making",
  "Critical Reasoning",
  "Vocabulary",
  "Grammar",
  "Sentence Improvement",
  "Sentence Completion",
  "Idioms and Phrases",
  "One Word Substitution",
  "Synonyms Antonyms",
  "Active Passive",
  "Direct Indirect",
];

const splitPastedQuestionBlocks = (input: string): string[] => {
  const source = String(input || "").replace(/\r/g, "").trim();
  if (!source) return [];
  const separatorPattern = /^\s*-{3,}\s*$/m;

  if (separatorPattern.test(source)) {
    return source
      .split(/\n\s*-{3,}\s*\n/g)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  const lines = source.split("\n");
  const startPattern = /^(?:Q(?:uestion)?\s*)?\d+\s*[\).:\-]\s+/i;
  const startIndices = lines
    .map((line, index) => (startPattern.test(String(line || "").trim()) ? index : -1))
    .filter((index) => index >= 0);

  if (startIndices.length > 1) {
    const blocks: string[] = [];
    for (let i = 0; i < startIndices.length; i += 1) {
      const start = startIndices[i];
      const end = i + 1 < startIndices.length ? startIndices[i + 1] : lines.length;
      const chunk = lines.slice(start, end).join("\n").trim();
      if (chunk) blocks.push(chunk);
    }
    return blocks;
  }

  const byBlank = source
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (byBlank.length > 1) return byBlank;

  return [source];
};

const normalizeOptionToken = (value: string): string => {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return "";
  if (/^[A-F]$/.test(raw)) return raw;
  if (/^[1-6]$/.test(raw)) return String.fromCharCode(64 + Number(raw));
  return "";
};

const parseBlackboardDraft = (input: string): ParsedDraft => {
  const source = String(input || "").trim();
  if (!source) {
    return {
      question: "",
      options: ["", "", "", "", "", ""],
      answer: "",
      answerKey: "",
      explanation: "",
      rawQuestionLines: [],
    };
  }

  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const questionStartPattern = /^(?:Q(?:uestion)?\s*)?\d+\s*[\).:\-]\s+(.+)$/i;

  const answerKeyMatch = source.match(/\b(?:answer\s*key|ans(?:wer)?|correct\s*option)\s*[:\-]?\s*([A-F])\b/i);
  const explanationMatch = source.match(/\b(?:explanation|solution)\s*[:\-]?\s*([\s\S]*)$/i);
  const optionPattern = /^\(?\s*([A-Fa-f1-6])\s*\)?\s*[\).:\-]?\s+(.+)$/;
  const inlineOptionPattern = /(?:^|\s)\(?\s*([A-Fa-f1-6])\s*\)?\s*[\).:\-]\s*(.+?)(?=(?:\s+\(?\s*[A-Fa-f1-6]\s*\)?\s*[\).:\-]\s*)|$)/g;
  const optionsMap = new Map<string, string>();
  const questionLines: string[] = [];

  for (let idx = 0; idx < lines.length; idx += 1) {
    const line = lines[idx];
    const questionStartMatch = line.match(questionStartPattern);
    if (idx === 0 && questionStartMatch) {
      questionLines.push(String(questionStartMatch[1] || "").trim());
      continue;
    }

    const optionMatch = line.match(optionPattern);
    if (optionMatch) {
      const key = normalizeOptionToken(optionMatch[1] || "");
      const value = String(optionMatch[2] || "").trim();
      if (key && value) optionsMap.set(key, value);
      continue;
    }

    const inlineMatches = Array.from(line.matchAll(inlineOptionPattern));
    if (inlineMatches.length >= 2) {
      for (const match of inlineMatches) {
        const key = normalizeOptionToken(match[1] || "");
        const value = String(match[2] || "").trim();
        if (key && value) optionsMap.set(key, value);
      }
      continue;
    }

    if (/^(answer\s*key|ans(?:wer)?|correct\s*option|explanation|solution)\b/i.test(line)) {
      continue;
    }
    questionLines.push(line);
  }

  const optionOrder = ["A", "B", "C", "D", "E", "F"];
  const normalizedOptions = optionOrder.map((key) => optionsMap.get(key) || "");
  const resolvedAnswerKey = String(answerKeyMatch?.[1] || "").toUpperCase();
  const resolvedAnswer =
    (resolvedAnswerKey && optionsMap.get(resolvedAnswerKey)) ||
    String(source.match(/\b(?:answer|correct\s*answer)\s*[:\-]?\s*([^\n]+)/i)?.[1] || "").trim();

  return {
    question: questionLines.join("\n").trim(),
    options: normalizedOptions,
    answer: resolvedAnswer,
    answerKey: resolvedAnswerKey,
    explanation: String(explanationMatch?.[1] || "").trim(),
    rawQuestionLines: questionLines,
  };
};

export default function QuestionPublisherPage() {
  const [form] = Form.useForm();
  const params = useParams<{ lang: string }>();
  const language = String(params?.lang || "en").toLowerCase();
  const assetInputRef = useRef<HTMLInputElement | null>(null);
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionFormData>({ ...INITIAL_QUESTION });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [allBlueprints, setAllBlueprints] = useState<BlueprintItem[]>([]);
  const [blueprintSections, setBlueprintSections] = useState<BlueprintSection[]>([]);
  const [rcSetQuestions, setRcSetQuestions] = useState<RcBulkQuestionItem[]>([
    { order: 1, question: "", options: ["", "", "", ""], answer: "", answerKey: "", explanation: "" },
  ]);
  const [blackboardText, setBlackboardText] = useState("");
  const [autoFillFromPad, setAutoFillFromPad] = useState(true);
  const [isAssetUploading, setIsAssetUploading] = useState(false);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
  const [assetLibraryItems, setAssetLibraryItems] = useState<LibraryAssetItem[]>([]);
  const [isAssetLibraryLoading, setIsAssetLibraryLoading] = useState(false);
  const [assetLibrarySearch, setAssetLibrarySearch] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const STORAGE_KEY = "question-publisher-work";

  const saveWork = useCallback(() => {
    const workData = {
      questions,
      currentQuestion,
      rcSetQuestions,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workData));
    setHasUnsavedChanges(false);
    message.success("Work saved! Your progress will persist after reload.");
  }, [questions, currentQuestion, rcSetQuestions]);

  const loadSavedWork = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && typeof data === 'object') {
          if (Array.isArray(data.questions)) setQuestions(data.questions);
          if (data.currentQuestion) setCurrentQuestion(data.currentQuestion);
          if (Array.isArray(data.rcSetQuestions)) setRcSetQuestions(data.rcSetQuestions);
          message.info("Your saved work has been loaded!");
          return true;
        }
      } catch (e) {
        console.warn('Failed to load saved work:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return false;
  }, []);

  useEffect(() => {
    void loadSavedWork();
  }, [loadSavedWork]);

  useEffect(() => {
    if (questions.length > 0 || currentQuestion.question) {
      setHasUnsavedChanges(true);
      const timer = setTimeout(() => {
        saveWork();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [questions, currentQuestion, saveWork]);
  const parsedDraft = useMemo(() => parseBlackboardDraft(blackboardText), [blackboardText]);
  const filteredAssetLibraryItems = useMemo(() => {
    const search = String(assetLibrarySearch || "").trim().toLowerCase();
    if (!search) return assetLibraryItems;
    return assetLibraryItems.filter((item) => String(item.fileName || "").toLowerCase().includes(search));
  }, [assetLibraryItems, assetLibrarySearch]);

  const examOptions = useMemo(() => {
    if (allBlueprints.length > 0) {
      const seen = new Set<string>();
      return allBlueprints
        .map((item) => String(item.examSlug || "").trim())
        .filter((slug) => {
          if (!slug || seen.has(slug)) return false;
          seen.add(slug);
          return true;
        })
        .map((slug) => ({
          value: slug,
          label: GOV_EXAMS.find((exam) => exam.slug === slug)?.name || slug,
        }));
    }
    return GOV_EXAMS.map((exam) => ({ value: exam.slug, label: exam.name }));
  }, [allBlueprints]);

  const examStages = useMemo(() => {
    if (!currentQuestion.examSlug) return [];
    if (allBlueprints.length > 0) {
      const seen = new Set<string>();
      return allBlueprints
        .filter((item) => item.examSlug === currentQuestion.examSlug)
        .map((item) => String(item.stageSlug || "").trim())
        .filter((stageSlug) => {
          if (!stageSlug || seen.has(stageSlug)) return false;
          seen.add(stageSlug);
          return true;
        })
        .map((stageSlug) => {
          const exam = GOV_EXAMS.find((e) => e.slug === currentQuestion.examSlug);
          const stageMeta = exam?.stages.find((stage) => stage.slug === stageSlug);
          return { slug: stageSlug, name: stageMeta?.name || stageSlug };
        });
    }
    const exam = GOV_EXAMS.find((e) => e.slug === currentQuestion.examSlug);
    return exam?.stages || [];
  }, [allBlueprints, currentQuestion.examSlug]);

  const availableSections = useMemo(() => {
    if (blueprintSections.length > 0) {
      return blueprintSections.map((section) => ({
        value: section.key,
        label:
          String(section.label || "").trim() && section.label !== section.key
            ? `${section.label} (${section.key})`
            : section.key,
      }));
    }
    return (SECTIONS[currentQuestion.examSlug]?.[currentQuestion.stageSlug] || []).map((section) => ({
      value: section.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      label: section,
    }));
  }, [blueprintSections, currentQuestion.examSlug, currentQuestion.stageSlug]);

  const filteredTopics = useMemo(() => {
    const sectionFromBlueprint = blueprintSections.find((section) => section.key === currentQuestion.section);
    if (sectionFromBlueprint && Array.isArray(sectionFromBlueprint.topics) && sectionFromBlueprint.topics.length > 0) {
      return sectionFromBlueprint.topics.map((topic) => String(topic).trim()).filter(Boolean);
    }
    const section = currentQuestion.section.toLowerCase();
    if (section.includes("english")) {
      return QUESTION_TOPICS.filter((t) =>
        ["Reading Comprehension", "Cloze Test", "Fill in the blanks", "Error Detection", "Para Jumbles",
         "Vocabulary", "Grammar", "Sentence Improvement", "Sentence Completion", "Idioms and Phrases",
         "One Word Substitution", "Synonyms Antonyms", "Active Passive", "Direct Indirect"].includes(t)
      );
    }
    if (section.includes("quant") || section.includes("mathematics") || section.includes("aptitude")) {
      return QUESTION_TOPICS.filter((t) =>
        ["Data Interpretation", "Simplification", "Quadratic Equations", "Number Series", "Percentage",
         "Profit and Loss", "Time and Work", "Ratio and Proportion", "Average", "Interest",
         "Mixture and Alligation", "Speed, Time and Distance", "Boats and Streams", "Mensuration",
         "Algebra", "Trigonometry", "Geometry", "Mathematical Word Problems"].includes(t)
      );
    }
    if (section.includes("reasoning")) {
      return QUESTION_TOPICS.filter((t) =>
        ["Puzzle / Seating Arrangement", "Coding Decoding", "Syllogism", "Statement based MCQ",
         "Assertion Reason", "Analogy", "Classification", "Series", "Statement Conclusion",
         "Blood Relations", "Direction Sense", "Order and Ranking", "Mirror Images", "Venn Diagram",
         "Input Output", "Inequality", "Decision Making", "Critical Reasoning"].includes(t)
      );
    }
    return QUESTION_TOPICS;
  }, [blueprintSections, currentQuestion.section]);

  const buildRcSetId = () => {
    const exam = String(currentQuestion.examSlug || "exam").trim();
    const stage = String(currentQuestion.stageSlug || "stage").trim();
    const section = String(currentQuestion.section || "section").trim();
    const stamp = Date.now().toString(36);
    const base = `${exam}-${stage}-${section}-${stamp}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return `rc-${base}`;
  };

  const applyParsedDraftToForm = () => {
    if (!blackboardText.trim()) {
      message.error("Paste content in blackboard first");
      return;
    }
    const nextQuestionText = parsedDraft.question;
    if (!nextQuestionText) {
      message.error("Could not detect question text from pasted content");
      return;
    }

    const next = {
      ...currentQuestion,
      question: nextQuestionText,
      options: parsedDraft.options.some(Boolean) ? parsedDraft.options : currentQuestion.options,
      answer: parsedDraft.answer || currentQuestion.answer,
      answerKey: parsedDraft.answerKey || currentQuestion.answerKey,
      explanation: parsedDraft.explanation || currentQuestion.explanation,
    };

    setCurrentQuestion(next);
    form.setFieldsValue({
      question: next.question,
      options: next.options,
      answer: next.answer,
      answerKey: next.answerKey || undefined,
      explanation: next.explanation,
    });
    message.success("Parsed draft applied to form");
  };

  const handleParseMultipleToBatch = async () => {
    const source = String(blackboardText || "").trim();
    if (!source) {
      message.error("Paste multiple questions first");
      return;
    }

    const requiredFields = [
      "examSlug",
      "stageSlug",
      "section",
      "topic",
      "difficulty",
      "questionType",
      "groupType",
    ];
    if (currentQuestion.groupType === "rc_passage") {
      requiredFields.push("groupId", "groupTitle", "passageText");
    }
    try {
      await form.validateFields(requiredFields);
    } catch {
      return;
    }

    const blocks = splitPastedQuestionBlocks(source);
    const parsedRows = blocks.map((block) => parseBlackboardDraft(block)).filter((row) => row.question);
    if (parsedRows.length === 0) {
      message.error("No valid questions detected");
      return;
    }

    const baseOrder = Number(currentQuestion.groupOrder || 1);
    const nextItems: QuestionFormData[] = parsedRows.map((row, idx) => ({
      ...currentQuestion,
      question: row.question,
      options: row.options.some(Boolean) ? row.options : currentQuestion.options,
      answer: row.answer || currentQuestion.answer,
      answerKey: (row.answerKey || currentQuestion.answerKey || "").toUpperCase(),
      explanation: row.explanation || currentQuestion.explanation,
      groupOrder: currentQuestion.groupType === "rc_passage" ? baseOrder + idx : 1,
    }));

    setQuestions((prev) => [...prev, ...nextItems]);

    if (currentQuestion.groupType === "rc_passage") {
      const nextOrder = baseOrder + nextItems.length;
      setCurrentQuestion((prev) => ({ ...prev, groupOrder: nextOrder }));
      form.setFieldsValue({ groupOrder: nextOrder });
    }

    message.success(`Added ${nextItems.length} questions to batch`);
  };

  const syncParsedToForm = useCallback((parsed: ParsedDraft, onlyEmpty = false) => {
    if (!parsed.question && !parsed.answer && !parsed.answerKey && !parsed.options.some(Boolean) && !parsed.explanation) {
      return;
    }
    const next = { ...currentQuestion };
    let changed = false;

    if (parsed.question && (!onlyEmpty || !String(next.question || "").trim())) {
      next.question = parsed.question;
      changed = true;
    }
    if (parsed.answer && (!onlyEmpty || !String(next.answer || "").trim())) {
      next.answer = parsed.answer;
      changed = true;
    }
    if (parsed.answerKey && (!onlyEmpty || !String(next.answerKey || "").trim())) {
      next.answerKey = parsed.answerKey;
      changed = true;
    }
    if (parsed.explanation && (!onlyEmpty || !String(next.explanation || "").trim())) {
      next.explanation = parsed.explanation;
      changed = true;
    }
    if (parsed.options.some(Boolean)) {
      const nextOptions = [...next.options];
      for (let idx = 0; idx < parsed.options.length; idx += 1) {
        const parsedOption = String(parsed.options[idx] || "").trim();
        if (!parsedOption) continue;
        if (!onlyEmpty || !String(nextOptions[idx] || "").trim()) {
          nextOptions[idx] = parsedOption;
          changed = true;
        }
      }
      next.options = nextOptions;
    }

    if (!changed) return;
    setCurrentQuestion(next);
    form.setFieldsValue({
      question: next.question,
      answer: next.answer,
      answerKey: next.answerKey || undefined,
      explanation: next.explanation,
      options: next.options,
    });
  }, [currentQuestion, form]);

  useEffect(() => {
    if (!autoFillFromPad) return;
    syncParsedToForm(parsedDraft, true);
  }, [autoFillFromPad, parsedDraft, syncParsedToForm]);

  const createEmptyRcItem = (order: number): RcBulkQuestionItem => ({
    order,
    question: "",
    options: ["", "", "", ""],
    answer: "",
    answerKey: "",
    explanation: "",
  });

  const updateRcItem = (index: number, patch: Partial<RcBulkQuestionItem>) => {
    setRcSetQuestions((prev) => {
      const next = [...prev];
      const base = next[index] || createEmptyRcItem(index + 1);
      next[index] = { ...base, ...patch };
      return next;
    });
  };

  const updateRcOption = (itemIndex: number, optionIndex: number, value: string) => {
    setRcSetQuestions((prev) => {
      const next = [...prev];
      const base = next[itemIndex] || createEmptyRcItem(itemIndex + 1);
      const options = [...(Array.isArray(base.options) ? base.options : ["", "", "", ""])];
      options[optionIndex] = value;
      next[itemIndex] = { ...base, options };
      return next;
    });
  };

  const addRcOptionField = (itemIndex: number) => {
    setRcSetQuestions((prev) => {
      const next = [...prev];
      const base = next[itemIndex] || createEmptyRcItem(itemIndex + 1);
      const options = Array.isArray(base.options) ? [...base.options] : ["", "", "", ""];
      if (options.length >= 6) return prev;
      options.push("");
      next[itemIndex] = { ...base, options };
      return next;
    });
  };

  const removeRcOptionField = (itemIndex: number, optionIndex: number) => {
    setRcSetQuestions((prev) => {
      const next = [...prev];
      const base = next[itemIndex] || createEmptyRcItem(itemIndex + 1);
      const options = Array.isArray(base.options) ? [...base.options] : ["", "", "", ""];
      if (options.length <= 4) return prev;
      const filtered = options.filter((_, idx) => idx !== optionIndex);
      next[itemIndex] = { ...base, options: filtered };
      return next;
    });
  };

  const addRcSetItem = () => {
    setRcSetQuestions((prev) => [...prev, createEmptyRcItem(prev.length + 1)]);
  };

  const removeRcSetItem = (index: number) => {
    setRcSetQuestions((prev) =>
      prev
        .filter((_, idx) => idx !== index)
        .map((item, idx) => ({ ...item, order: idx + 1 }))
    );
  };

  const handleAddRcSetToBatch = async () => {
    if (currentQuestion.groupType !== "rc_passage") {
      message.error("Switch Group Type to RC first");
      return;
    }

    try {
      await form.validateFields([
        "examSlug",
        "stageSlug",
        "section",
        "topic",
        "difficulty",
        "questionType",
        "groupType",
        "groupId",
        "groupTitle",
        "passageText",
      ]);
    } catch {
      return;
    }

    const normalized = rcSetQuestions
      .map((item, idx) => ({
        ...item,
        order: idx + 1,
        question: String(item.question || "").trim(),
        options: (Array.isArray(item.options) ? item.options : []).map((opt) => String(opt || "").trim()),
        answer: String(item.answer || "").trim(),
        answerKey: String(item.answerKey || "").trim().toUpperCase(),
        explanation: String(item.explanation || "").trim(),
      }))
      .filter((item) => item.question);

    if (normalized.length === 0) {
      message.error("Add at least one RC question");
      return;
    }

    const hasInvalid = normalized.some((item) => item.options.filter(Boolean).length < 2 || !item.answer);
    if (hasInvalid) {
      message.error("Each RC question needs minimum 2 options and answer");
      return;
    }

    const batchItems: QuestionFormData[] = normalized.map((item) => ({
      ...currentQuestion,
      question: item.question,
      options: item.options,
      answer: item.answer,
      answerKey: item.answerKey,
      explanation: item.explanation,
      groupOrder: item.order,
    }));

    setQuestions((prev) => [...prev, ...batchItems]);
    setRcSetQuestions([createEmptyRcItem(normalized.length + 1)]);
    setCurrentQuestion((prev) => ({
      ...prev,
      groupOrder: normalized.length + 1,
    }));
    form.setFieldsValue({ groupOrder: normalized.length + 1 });
    message.success(`Added ${batchItems.length} RC questions to batch`);
  };

  useEffect(() => {
    const loadAllBlueprints = async () => {
      try {
        const response = await apiClient.get<BlueprintResponse>(API_ENDPOINTS.paperBlueprints.get);
        const rows = Array.isArray(response.data?.data)
          ? response.data.data
              .filter(
                (item): item is BlueprintItem =>
                  Boolean(item && typeof item === "object" && item.examSlug && item.stageSlug)
              )
              .map((item) => ({
                examSlug: String(item.examSlug || "").trim(),
                stageSlug: String(item.stageSlug || "").trim(),
                sections: Array.isArray(item.sections) ? item.sections : [],
              }))
          : [];
        setAllBlueprints(rows);
        if (rows.length === 0) return;
        setCurrentQuestion((prev) => {
          const exists = rows.some(
            (item) => item.examSlug === prev.examSlug && item.stageSlug === prev.stageSlug
          );
          if (exists) return prev;
          const first = rows[0];
          form.setFieldsValue({
            examSlug: first.examSlug,
            stageSlug: first.stageSlug,
            section: undefined,
            topic: undefined,
          });
          return {
            ...prev,
            examSlug: first.examSlug,
            stageSlug: first.stageSlug,
            section: "",
            topic: "",
          };
        });
      } catch {
        setAllBlueprints([]);
      }
    };
    void loadAllBlueprints();
  }, [form]);

  useEffect(() => {
    const loadBlueprintSections = async () => {
      if (!currentQuestion.examSlug || !currentQuestion.stageSlug) {
        setBlueprintSections([]);
        return;
      }
      try {
        const response = await apiClient.get<BlueprintResponse>(API_ENDPOINTS.paperBlueprints.get, {
          params: { examSlug: currentQuestion.examSlug, stageSlug: currentQuestion.stageSlug },
        });
        const payload = response.data?.data;
        const sections =
          !Array.isArray(payload) && Array.isArray(payload?.sections) ? payload.sections || [] : [];
        setBlueprintSections(sections);
      } catch {
        setBlueprintSections([]);
      }
    };
    void loadBlueprintSections();
  }, [currentQuestion.examSlug, currentQuestion.stageSlug]);

  useEffect(() => {
    if (availableSections.length === 0) return;
    const hasCurrentSection = availableSections.some((section) => section.value === currentQuestion.section);
    if (hasCurrentSection) return;
    const firstSection = String(availableSections[0]?.value || "");
    setCurrentQuestion((prev) => ({
      ...prev,
      section: firstSection,
      topic: "",
    }));
    form.setFieldsValue({ section: firstSection, topic: undefined });
  }, [availableSections, currentQuestion.section, form]);

  const handleAddQuestion = async () => {
    try {
      await form.validateFields();
      setQuestions([...questions, { ...currentQuestion, answerKey: String(currentQuestion.answerKey || "").toUpperCase() }]);
      const nextDraft: QuestionFormData = {
        ...INITIAL_QUESTION,
        examSlug: currentQuestion.examSlug,
        stageSlug: currentQuestion.stageSlug,
        section: currentQuestion.section,
        groupType: currentQuestion.groupType,
        groupId: currentQuestion.groupType === "rc_passage" ? currentQuestion.groupId : "",
        groupOrder: currentQuestion.groupType === "rc_passage" ? Number(currentQuestion.groupOrder || 1) + 1 : 1,
        groupTitle: currentQuestion.groupType === "rc_passage" ? currentQuestion.groupTitle : "",
        passageText: currentQuestion.groupType === "rc_passage" ? currentQuestion.passageText : "",
      };
      setCurrentQuestion(nextDraft);
      setSelectedIndex(null);
      form.setFieldsValue(nextDraft);
      message.success("Question added to batch");
    } catch {
      // validation errors shown by form
    }
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setSelectedIndex(index);
    form.setFieldsValue(questions[index]);
  };

  const handleUpdateQuestion = async () => {
    if (selectedIndex === null) return;
    try {
      await form.validateFields();
      const updated = [...questions];
      updated[selectedIndex] = { ...currentQuestion, answerKey: String(currentQuestion.answerKey || "").toUpperCase() };
      setQuestions(updated);
      setSelectedIndex(null);
      const nextDraft: QuestionFormData = {
        ...INITIAL_QUESTION,
        examSlug: currentQuestion.examSlug,
        stageSlug: currentQuestion.stageSlug,
        section: currentQuestion.section,
        groupType: currentQuestion.groupType,
        groupId: currentQuestion.groupType === "rc_passage" ? currentQuestion.groupId : "",
        groupOrder: currentQuestion.groupType === "rc_passage" ? Number(currentQuestion.groupOrder || 1) : 1,
        groupTitle: currentQuestion.groupType === "rc_passage" ? currentQuestion.groupTitle : "",
        passageText: currentQuestion.groupType === "rc_passage" ? currentQuestion.passageText : "",
      };
      setCurrentQuestion(nextDraft);
      form.setFieldsValue(nextDraft);
      message.success("Question updated");
    } catch {
      // validation errors shown by form
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    if (selectedIndex === index) {
      setSelectedIndex(null);
      form.resetFields();
      setCurrentQuestion({ ...INITIAL_QUESTION, examSlug: currentQuestion.examSlug, stageSlug: currentQuestion.stageSlug });
    }
    message.success("Question removed");
  };

  const handleClearAll = () => {
    setQuestions([]);
    setCurrentQuestion({ ...INITIAL_QUESTION });
    setSelectedIndex(null);
    form.resetFields();
    message.info("All questions cleared");
  };

  const handleSaveAll = async () => {
    if (questions.length === 0) {
      message.error("No questions to save");
      return;
    }

    setIsSaving(true);
    try {
      const examMeta = GOV_EXAMS.find((exam) => exam.slug === questions[0]?.examSlug);
      const stageMeta = examMeta?.stages.find((stage) => stage.slug === questions[0]?.stageSlug);
      const resolvedDomain = `${examMeta?.name || questions[0]?.examSlug || "Government Exam"}${stageMeta?.name ? ` - ${stageMeta.name}` : ""}`.trim();

      const payload = {
        domain: resolvedDomain,
        language,
        reviewStatus: "approved",
        questions: questions.map((q) => ({
          examSlug: q.examSlug,
          stageSlug: q.stageSlug,
          domain: `${GOV_EXAMS.find((exam) => exam.slug === q.examSlug)?.name || q.examSlug}${GOV_EXAMS
            .find((exam) => exam.slug === q.examSlug)
            ?.stages.find((stage) => stage.slug === q.stageSlug)?.name
            ? ` - ${
                GOV_EXAMS.find((exam) => exam.slug === q.examSlug)?.stages.find((stage) => stage.slug === q.stageSlug)?.name
              }`
            : ""}`.trim(),
          language,
          section: q.section,
          topic: q.topic,
          difficulty: q.difficulty,
          type: q.questionType,
          groupType: q.groupType,
          groupId: q.groupType === "rc_passage" ? q.groupId : "",
          groupOrder: q.groupType === "rc_passage" ? Number(q.groupOrder || 1) : null,
          groupTitle: q.groupType === "rc_passage" ? q.groupTitle : "",
          passageText: q.groupType === "rc_passage" ? q.passageText : "",
          question: q.question,
          options: (Array.isArray(q.options) ? q.options : []).filter(Boolean),
          answer: q.answer,
          answerKey: q.answerKey,
          reviewStatus: "approved",
          explanation: q.explanation,
          hasVisual: (Array.isArray(q.assets) ? q.assets : []).some((asset) => Boolean(String(asset?.url || "").trim())),
          assets: (Array.isArray(q.assets) ? q.assets : []).filter((asset) => Boolean(String(asset?.url || "").trim())),
          tags: q.tags,
          source: {
            exam: q.sourceExam,
            year: q.sourceYear,
            shift: q.sourceShift,
          },
        })),
      };

      const response = await apiClient.post(API_ENDPOINTS.questionBank.bulkCreate, payload);
      if (response.data?.success) {
        message.success(`Successfully saved ${questions.length} questions`);
        setQuestions([]);
      } else {
        message.error(response.data?.message || "Failed to save questions");
      }
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === "string"
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message as string)
          : "Failed to save questions";
      message.error(apiMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const currentOptions = Array.isArray(currentQuestion.options) ? currentQuestion.options : ["", "", "", ""];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleAddOption = () => {
    const currentOptions = Array.isArray(currentQuestion.options) ? currentQuestion.options : ["", "", "", ""];
    if (currentOptions.length < 6) {
      setCurrentQuestion({ ...currentQuestion, options: [...currentOptions, ""] });
    }
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = Array.isArray(currentQuestion.options) ? currentQuestion.options : ["", "", "", ""];
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== index);
      setCurrentQuestion({ ...currentQuestion, options: newOptions });
    }
  };

  const handleSelectCorrectOption = (index: number) => {
    const optionLabels = ["A", "B", "C", "D", "E", "F"];
    const options = Array.isArray(currentQuestion.options) ? currentQuestion.options : [];
    const label = optionLabels[index] || "";
    const text = String(options[index] || "").trim();
    const next = {
      ...currentQuestion,
      answerKey: label,
      answer: text,
    };
    setCurrentQuestion(next);
    form.setFieldsValue({
      answerKey: label || undefined,
      answer: text,
    });
  };

  const loadAssetLibrary = useCallback(async () => {
    setIsAssetLibraryLoading(true);
    try {
      const response = await fetch("/api/admin/question-assets", { method: "GET" });
      const payload = (await response.json()) as { data?: { items?: LibraryAssetItem[] } };
      setAssetLibraryItems(Array.isArray(payload?.data?.items) ? payload.data?.items || [] : []);
    } catch {
      setAssetLibraryItems([]);
      message.error("Failed to load asset library.");
    } finally {
      setIsAssetLibraryLoading(false);
    }
  }, []);

  const uploadAssetFile = useCallback(async (file: File) => {
    setIsAssetUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/question-assets", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { data?: { url?: string; fileName?: string }; error?: string };
      if (!response.ok) throw new Error(String(payload?.error || "Upload failed"));
      const nextUrl = String(payload?.data?.url || "").trim();
      if (!nextUrl) throw new Error("Upload returned empty URL");
      setCurrentQuestion((prev) => ({
        ...prev,
        assets: [
          ...(Array.isArray(prev.assets) ? prev.assets : []),
          { kind: "image", url: nextUrl, alt: String(payload?.data?.fileName || "Question image") },
        ],
      }));
      message.success("Image uploaded.");
      void loadAssetLibrary();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setIsAssetUploading(false);
    }
  }, [loadAssetLibrary]);

  const renderRCFields = () => {
    if (currentQuestion.groupType !== "rc_passage") return null;

    return (
      <Card size="small" className="!mb-4" title="Reading Passage (RC)">
        <Row gutter={12}>
          <Col span={16}>
            <Form.Item
              label="RC Set ID"
              name="groupId"
              rules={[{ required: currentQuestion.groupType === "rc_passage", message: "RC Set ID is required" }]}
              extra="Use same RC Set ID for all questions from this passage."
            >
              <Input placeholder="e.g., rc-ssc-cgl-tier-1-english-set-1" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Question Order"
              name="groupOrder"
              rules={[{ required: currentQuestion.groupType === "rc_passage", message: "Order is required" }]}
            >
              <InputNumber className="!w-full" min={1} max={100} />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="dashed"
          size="small"
          className="!mb-3"
          onClick={() => {
            const nextId = buildRcSetId();
            const next = { ...currentQuestion, groupId: nextId, groupOrder: 1 };
            setCurrentQuestion(next);
            form.setFieldsValue({ groupId: nextId, groupOrder: 1 });
          }}
        >
          Generate New RC Set ID
        </Button>
        <Form.Item label="Passage Title" name="groupTitle">
          <Input placeholder="e.g., Climate Change Impact on Agriculture" />
        </Form.Item>
        <Form.Item label="Passage Text" name="passageText">
          <TextArea
            rows={6}
            placeholder="Paste the reading passage here..."
            showCount
            maxLength={12000}
          />
        </Form.Item>
        <Divider className="!my-3" />
        <div className="!mb-2 flex items-center justify-between">
          <Text strong>RC Questions (Bulk)</Text>
          <Space>
            <Button size="small" onClick={addRcSetItem}>
              Add RC Question
            </Button>
            <Button type="primary" size="small" onClick={handleAddRcSetToBatch}>
              Add Full RC Set To Batch
            </Button>
          </Space>
        </div>
        <Space direction="vertical" className="!w-full">
          {rcSetQuestions.map((item, idx) => (
            <Card
              key={`rc-set-item-${idx}`}
              size="small"
              title={`RC Question ${idx + 1}`}
              extra={
                rcSetQuestions.length > 1 ? (
                  <Button danger type="text" size="small" icon={<DeleteOutlined />} onClick={() => removeRcSetItem(idx)} />
                ) : null
              }
            >
              <Form.Item label="Question">
                <TextArea
                  rows={3}
                  value={item.question}
                  onChange={(e) => updateRcItem(idx, { question: e.target.value })}
                  placeholder="Enter RC question text"
                />
              </Form.Item>
              <Row gutter={8}>
                {item.options.map((opt, optIdx) => (
                  <Col span={12} key={`rc-opt-${idx}-${optIdx}`}>
                    <Form.Item label={`Option ${["A", "B", "C", "D"][optIdx] || String(optIdx + 1)}`}>
                      <Space.Compact style={{ width: "100%" }}>
                        <Input
                          value={opt}
                          onChange={(e) => updateRcOption(idx, optIdx, e.target.value)}
                          placeholder={`Option ${["A", "B", "C", "D", "E", "F"][optIdx] || String(optIdx + 1)}`}
                        />
                        <Button
                          type={item.answerKey === ["A", "B", "C", "D", "E", "F"][optIdx] ? "primary" : "default"}
                          onClick={() =>
                            updateRcItem(idx, {
                              answerKey: ["A", "B", "C", "D", "E", "F"][optIdx],
                              answer: String(opt || "").trim(),
                            })
                          }
                        >
                          {["A", "B", "C", "D", "E", "F"][optIdx]}
                        </Button>
                        {item.options.length > 4 && (
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeRcOptionField(idx, optIdx)}
                          />
                        )}
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                ))}
              </Row>
              <Button
                type="dashed"
                size="small"
                onClick={() => addRcOptionField(idx)}
                disabled={(Array.isArray(item.options) ? item.options : []).length >= 6}
              >
                Add Option (E/F)
              </Button>
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item label="Answer">
                    <Input
                      value={item.answer}
                      onChange={(e) => updateRcItem(idx, { answer: e.target.value })}
                      placeholder="Correct answer text"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Answer Key">
                    <Select
                      value={item.answerKey || undefined}
                      allowClear
                      onChange={(value) => updateRcItem(idx, { answerKey: String(value || "").toUpperCase() })}
                      options={(Array.isArray(item.options) ? item.options : [])
                        .map((_, optionIdx) => ["A", "B", "C", "D", "E", "F"][optionIdx])
                        .filter(Boolean)
                        .map((label) => ({ value: label, label: `Option ${label}` }))}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Explanation">
                <TextArea
                  rows={2}
                  value={item.explanation}
                  onChange={(e) => updateRcItem(idx, { explanation: e.target.value })}
                  placeholder="Optional explanation"
                />
              </Form.Item>
            </Card>
          ))}
        </Space>
      </Card>
    );
  };

  const renderQuestionFields = () => {
    const isRcMode = currentQuestion.groupType === "rc_passage";
    const optionLabels = ["A", "B", "C", "D", "E", "F"];
    const safeOptions = (Array.isArray(currentQuestion.options) ? currentQuestion.options : []).slice(0, optionLabels.length);

    return (
      <>
        <Form.Item
          label="Question Text"
          name="question"
          rules={[{ required: true, message: "Please enter question text" }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter the question..."
            showCount
            maxLength={6000}
          />
        </Form.Item>

        {!isRcMode && (
          <div className="!mb-4">
            <Text strong className="!block !mb-2">Options</Text>
            <Space direction="vertical" className="!w-full" size="middle">
              {safeOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Tag className="!w-8 !text-center">{optionLabels[idx]}</Tag>
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${optionLabels[idx]}`}
                    className="!flex-1"
                  />
                  <Button
                    type={currentQuestion.answerKey === optionLabels[idx] ? "primary" : "default"}
                    onClick={() => handleSelectCorrectOption(idx)}
                  >
                    {optionLabels[idx]}
                  </Button>
                  {safeOptions.length > 2 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveOption(idx)}
                    />
                  )}
                </div>
              ))}
              {safeOptions.length < 6 && (
                <Button type="dashed" onClick={handleAddOption} icon={<PlusOutlined />}>
                  Add Option
                </Button>
              )}
            </Space>
          </div>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Correct Answer"
              name="answer"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter correct answer text or option letter (A/B/C/D)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Answer Key (Letter)" name="answerKey">
              <Select
                placeholder="Select correct option"
                options={safeOptions
                  .map((_, idx) => optionLabels[idx])
                  .filter(Boolean)
                  .map((label) => ({
                    value: label,
                    label: `Option ${label}`,
                  }))}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Explanation" name="explanation">
          <TextArea
            rows={4}
            placeholder="Enter explanation for the answer..."
            showCount
            maxLength={6000}
          />
        </Form.Item>

        <Card size="small" className="!mb-4" title="Question Assets">
          <Space className="!mb-3">
            <Button
              size="small"
              icon={<UploadOutlined />}
              loading={isAssetUploading}
              onClick={() => assetInputRef.current?.click()}
            >
              Upload Image
            </Button>
            <Button
              size="small"
              onClick={() => {
                setIsAssetLibraryOpen(true);
                void loadAssetLibrary();
              }}
            >
              Pick From Library
            </Button>
          </Space>
          <input
            ref={assetInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadAssetFile(file);
              event.currentTarget.value = "";
            }}
          />
          {(Array.isArray(currentQuestion.assets) ? currentQuestion.assets : []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(currentQuestion.assets || []).map((asset, idx) => (
                <div key={`publisher-asset-${idx}`} className="rounded border border-slate-200 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={String(asset?.url || "")}
                    alt={String(asset?.alt || "Question asset")}
                    className="h-[90px] w-[120px] rounded object-cover"
                  />
                  <div className="mt-1 flex justify-end">
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          assets: (Array.isArray(prev.assets) ? prev.assets : []).filter((_, removeIdx) => removeIdx !== idx),
                        }));
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Text type="secondary">No assets attached.</Text>
          )}
        </Card>
      </>
    );
  };

  return (
    <div className="!p-6 max-w-7xl !mx-auto">
      <div className="flex justify-between items-center !mb-6">
        <div>
          <Title level={3} className="!mb-0">Question Publisher</Title>
          <Text type="secondary">Create and publish questions for Government Exams</Text>
        </div>
        <Space>
          <Button 
            icon={<SaveOutlined />} 
            onClick={saveWork}
            disabled={!hasUnsavedChanges}
          >
            Save Work {hasUnsavedChanges && <Tag color="red" className="!ml-1">Unsaved</Tag>}
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClearAll}>
            Clear All ({questions.length})
          </Button>
          <Popconfirm
            title="Save all questions?"
            description={`This will save ${questions.length} questions to the database`}
            onConfirm={handleSaveAll}
            okText="Save"
            cancelText="Cancel"
          >
            <Button type="primary" icon={<SaveOutlined />} loading={isSaving} disabled={questions.length === 0}>
              Save All Questions
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Card title={selectedIndex !== null ? `Edit Question #${selectedIndex + 1}` : "Create New Question"}>
            <Form
              form={form}
              layout="vertical"
              initialValues={INITIAL_QUESTION}
              onValuesChange={(_, allValues) => setCurrentQuestion({ ...currentQuestion, ...allValues })}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Exam" name="examSlug" rules={[{ required: true }]}>
                    <Select
                      options={examOptions}
                      onChange={(val) => {
                        const stagesFromBlueprint = allBlueprints
                          .filter((item) => item.examSlug === val)
                          .map((item) => String(item.stageSlug || "").trim())
                          .filter(Boolean);
                        const firstStageFromBlueprint = stagesFromBlueprint[0];
                        const firstStageFromMock = GOV_EXAMS.find((e) => e.slug === val)?.stages?.[0]?.slug || "";
                        const firstStage = firstStageFromBlueprint || firstStageFromMock;
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          examSlug: val,
                          stageSlug: firstStage,
                          section: "",
                          topic: "",
                        }));
                        form.setFieldsValue({ stageSlug: firstStage, section: undefined, topic: undefined });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Stage" name="stageSlug" rules={[{ required: true }]}>
                    <Select
                      options={examStages.map((stage) => ({
                        value: stage.slug,
                        label: stage.name,
                      }))}
                      onChange={(val) => {
                        setCurrentQuestion((prev) => ({
                          ...prev,
                          stageSlug: val,
                          section: "",
                          topic: "",
                        }));
                        form.setFieldsValue({ section: undefined, topic: undefined });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Card
                size="small"
                className="!mb-4"
                title="Quick Paste Pad"
                extra={
                  <Button size="small" onClick={() => setBlackboardText("")}>
                    Clear
                  </Button>
                }
              >
                <Row gutter={12}>
                  <Col xs={24} lg={14}>
                    <Text type="secondary">
                      Paste directly from PDF.
                    </Text>
                    <TextArea
                      className="!mt-2"
                      rows={11}
                      value={blackboardText}
                      onChange={(e) => setBlackboardText(e.target.value)}
                      placeholder={`Q. Passage based question text...
A) option one
B) option two
C) option three
D) option four
Answer Key: B
Explanation: optional`}
                      style={{ marginTop: 8 }}
                    />
                    <Space className="!mt-3">
                      <Switch checked={autoFillFromPad} onChange={setAutoFillFromPad} size="small" />
                      <Button type="primary" onClick={applyParsedDraftToForm}>
                        Parse To Form
                      </Button>
                      <Button onClick={handleParseMultipleToBatch}>
                        Parse Multiple To Batch
                      </Button>
                      <Button onClick={() => setBlackboardText("")}>Clear Pad</Button>
                    </Space>
                  </Col>
                  <Col xs={24} lg={10}>
                    <Card
                      size="small"
                      style={{ minHeight: 280 }}
                      title="Live Parsed Preview"
                    >
                      <Space direction="vertical" className="!w-full" size={6}>
                        <Text type="secondary">
                          Lines: {parsedDraft.rawQuestionLines.length} • Options: {parsedDraft.options.filter(Boolean).length}
                        </Text>
                        <Text strong>Question</Text>
                        <Paragraph style={{ marginBottom: 4 }} ellipsis={{ rows: 4 }}>
                          {parsedDraft.question || "No question detected yet"}
                        </Paragraph>
                        <Text strong>Options</Text>
                        <div className="flex flex-wrap gap-1">
                          {parsedDraft.options.map((opt, idx) =>
                            opt ? (
                              <Tag key={`parsed-opt-${idx}`} color="geekblue">
                                {String.fromCharCode(65 + idx)}. {opt.slice(0, 50)}
                              </Tag>
                            ) : null
                          )}
                        </div>
                        <Text>
                          <strong>Answer Key:</strong> {parsedDraft.answerKey || "-"}
                        </Text>
                        <Text>
                          <strong>Answer:</strong> {parsedDraft.answer || "-"}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Section" name="section" rules={[{ required: true }]}>
                    <Select
                      options={availableSections}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Topic" name="topic" rules={[{ required: true }]}>
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select topic"
                      options={filteredTopics.map((t) => ({ value: t, label: t }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Difficulty" name="difficulty" rules={[{ required: true }]}>
                    <Radio.Group>
                      <Radio.Button value="easy">Easy</Radio.Button>
                      <Radio.Button value="medium">Medium</Radio.Button>
                      <Radio.Button value="hard">Hard</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item label="Question Type" name="questionType">
                    <Select options={QUESTION_TYPES} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Group Type" name="groupType">
                <Radio.Group
                  onChange={(e) => {
                    const selectedGroupType = e.target.value as GroupType;
                    if (selectedGroupType === "rc_passage") {
                      const seededId = currentQuestion.groupId || buildRcSetId();
                      const next = {
                        ...currentQuestion,
                        groupType: selectedGroupType,
                        groupId: seededId,
                        groupOrder: Number(currentQuestion.groupOrder || 1),
                      };
                      setCurrentQuestion(next);
                      setRcSetQuestions([createEmptyRcItem(1)]);
                      form.setFieldsValue({
                        groupType: selectedGroupType,
                        groupId: seededId,
                        groupOrder: Number(currentQuestion.groupOrder || 1),
                      });
                      return;
                    }

                    const next = {
                      ...currentQuestion,
                      groupType: "none" as GroupType,
                      groupId: "",
                      groupOrder: 1,
                      groupTitle: "",
                      passageText: "",
                    };
                    setCurrentQuestion(next);
                    setRcSetQuestions([createEmptyRcItem(1)]);
                    form.setFieldsValue({
                      groupType: "none",
                      groupId: "",
                      groupOrder: 1,
                      groupTitle: "",
                      passageText: "",
                    });
                  }}
                >
                  <Radio value="none">Standalone Question</Radio>
                  <Radio value="rc_passage">Reading Comprehension (RC)</Radio>
                </Radio.Group>
              </Form.Item>

              {renderRCFields()}

              {renderQuestionFields()}

              <Divider />

              <Form.Item label="Source Exam (PYQ)" name="sourceExam">
                <Input placeholder="e.g., SBI Clerk Prelims 2023" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Year" name="sourceYear">
                    <InputNumber className="!w-full" min={2000} max={2100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Shift" name="sourceShift">
                    <InputNumber className="!w-full" min={1} max={10} />
                  </Form.Item>
                </Col>
              </Row>

              <Space className="!w-full justify-end">
                {selectedIndex !== null ? (
                  <>
                    <Button onClick={() => {
                      setSelectedIndex(null);
                      setCurrentQuestion({ ...INITIAL_QUESTION, examSlug: currentQuestion.examSlug, stageSlug: currentQuestion.stageSlug });
                      form.resetFields();
                    }}>
                      Cancel
                    </Button>
                    <Button type="primary" onClick={handleUpdateQuestion}>
                      Update Question
                    </Button>
                  </>
                ) : (
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddQuestion}>
                    Add to Batch
                  </Button>
                )}
                <Button icon={<EyeOutlined />} onClick={() => setIsPreviewOpen(true)}>
                  Preview
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={`Question Batch (${questions.length})`}
            extra={
              <Space>
                <Tag color="blue">{questions.length} questions</Tag>
                <Button
                  type="primary"
                  size="small"
                  loading={isSaving}
                  disabled={questions.length === 0}
                  onClick={handleSaveAll}
                >
                  Send For Review
                </Button>
              </Space>
            }
          >
            {questions.length === 0 ? (
              <Alert
                message="No questions added yet"
                description="Create questions using the form and click 'Add to Batch' to build your question set."
                type="info"
                showIcon
              />
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                {questions.map((q, idx) => (
                  <Card
                    key={idx}
                    size="small"
                    className={`cursor-pointer transition-all ${selectedIndex === idx ? 'border-blue-500 border-2' : ''}`}
                    onClick={() => handleEditQuestion(idx)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="!flex-1">
                        <Space>
                          <Tag color="blue">{q.examSlug}</Tag>
                          <Tag>{q.stageSlug}</Tag>
                          <Tag color={q.difficulty === "easy" ? "green" : q.difficulty === "hard" ? "red" : "orange"}>
                            {q.difficulty}
                          </Tag>
                        </Space>
                        <Text type="secondary" className="!block !mt-1">
                          {q.section} • {q.topic}
                        </Text>
                        {q.groupType === "rc_passage" && (
                          <Text type="secondary" className="!block !mt-1">
                            RC Set: {q.groupId} • Order: {q.groupOrder || 1}
                          </Text>
                        )}
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          className="!mt-2 !mb-0"
                        >
                          {q.question}
                        </Paragraph>
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(idx);
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Question Preview"
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {questions.length > 0 ? (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto">
            {questions.slice(0, 5).map((q, idx) => (
              <Card key={idx} size="small">
                <Space direction="vertical" className="!w-full">
                  <Space>
                    <Tag color="blue">{q.examSlug}</Tag>
                    <Tag>{q.stageSlug}</Tag>
                    <Tag>{q.section}</Tag>
                    <Tag>{q.topic}</Tag>
                    {q.groupType === "rc_passage" && <Tag color="purple">{q.groupId}</Tag>}
                    <Tag color={q.difficulty === "easy" ? "green" : q.difficulty === "hard" ? "red" : "orange"}>
                      {q.difficulty}
                    </Tag>
                  </Space>
                  {q.groupType === "rc_passage" && q.passageText && (
                    <div>
                      <Text strong>Passage:</Text>
                      <Paragraph ellipsis={{ rows: 3 }} className="!mt-1">{q.passageText}</Paragraph>
                    </div>
                  )}
                  <div>
                    <Text strong>Q{idx + 1}:</Text>
                    <Paragraph className="!mt-1">{q.question}</Paragraph>
                  </div>
                  {(Array.isArray(q.options) ? q.options : []).length > 0 && (
                    <div>
                      <Text strong>Options:</Text>
                      <ul className="!mt-1 !pl-4">
                        {(Array.isArray(q.options) ? q.options : []).map((opt, oi) => (
                          <li key={oi}>
                            <Text mark={q.answerKey === ["A", "B", "C", "D", "E", "F"][oi]}>
                              {["A", "B", "C", "D", "E", "F"][oi]}. {opt}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <Text strong>Answer: </Text>
                    <Text type="success">{q.answer}</Text>
                  </div>
                  {q.explanation && (
                    <div>
                      <Text strong>Explanation:</Text>
                      <Paragraph ellipsis={{ rows: 2 }} className="!mt-1">{q.explanation}</Paragraph>
                    </div>
                  )}
                </Space>
              </Card>
            ))}
            {questions.length > 5 && (
              <Text type="secondary">... and {questions.length - 5} more questions</Text>
            )}
          </div>
        ) : (
          <Alert message="No questions to preview" type="warning" />
        )}
      </Modal>

      <Modal
        title="Question Asset Library"
        open={isAssetLibraryOpen}
        onCancel={() => setIsAssetLibraryOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsAssetLibraryOpen(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        <Input
          value={assetLibrarySearch}
          onChange={(event) => setAssetLibrarySearch(event.target.value)}
          placeholder="Search by file name..."
          className="!mb-3"
          allowClear
        />
        {isAssetLibraryLoading ? (
          <Text type="secondary">Loading assets...</Text>
        ) : filteredAssetLibraryItems.length === 0 ? (
          <Alert type="info" showIcon message="No images in library yet." />
        ) : (
          <div className="flex max-h-[520px] flex-wrap gap-3 overflow-auto">
            {filteredAssetLibraryItems.map((item) => (
              <div key={item.fileName} className="w-[170px] rounded border border-slate-200 bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.fileName} className="h-[110px] w-[150px] rounded object-cover" />
                <Button
                  size="small"
                  type="primary"
                  className="mt-2 w-full"
                  onClick={() => {
                    setCurrentQuestion((prev) => ({
                      ...prev,
                      assets: [
                        ...(Array.isArray(prev.assets) ? prev.assets : []),
                        { kind: "image", url: item.url, alt: item.fileName },
                      ],
                    }));
                    message.success("Asset attached.");
                  }}
                >
                  Use
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
