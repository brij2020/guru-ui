"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Form, Image, Input, InputNumber, Modal, Radio, Row, Select, Space, Switch, Table, Tag, Tooltip, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TextAreaRef } from "antd/es/input/TextArea";
import { useSearchParams } from "next/navigation";
import { CheckOutlined, DeleteOutlined, EditOutlined, EyeOutlined, RobotOutlined, StopOutlined, UploadOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";

const { Title, Text } = Typography;
const { Paragraph } = Typography;

const REVIEW_SECTIONS = [
  { value: "english", label: "English" },
  { value: "quant", label: "Quant" },
  { value: "reasoning", label: "Reasoning" },
  { value: "gk", label: "GK" },
  { value: "general-studies", label: "General Studies" },
  { value: "hindi", label: "Hindi" },
  { value: "mathematics", label: "Mathematics" },
  { value: "aptitude", label: "Aptitude" },
  { value: "computer", label: "Computer" },
  { value: "current-affairs", label: "Current Affairs" },
  { value: "teaching-methodology", label: "Teaching Methodology" },
  { value: "child-development", label: "Child Development & Pedagogy" },
  { value: "environmental-studies", label: "Environmental Studies" },
];

const REVIEW_TOPICS = [
  { value: "reading-comprehension", label: "Reading Comprehension" },
  { value: "cloze-test", label: "Cloze Test" },
  { value: "fill-in-the-blanks", label: "Fill in the Blanks" },
  { value: "error-detection", label: "Error Detection" },
  { value: "para-jumbles", label: "Para Jumbles" },
  { value: "sentence-improvement", label: "Sentence Improvement" },
  { value: "synonym", label: "Synonym" },
  { value: "antonym", label: "Antonym" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "grammar", label: "Grammar" },
  { value: "simplification", label: "Simplification" },
  { value: "percentage", label: "Percentage" },
  { value: "profit-loss", label: "Profit & Loss" },
  { value: "time-work", label: "Time & Work" },
  { value: "time-distance", label: "Time & Distance" },
  { value: "ratio", label: "Ratio & Proportion" },
  { value: "average", label: "Average" },
  { value: "number-series", label: "Number Series" },
  { value: "quadratic-equations", label: "Quadratic Equations" },
  { value: "data-interpretation", label: "Data Interpretation" },
  { value: "mensuration", label: "Mensuration" },
  { value: "geometry", label: "Geometry" },
  { value: "algebra", label: "Algebra" },
  { value: "trigonometry", label: "Trigonometry" },
  { value: "puzzles", label: "Puzzles" },
  { value: "seating-arrangement", label: "Seating Arrangement" },
  { value: "coding-decoding", label: "Coding Decoding" },
  { value: "syllogism", label: "Syllogism" },
  { value: "blood-relations", label: "Blood Relations" },
  { value: "direction-sense", label: "Direction Sense" },
  { value: "inequality", label: "Inequality" },
  { value: "input-output", label: "Input Output" },
  { value: "analogy", label: "Analogy" },
  { value: "classification", label: "Classification" },
  { value: "series", label: "Series" },
  { value: "mirror-images", label: "Mirror Images" },
  { value: "venn-diagram", label: "Venn Diagram" },
  { value: "dice-cube", label: "Dice & Cube" },
  { value: "calendar", label: "Calendar" },
  { value: "clock", label: "Clock" },
  { value: "missing-number", label: "Missing Number" },
  { value: "odd-one-out", label: "Odd One Out" },
  { value: "statement-conclusion", label: "Statement Conclusion" },
  { value: "current-affairs", label: "Current Affairs" },
  { value: "static-gk", label: "Static GK" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "polity", label: "Polity" },
  { value: "economy", label: "Economy" },
  { value: "science", label: "Science" },
  { value: "computer-awareness", label: "Computer Awareness" },
  { value: "banking-awareness", label: "Banking Awareness" },
  { value: "history-bihar", label: "History (Bihar)" },
  { value: "geography-bihar", label: "Geography (Bihar)" },
  { value: "indian-constitution", label: "Indian Constitution" },
  { value: "indian-history", label: "Indian History" },
  { value: "world-history", label: "World History" },
  { value: "indian-geography", label: "Indian Geography" },
  { value: "indian-economy", label: "Indian Economy" },
  { value: "indian-polity", label: "Indian Polity" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "teaching-mcq", label: "Teaching MCQ" },
  { value: "teaching-aptitude", label: "Teaching Aptitude" },
  { value: "child-psychology", label: "Child Psychology" },
  { value: "pedagogy", label: "Pedagogy" },
  { value: "educational-psychology", label: "Educational Psychology" },
  { value: "environmental-science", label: "Environmental Science" },
  { value: "logical-reasoning", label: "Logical Reasoning" },
  { value: "data-interpretation", label: "Data Interpretation" },
  { value: "statistical-analysis", label: "Statistical Analysis" },
  { value: "hindi-grammar", label: "Hindi Grammar" },
  { value: "hindi-vocabulary", label: "Hindi Vocabulary" },
  { value: "hindi-comprehension", label: "Hindi Comprehension" },
  { value: "bihar-gk", label: "Bihar GK" },
];

type ReviewStatus = "draft" | "reviewed" | "approved" | "rejected";
type AiProvider = "gemini" | "openai" | "chatgpt" | "local";

type ReviewRow = {
  id: string;
  ownerId?: string;
  examSlug: string;
  stageSlug: string;
  section: string;
  groupType?: "none" | "rc_passage";
  groupId?: string;
  groupTitle?: string;
  passageText?: string;
  groupOrder?: number | null;
  topic: string;
  difficulty: string;
  question: string;
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
  options?: Array<string | { id?: string; text?: string; value?: string; label?: string }>;
  optionObjects?: Array<{ id?: string; text?: string }>;
  answer?: string;
  answerKey?: string;
  parsedAnswerKey?: string;
  answerConfidence?: "high" | "medium" | "low" | "unknown" | string;
  answerRawSnippet?: string;
  explanation?: string;
  questionNumber?: number | null;
  reviewStatus: ReviewStatus;
  updatedAt?: string;
};

type ReviewListResponse = {
  data?: {
    page: number;
    limit: number;
    total: number;
    scope?: "owner" | "global";
    items: ReviewRow[];
  };
};

type ReviewUpdateResponse = {
  data?: {
    matched: number;
    modified: number;
    reviewStatus: ReviewStatus;
  };
};

type LibraryAssetItem = {
  fileName: string;
  url: string;
  size?: number;
  updatedAt?: string;
};

type AiReviewResponse = {
  data?: {
    id: string;
    provider: string;
    fallbackUsed?: boolean;
    providerError?: string;
    reviewStatus: ReviewStatus;
    statusChanged: boolean;
    editsApplied?: boolean;
    aiReview?: {
      score?: number;
      recommendedStatus?: ReviewStatus;
      needsUpdate?: boolean;
      summary?: string;
      issues?: string[];
      suggestions?: string[];
      updatedQuestion?: {
        question?: string;
        options?: Array<{ id?: string; text?: string }>;
        answer?: string;
        answerKey?: string;
        explanation?: string;
        section?: string;
        topic?: string;
        difficulty?: string;
      };
    };
  };
};

type BlueprintResponse = {
  data?: {
    sections?: Array<{
      key?: string;
      label?: string;
      count?: number;
    }>;
  } | null;
};

const statusColorMap: Record<ReviewStatus, string> = {
  draft: "default",
  reviewed: "blue",
  approved: "green",
  rejected: "red",
};

type QuestionSegment =
  | { kind: "text"; content: string }
  | { kind: "code"; language: string; content: string };

const parseQuestionSegments = (questionText: string): QuestionSegment[] => {
  const source = String(questionText || "");
  const fenceRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  const segments: QuestionSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(source)) !== null) {
    const [fullMatch, language = "", code = ""] = match;
    const start = match.index;

    if (start > lastIndex) {
      const textChunk = source.slice(lastIndex, start).trim();
      if (textChunk) {
        segments.push({ kind: "text", content: textChunk });
      }
    }

    segments.push({
      kind: "code",
      language: String(language || "").trim() || "text",
      content: String(code || "").trim(),
    });

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < source.length) {
    const tail = source.slice(lastIndex).trim();
    if (tail) {
      segments.push({ kind: "text", content: tail });
    }
  }

  if (segments.length === 0) {
    return [{ kind: "text", content: source }];
  }

  return segments;
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const resolveAnswerIndex = (answer: string, options: string[]) => {
  const normalizedAnswer = normalizeText(answer).toLowerCase();
  if (!normalizedAnswer) return -1;
  const idx = options.findIndex((opt) => normalizeText(opt).toLowerCase() === normalizedAnswer);
  return idx >= 0 ? idx : -1;
};

export default function QuestionReviewPage() {
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const watchedGroupType = Form.useWatch("groupType", form);
  const watchedEditSection = Form.useWatch("section", form);
  const questionRef = useRef<TextAreaRef | null>(null);
  const passageRef = useRef<TextAreaRef | null>(null);
  const optionsRef = useRef<TextAreaRef | null>(null);
  const assetInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingRow, setEditingRow] = useState<ReviewRow | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [previewRow, setPreviewRow] = useState<ReviewRow | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showPreviewAnswer, setShowPreviewAnswer] = useState(false);
  const [aiReviewingId, setAiReviewingId] = useState<string>("");
  const [isAiResultOpen, setIsAiResultOpen] = useState(false);
  const [lastAiResult, setLastAiResult] = useState<AiReviewResponse["data"] | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [aiProvider, setAiProvider] = useState<AiProvider>(
    (searchParams.get("aiProvider") as AiProvider) || "local"
  );
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "">(
    (searchParams.get("reviewStatus") as ReviewStatus) || "draft"
  );
  const [examSlug, setExamSlug] = useState(searchParams.get("examSlug") || "");
  const [stageSlug, setStageSlug] = useState(searchParams.get("stageSlug") || "");
  const [sectionFilter, setSectionFilter] = useState(searchParams.get("section") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [editSectionOptions, setEditSectionOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [editTopicOptions, setEditTopicOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [editSectionTopicsMap, setEditSectionTopicsMap] = useState<Record<string, string[]>>({});
  const [isLoadingEditSections, setIsLoadingEditSections] = useState(false);
  const [editAssets, setEditAssets] = useState<Array<{ kind?: string; url?: string; alt?: string; width?: number | null; height?: number | null; caption?: string; sourcePage?: number | null }>>([]);
  const [isAssetUploading, setIsAssetUploading] = useState(false);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
  const [assetLibraryItems, setAssetLibraryItems] = useState<LibraryAssetItem[]>([]);
  const [isAssetLibraryLoading, setIsAssetLibraryLoading] = useState(false);
  const [assetLibrarySearch, setAssetLibrarySearch] = useState("");

  const [scope, setScope] = useState<"owner" | "global">(
    (searchParams.get("scope") as "owner" | "global") || "global"
  );
  const watchedOptionsText = Form.useWatch("optionsText", form);
  const optionsCount = useMemo(
    () =>
      String(watchedOptionsText || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean).length,
    [watchedOptionsText]
  );
  const watchedOptionsList = useMemo(
    () =>
      String(watchedOptionsText || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 5),
    [watchedOptionsText]
  );
  const filteredAssetLibraryItems = useMemo(() => {
    const search = String(assetLibrarySearch || "").trim().toLowerCase();
    if (!search) return assetLibraryItems;
    return assetLibraryItems.filter((item) => String(item.fileName || "").toLowerCase().includes(search));
  }, [assetLibraryItems, assetLibrarySearch]);

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: { error?: unknown } } }).response?.data?.error === "string"
    ) {
      return (error as { response?: { data?: { error?: string } } }).response?.data?.error as string;
    }
    return fallback;
  };

  const getOptionLines = (row: ReviewRow) => {
    const fromOptionObjects = Array.isArray(row.optionObjects)
      ? row.optionObjects
          .map((item) => String(item?.text || "").trim())
          .filter(Boolean)
      : [];
    if (fromOptionObjects.length > 0) return fromOptionObjects;

    const fromOptions = Array.isArray(row.options)
      ? row.options
          .map((item) => {
            if (typeof item === "string") return item.trim();
            return String(item?.text || item?.value || item?.label || "").trim();
          })
          .filter(Boolean)
      : [];
    return fromOptions;
  };

  const renderQuestionPreview = (row: ReviewRow) => (
    <div className="max-w-[680px]">
      <Paragraph
        className="!mb-1 !text-[13px] !leading-6 !text-slate-900"
        ellipsis={{ rows: 2, expandable: false, tooltip: row.question || "-" }}
      >
        {row.question || "-"}
      </Paragraph>
      <div className="flex flex-wrap items-center gap-2">
        <Tag color="default" className="!mb-0">{row.topic || "untagged-topic"}</Tag>
        {row.groupType === "rc_passage" ? (
          <Tag color="geekblue" className="!mb-0">
            RC{row.groupOrder ? ` #${row.groupOrder}` : ""}
          </Tag>
        ) : null}
        {row.groupType === "rc_passage" && row.groupTitle ? (
          <Tag color="blue" className="!mb-0">
            {row.groupTitle}
          </Tag>
        ) : null}
        <Text type="secondary" className="text-xs">
          Q.No: {row.questionNumber || "-"}
        </Text>
      </div>
    </div>
  );

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ReviewListResponse>(API_ENDPOINTS.questionBank.reviewList, {
        params: {
          page,
          limit,
          scope,
          reviewStatus: statusFilter || undefined,
          examSlug: examSlug || undefined,
          stageSlug: stageSlug || undefined,
          section: sectionFilter || undefined,
          search: search || undefined,
        },
      });
      const payload = response.data?.data;
      setRows(Array.isArray(payload?.items) ? payload.items : []);
      setTotal(Number(payload?.total || 0));
      setSelectedIds([]);
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, "Unable to load review queue."));
    } finally {
      setIsLoading(false);
    }
  }, [examSlug, limit, page, scope, search, stageSlug, statusFilter]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const bulkUpdate = async (reviewStatus: ReviewStatus) => {
    if (selectedIds.length === 0) {
      message.warning("Select at least one question.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.put<ReviewUpdateResponse>(API_ENDPOINTS.questionBank.reviewStatus, {
        ids: selectedIds,
        reviewStatus,
      });
      const matched = Number(response.data?.data?.matched || 0);
      const modified = Number(response.data?.data?.modified || 0);
      if (matched === 0) {
        message.warning("No matching questions found for update. Try Scope: Global.");
      } else if (modified === 0) {
        message.warning(`Matched ${matched}, but no status changed (already ${reviewStatus} or permission scope mismatch).`);
      } else {
        message.success(`Updated ${modified} questions to ${reviewStatus}.`);
      }
      await fetchRows();
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, "Failed to update review status."));
    } finally {
      setIsLoading(false);
    }
  };

  const updateSingle = async (id: string, reviewStatus: ReviewStatus) => {
    setIsLoading(true);
    try {
      const response = await apiClient.put<ReviewUpdateResponse>(API_ENDPOINTS.questionBank.reviewStatus, {
        ids: [id],
        reviewStatus,
      });
      const matched = Number(response.data?.data?.matched || 0);
      const modified = Number(response.data?.data?.modified || 0);
      if (matched === 0) {
        message.warning("No matching question found for update. Try Scope: Global.");
      } else if (modified === 0) {
        message.warning(`Question already ${reviewStatus} or permission scope mismatch.`);
      } else {
        message.success(`Question marked as ${reviewStatus}.`);
      }
      await fetchRows();
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, "Failed to update question status."));
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (row: ReviewRow) => {
    setEditingRow(row);
    const optionLines = getOptionLines(row).join("\n");
    form.setFieldsValue({
      question: row.question || "",
      topic: row.topic || "",
      section: row.section || "",
      groupType: row.groupType || "none",
      groupId: row.groupId || "",
      groupTitle: row.groupTitle || "",
      passageText: row.passageText || "",
      groupOrder: row.groupOrder ?? null,
      applyRcToGroup: true,
      difficulty: row.difficulty || "medium",
      optionsText: optionLines,
      answer: row.answer || "",
      answerKey: row.answerKey || "",
      explanation: row.explanation || "",
      questionNumber: row.questionNumber ?? null,
    });
    setEditAssets(Array.isArray(row.assets) ? row.assets : []);
    void (async () => {
      setIsLoadingEditSections(true);
      try {
        const response = await apiClient.get<BlueprintResponse>(API_ENDPOINTS.paperBlueprints.get, {
          params: {
            examSlug: row.examSlug || undefined,
            stageSlug: row.stageSlug || undefined,
          },
        });
        const sections = Array.isArray(response.data?.data?.sections) ? response.data?.data?.sections || [] : [];
        const options = sections
          .map((section) => {
            const key = String(section?.key || "").trim();
            const label = String(section?.label || "").trim();
            if (!key) return null;
            return {
              value: key,
              label: label && label.toLowerCase() !== key.toLowerCase() ? `${label} (${key})` : key,
            };
          })
          .filter((item): item is { value: string; label: string } => Boolean(item));
        const topicsMap: Record<string, string[]> = {};
        const topicSet = new Set<string>();
        for (const section of sections) {
          const key = String(section?.key || "").trim();
          if (!key) continue;
          const topics = Array.isArray((section as { topics?: unknown[] })?.topics)
            ? ((section as { topics?: unknown[] }).topics || [])
                .map((topic) => String(topic || "").trim())
                .filter(Boolean)
            : [];
          topicsMap[key] = topics;
          for (const topic of topics) topicSet.add(topic);
        }

        const currentSection = String(row.section || "").trim();
        const hasCurrent = currentSection && options.some((option) => option.value === currentSection);
        if (currentSection && !hasCurrent) {
          options.unshift({ value: currentSection, label: currentSection });
        }
        const topics = Array.from(topicSet).map((topic) => ({ value: topic, label: topic }));
        const currentTopic = String(row.topic || "").trim();
        if (currentTopic && !topics.some((topic) => topic.value === currentTopic)) {
          topics.unshift({ value: currentTopic, label: currentTopic });
        }
        setEditSectionOptions(options);
        setEditTopicOptions(topics);
        setEditSectionTopicsMap(topicsMap);
      } catch {
        const currentSection = String(row.section || "").trim();
        setEditSectionOptions(currentSection ? [{ value: currentSection, label: currentSection }] : []);
        const currentTopic = String(row.topic || "").trim();
        setEditTopicOptions(currentTopic ? [{ value: currentTopic, label: currentTopic }] : []);
        setEditSectionTopicsMap({});
      } finally {
        setIsLoadingEditSections(false);
      }
    })();
    setIsEditOpen(true);
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

  const uploadAssetFile = useCallback(
    async (file: File) => {
      setIsAssetUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/admin/question-assets", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as {
          data?: { url?: string; fileName?: string };
          error?: string;
        };
        if (!response.ok) throw new Error(String(payload?.error || "Upload failed"));
        const nextUrl = String(payload?.data?.url || "").trim();
        if (!nextUrl) throw new Error("Upload returned empty URL");
        setEditAssets((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          { kind: "image", url: nextUrl, alt: String(payload?.data?.fileName || "Question image") },
        ]);
        message.success("Image uploaded.");
        void loadAssetLibrary();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "Failed to upload image.");
      } finally {
        setIsAssetUploading(false);
      }
    },
    [loadAssetLibrary]
  );

  const insertIntoTextAreaField = (fieldName: string, ref: { current: TextAreaRef | null }, insertion: string) => {
    const value = String(form.getFieldValue(fieldName) || "");
    const textArea = ref.current?.resizableTextArea?.textArea;

    if (!textArea) {
      form.setFieldsValue({ [fieldName]: `${value}${insertion}` });
      return;
    }

    const start = Number(textArea.selectionStart || 0);
    const end = Number(textArea.selectionEnd || 0);
    const next = value.slice(0, start) + insertion + value.slice(end);
    const nextCursor = start + insertion.length;
    form.setFieldsValue({ [fieldName]: next });

    setTimeout(() => {
      try {
        textArea.focus();
        textArea.setSelectionRange(nextCursor, nextCursor);
      } catch {}
    }, 0);
  };

  const openPreviewModal = (row: ReviewRow) => {
    setPreviewRow(row);
    setShowPreviewAnswer(false);
    setIsPreviewOpen(true);
  };

  const runAiReview = async (id: string, apply = false) => {
    setAiReviewingId(id);
    try {
      console.log('Starting AI review for:', id, 'provider:', aiProvider);
      const response = await apiClient.post<AiReviewResponse>(API_ENDPOINTS.questionBank.reviewItemAiReviewById(id), {
        provider: aiProvider,
        applyStatus: apply,
        applyEdits: apply,
      }, { timeout: 120000 });
      console.log('AI review response:', response.data);
      const payload = response.data?.data;
      setLastAiResult(payload || null);
      setIsAiResultOpen(true);
      const score = Number(payload?.aiReview?.score || 0);
      const rec = String(payload?.aiReview?.recommendedStatus || "reviewed");
      const summary = String(payload?.aiReview?.summary || "").trim();
      const fallbackUsed = Boolean(payload?.fallbackUsed);
      if (apply && fallbackUsed) {
        message.warning(`Fallback applied • score ${score} • recommended ${rec}${summary ? ` • ${summary}` : ""}`);
      } else if (apply) {
        message.success(`AI applied • score ${score} • recommended ${rec}${summary ? ` • ${summary}` : ""}`);
      } else if (fallbackUsed) {
        message.warning(`Fallback review • score ${score} • recommended ${rec}${summary ? ` • ${summary}` : ""}`);
      } else {
        message.info(`AI reviewed • score ${score} • recommended ${rec}${summary ? ` • ${summary}` : ""}`);
      }
      await fetchRows();
    } catch (error: unknown) {
      console.error('AI Review Error:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('canceled') || errMsg.includes('aborted')) {
        message.error("Request timed out. Try again or use a faster provider.");
      } else {
        message.error(getApiErrorMessage(error, "Failed to run AI review."));
      }
    } finally {
      setAiReviewingId("");
    }
  };

  const saveEdit = async (approveAfterSave = false) => {
    if (!editingRow) return;
    try {
      const values = await form.validateFields();
      const options = String(values.optionsText || "")
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean)
        .slice(0, 5);

      const payload: Record<string, unknown> = {
        question: String(values.question || "").trim(),
        topic: String(values.topic || "").trim(),
        section: String(values.section || "").trim(),
        groupType: String(values.groupType || "none").trim(),
        groupId: String(values.groupId || "").trim(),
        groupTitle: String(values.groupTitle || "").trim(),
        passageText: String(values.passageText || "").trim(),
        groupOrder:
          values.groupOrder === null || values.groupOrder === undefined || values.groupOrder === ""
            ? null
            : Number(values.groupOrder),
        applyRcToGroup: Boolean(values.applyRcToGroup),
        difficulty: String(values.difficulty || "medium").trim(),
        answer: String(values.answer || "").trim(),
        answerKey: String(values.answerKey || "").trim(),
        explanation: String(values.explanation || "").trim(),
        questionNumber:
          values.questionNumber === null || values.questionNumber === undefined || values.questionNumber === ""
            ? null
            : Number(values.questionNumber),
        assets: Array.isArray(editAssets) ? editAssets : [],
        hasVisual: Array.isArray(editAssets) && editAssets.some((asset) => Boolean(String(asset?.url || "").trim())),
      };

      if (options.length > 0) {
        payload.options = options;
      }

      setIsSavingEdit(true);
      await apiClient.put(API_ENDPOINTS.questionBank.reviewItemById(editingRow.id), payload);

      if (approveAfterSave) {
        await apiClient.put<ReviewUpdateResponse>(API_ENDPOINTS.questionBank.reviewStatus, {
          ids: [editingRow.id],
          reviewStatus: "approved",
        });
        message.success("Question updated and approved.");
      } else {
        message.success("Question updated.");
      }

      setIsEditOpen(false);
      setEditingRow(null);
      await fetchRows();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errorFields" in error) return;
      message.error(getApiErrorMessage(error, "Failed to save question edits."));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const columns: ColumnsType<ReviewRow> = [
      {
        title: "#",
        key: "idx",
        width: 64,
        render: (_, __, index) => (
          <Text className="text-xs text-slate-500">{(page - 1) * limit + index + 1}</Text>
        ),
      },
      {
        title: "Exam / Stage",
        key: "examStage",
        width: 220,
        render: (_, row) => (
          <div className="space-y-1">
            <Tag color="blue" className="!mb-0">{row.examSlug || "-"}</Tag>
            <Tag color="geekblue" className="!mb-0">{row.stageSlug || "-"}</Tag>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "reviewStatus",
        width: 120,
        render: (value: ReviewStatus) => <Tag color={statusColorMap[value]}>{value}</Tag>,
      },
      {
        title: "Difficulty",
        dataIndex: "difficulty",
        width: 110,
        render: (value: string) => (
          <Tag color={value === "hard" ? "red" : value === "easy" ? "green" : "gold"}>{value || "medium"}</Tag>
        ),
      },
      {
        title: "Question / Topic",
        key: "questionTopic",
        render: (_, row) => renderQuestionPreview(row),
      },
      {
        title: "Action",
        key: "action",
        width: 220,
        render: (_, row) => (
          <Space size={6} wrap>
            <Tooltip title={row.reviewStatus === "draft" ? "Preview (Exam UX)" : "Preview available only for draft"}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => openPreviewModal(row)}
                disabled={row.reviewStatus !== "draft"}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(row)} />
            </Tooltip>
            <Tooltip title="AI Review">
              <Button
                size="small"
                icon={<RobotOutlined />}
                onClick={() => runAiReview(row.id, false)}
                loading={aiReviewingId === row.id}
                style={{
                  borderColor: "#2563eb",
                  color: "#2563eb",
                  background: "#eff6ff",
                }}
              />
            </Tooltip>
            <Tooltip title="AI Review + Apply">
              <Button
                size="small"
                icon={<RobotOutlined />}
                onClick={() => runAiReview(row.id, true)}
                loading={aiReviewingId === row.id}
                style={{
                  borderColor: "#059669",
                  color: "#ffffff",
                  background: "#059669",
                }}
              />
            </Tooltip>
            <Tooltip title="Approve">
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => updateSingle(row.id, "approved")}
                disabled={row.reviewStatus === "approved"}
              />
            </Tooltip>
            <Tooltip title="Mark Reviewed">
              <Button
                size="small"
                icon={<CheckOutlined />}
                onClick={() => updateSingle(row.id, "reviewed")}
                disabled={row.reviewStatus === "reviewed"}
              />
            </Tooltip>
            <Tooltip title="Reject">
              <Button
                size="small"
                danger
                icon={<StopOutlined />}
                onClick={() => updateSingle(row.id, "rejected")}
                disabled={row.reviewStatus === "rejected"}
              />
            </Tooltip>
          </Space>
        ),
      },
    ];

  return (
    <div className="space-y-4">
      <Card>
        <Title level={4} className="!mb-1">
          Question Review Queue
        </Title>
        <Text type="secondary">
          Review imported/AI questions and mark only trusted ones as approved for serving.
        </Text>
      </Card>

      <Card>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}>
            <Text strong>Scope</Text>
            <Select
              className="!mt-1 w-full"
              value={scope}
              onChange={(value) => {
                setScope(value as "owner" | "global");
                setPage(1);
              }}
              options={[
                { value: "global", label: "Global (All Users)" },
                { value: "owner", label: "My Uploads Only" },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Status</Text>
            <Select
              className="!mt-1 w-full"
              allowClear
              value={statusFilter || undefined}
              onChange={(value) => {
                setStatusFilter((value as ReviewStatus) || "");
                setPage(1);
              }}
              options={[
                { value: "draft", label: "draft" },
                { value: "reviewed", label: "reviewed" },
                { value: "approved", label: "approved" },
                { value: "rejected", label: "rejected" },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>AI Provider</Text>
            <Select
              className="!mt-1 w-full"
              value={aiProvider}
              onChange={(value) => setAiProvider(value as AiProvider)}
              options={[
                { value: "gemini", label: "gemini" },
                { value: "openai", label: "openai (OpenAI-compatible / local)" },
                { value: "chatgpt", label: "chatgpt (alias -> openai)" },
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Text strong>Exam Slug</Text>
            <Input value={examSlug} onChange={(e) => setExamSlug(e.target.value)} placeholder="sbi-clerk" />
          </Col>
          <Col xs={24} md={4}>
            <Text strong>Stage Slug</Text>
            <Input value={stageSlug} onChange={(e) => setStageSlug(e.target.value)} placeholder="prelims" />
          </Col>
          <Col xs={24} md={4}>
            <Text strong>Section</Text>
            <Select
              className="w-full"
              value={sectionFilter}
              onChange={(val) => setSectionFilter(val || "")}
              allowClear
              placeholder="Select section"
              showSearch
              options={REVIEW_SECTIONS}
            />
          </Col>
          <Col xs={24} md={4}>
            <Text strong>Search</Text>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="question keyword" />
          </Col>
        </Row>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => { setPage(1); fetchRows(); }} loading={isLoading}>
            Apply Filters
          </Button>
          <Button onClick={() => bulkUpdate("approved")} disabled={selectedIds.length === 0}>
            Approve Selected
          </Button>
          <Button onClick={() => bulkUpdate("reviewed")} disabled={selectedIds.length === 0}>
            Mark Reviewed
          </Button>
          <Button danger onClick={() => bulkUpdate("rejected")} disabled={selectedIds.length === 0}>
            Reject
          </Button>
          <Button onClick={() => bulkUpdate("draft")} disabled={selectedIds.length === 0}>
            Reset Draft
          </Button>
        </div>

        <div className="mt-4">
          <Table
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={rows}
            size="middle"
            bordered
            scroll={{ x: 1280 }}
            expandable={{
              expandedRowRender: (row) => {
                const options = getOptionLines(row);
                return (
                  <div className="grid gap-3 md:grid-cols-2">
                    {row.passageText ? (
                      <div className="rounded-md border border-indigo-200 bg-indigo-50 p-3 md:col-span-2">
                        <Text strong className="block !mb-1 text-indigo-700">Passage</Text>
                        <Text className="text-[13px] leading-6 text-indigo-950">{row.passageText}</Text>
                      </div>
                    ) : null}
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <Text strong className="block !mb-1">Question</Text>
                      <Text className="text-[13px] leading-6 text-slate-900">{row.question || "-"}</Text>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white p-3">
                      <Text strong className="block !mb-1">Options</Text>
                      <div className="space-y-1">
                        {options.length > 0 ? (
                          options.map((opt, idx) => (
                            <div key={`${row.id}-opt-${idx}`} className="text-[13px] text-slate-700">
                              <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span> {opt}
                            </div>
                          ))
                        ) : (
                          <Text type="secondary">No options</Text>
                        )}
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-emerald-50 p-3">
                      <Text strong className="block !mb-1 text-emerald-700">Answer</Text>
                      <Text className="text-[13px] text-emerald-900">
                        {row.answerKey ? `${row.answerKey} • ` : ""}{row.answer || "-"}
                      </Text>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-cyan-50 p-3">
                      <Text strong className="block !mb-1 text-cyan-700">Parsed Key (PDF)</Text>
                      <div className="space-y-1 text-[13px] text-cyan-900">
                        <div>
                          <Text strong>Key:</Text> {row.parsedAnswerKey || "-"}
                        </div>
                        <div>
                          <Text strong>Confidence:</Text> {row.answerConfidence || "unknown"}
                        </div>
                        <div>
                          <Text strong>Snippet:</Text> {row.answerRawSnippet || "-"}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-amber-50 p-3">
                      <Text strong className="block !mb-1 text-amber-700">Explanation</Text>
                      <Text className="text-[13px] text-amber-900">{row.explanation || "-"}</Text>
                    </div>
                  </div>
                );
              },
            }}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys.map((k) => String(k))),
            }}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              onChange: (next) => setPage(next),
            }}
          />
        </div>

        <Space>
          <Text type="secondary">Selected: {selectedIds.length}</Text>
          <Text type="secondary">Total: {total}</Text>
        </Space>
      </Card>

      <Modal
        title={
          <div className="flex flex-wrap items-center gap-2">
            <span>Draft Preview</span>
            <Tag color="blue">{previewRow?.examSlug || "-"}</Tag>
            <Tag color="default">{previewRow?.stageSlug || "-"}</Tag>
            <Tag color="purple">#{previewRow?.questionNumber || "-"}</Tag>
            {previewRow?.groupType === "rc_passage" ? <Tag color="geekblue">RC</Tag> : null}
            <Tag color={previewRow ? statusColorMap[previewRow.reviewStatus] : "default"}>{previewRow?.reviewStatus || "-"}</Tag>
          </div>
        }
        open={isPreviewOpen}
        onCancel={() => {
          setIsPreviewOpen(false);
          setPreviewRow(null);
        }}
        footer={
          <Space wrap>
            <Switch
              checked={showPreviewAnswer}
              onChange={setShowPreviewAnswer}
              checkedChildren="Show Answer"
              unCheckedChildren="Hide Answer"
            />
            <Button
              onClick={() => {
                if (!previewRow) return;
                setIsPreviewOpen(false);
                openEditModal(previewRow);
              }}
              icon={<EditOutlined />}
              disabled={!previewRow}
            >
              Edit & Save
            </Button>
            <Button
              onClick={() => {
                setIsPreviewOpen(false);
                setPreviewRow(null);
              }}
            >
              Close
            </Button>
          </Space>
        }
        width={980}
        destroyOnHidden
      >
        {!previewRow ? (
          <Alert type="info" showIcon message="No draft selected." />
        ) : (
          <div className="grid gap-3 md:grid-cols-5">
            <div className="md:col-span-3 space-y-3">
              {previewRow.groupType === "rc_passage" && previewRow.passageText ? (
                <Card className="border border-indigo-200 bg-indigo-50/40" size="small">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Tag color="geekblue">Reading Comprehension</Tag>
                    {previewRow.groupTitle ? <Tag color="blue">{previewRow.groupTitle}</Tag> : null}
                    {previewRow.groupOrder ? <Tag color="purple">Q#{previewRow.groupOrder}</Tag> : null}
                  </div>
                  <Text className="text-[13px] leading-6 text-indigo-950">{previewRow.passageText}</Text>
                </Card>
              ) : null}

              <Card className="border border-slate-200" size="small">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Tag color="gold">{previewRow.difficulty || "medium"}</Tag>
                  {previewRow.topic ? <Tag color="default">{previewRow.topic}</Tag> : null}
                  {previewRow.section ? <Tag color="blue">{previewRow.section}</Tag> : null}
                </div>

                <div className="space-y-2">
                  {parseQuestionSegments(previewRow.question || "").map((seg, idx) =>
                    seg.kind === "code" ? (
                      <pre
                        key={`seg-${idx}`}
                        className="overflow-auto rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-xs leading-5 text-slate-100"
                      >
                        {seg.content}
                      </pre>
                    ) : (
                      <Text key={`seg-${idx}`} className="block text-[13px] leading-6 text-slate-900">
                        {seg.content}
                      </Text>
                    )
                  )}
                </div>
              </Card>

              <Card className="border border-slate-200" size="small">
                <Text strong className="block mb-2">
                  Options
                </Text>
                <Radio.Group value={null} className="w-full">
                  <Space direction="vertical" className="w-full">
                    {getOptionLines(previewRow).map((opt, idx) => (
                      <Radio key={`opt-${idx}`} value={idx} className="w-full">
                        <span className="text-[13px] leading-6 text-slate-800">
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                          {opt}
                        </span>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
                {getOptionLines(previewRow).length === 0 ? <Text type="secondary">No options</Text> : null}
              </Card>
            </div>

            <div className="md:col-span-2 space-y-3">
              {(previewRow.assets || []).filter((a) => Boolean(a?.url)).length > 0 ? (
                <Card className="border border-slate-200" size="small" title="Images">
                  <div className="flex flex-wrap gap-2">
                    {(previewRow.assets || [])
                      .filter((a) => Boolean(a?.url))
                      .slice(0, 6)
                      .map((asset, idx) => (
                        <a key={`${asset?.url}-${idx}`} href={String(asset?.url || "")} target="_blank" rel="noreferrer">
                          <Image
                            src={String(asset?.url || "")}
                            alt={String(asset?.alt || "Question image")}
                            width={160}
                            preview={false}
                            className="!rounded border border-slate-200 bg-white"
                          />
                        </a>
                      ))}
                  </div>
                </Card>
              ) : null}

              {showPreviewAnswer ? (
                <Card className="border border-emerald-200 bg-emerald-50/40" size="small" title="Answer & Explanation">
                  {(() => {
                    const options = getOptionLines(previewRow);
                    const answerIdx = resolveAnswerIndex(String(previewRow.answer || ""), options);
                    const answerLabel = answerIdx >= 0 ? String.fromCharCode(65 + answerIdx) : "";
                    return (
                      <div className="space-y-2">
                        <div>
                          <Text strong className="text-emerald-700">Answer</Text>
                          <div className="text-[13px] leading-6 text-emerald-950">
                            {answerLabel ? `${answerLabel}. ` : ""}{previewRow.answerKey ? `${previewRow.answerKey} • ` : ""}{previewRow.answer || "-"}
                          </div>
                        </div>
                        <div>
                          <Text strong className="text-emerald-700">Explanation</Text>
                          <div className="text-[13px] leading-6 text-emerald-950">{previewRow.explanation || "-"}</div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-3 rounded-md border border-cyan-200 bg-cyan-50 p-2">
                          <div>
                            <Text strong className="text-cyan-700">Parsed Key</Text>
                            <div className="text-[13px] leading-6 text-cyan-950">{previewRow.parsedAnswerKey || "-"}</div>
                          </div>
                          <div>
                            <Text strong className="text-cyan-700">Confidence</Text>
                            <div className="text-[13px] leading-6 text-cyan-950">{previewRow.answerConfidence || "unknown"}</div>
                          </div>
                          <div>
                            <Text strong className="text-cyan-700">Raw Snippet</Text>
                            <div className="text-[13px] leading-6 text-cyan-950">{previewRow.answerRawSnippet || "-"}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              ) : (
                <Card className="border border-amber-200 bg-amber-50/40" size="small">
                  <Text type="secondary">
                    This preview matches the exam-style view (answer hidden). Toggle “Show Answer” to inspect correctness.
                  </Text>
                </Card>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="AI Review Result"
        open={isAiResultOpen}
        onCancel={() => setIsAiResultOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsAiResultOpen(false)}>
            Close
          </Button>,
        ]}
        width={820}
        destroyOnHidden
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Tag color="blue">Provider: {lastAiResult?.provider || "-"}</Tag>
            <Tag color={lastAiResult?.fallbackUsed ? "orange" : "green"}>
              {lastAiResult?.fallbackUsed ? "Fallback Used" : "AI Live"}
            </Tag>
            <Tag color="gold">Score: {Number(lastAiResult?.aiReview?.score || 0)}</Tag>
            <Tag color="purple">Recommended: {lastAiResult?.aiReview?.recommendedStatus || "-"}</Tag>
            <Tag color={lastAiResult?.statusChanged ? "green" : "default"}>
              Status Changed: {lastAiResult?.statusChanged ? "Yes" : "No"}
            </Tag>
            <Tag color={lastAiResult?.editsApplied ? "green" : "default"}>
              Edits Applied: {lastAiResult?.editsApplied ? "Yes" : "No"}
            </Tag>
          </div>

          {lastAiResult?.providerError ? (
            <div
              className={`rounded p-2 text-xs ${
                lastAiResult?.fallbackUsed
                  ? "border border-amber-200 bg-amber-50 text-amber-900"
                  : "border border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              {lastAiResult?.fallbackUsed ? "Provider unavailable, fallback review used: " : "Provider Error: "}
              {lastAiResult.providerError}
            </div>
          ) : null}

          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <Text strong className="block !mb-1">Summary</Text>
            <Text className="text-[13px] text-slate-800">
              {lastAiResult?.aiReview?.summary || "-"}
            </Text>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded border border-slate-200 p-3">
              <Text strong className="block !mb-1">Issues</Text>
              {(lastAiResult?.aiReview?.issues || []).length > 0 ? (
                <ul className="list-disc space-y-1 pl-4 text-[13px] text-slate-700">
                  {(lastAiResult?.aiReview?.issues || []).map((issue, idx) => (
                    <li key={`issue-${idx}`}>{issue}</li>
                  ))}
                </ul>
              ) : (
                <Text type="secondary">No issues reported.</Text>
              )}
            </div>
            <div className="rounded border border-slate-200 p-3">
              <Text strong className="block !mb-1">Suggestions</Text>
              {(lastAiResult?.aiReview?.suggestions || []).length > 0 ? (
                <ul className="list-disc space-y-1 pl-4 text-[13px] text-slate-700">
                  {(lastAiResult?.aiReview?.suggestions || []).map((suggestion, idx) => (
                    <li key={`suggestion-${idx}`}>{suggestion}</li>
                  ))}
                </ul>
              ) : (
                <Text type="secondary">No suggestions reported.</Text>
              )}
            </div>
          </div>

          <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
            <Text strong className="block !mb-1">AI Updated Question Preview</Text>
            <Text className="block text-[13px] text-emerald-900">
              {lastAiResult?.aiReview?.updatedQuestion?.question || "-"}
            </Text>
            <Text className="mt-2 block text-xs text-emerald-800">
              Answer: {lastAiResult?.aiReview?.updatedQuestion?.answerKey || "-"} •{" "}
              {lastAiResult?.aiReview?.updatedQuestion?.answer || "-"}
            </Text>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex flex-wrap items-center gap-2">
            <span>Edit Question</span>
            <Tag color="blue">{editingRow?.examSlug || "-"}</Tag>
            <Tag color="default">{editingRow?.stageSlug || "-"}</Tag>
            <Tag color="purple">#{editingRow?.questionNumber || "-"}</Tag>
            {editingRow?.groupType === "rc_passage" ? <Tag color="geekblue">RC</Tag> : null}
            {editingRow?.groupType === "rc_passage" && editingRow?.groupId ? (
              <Tag color="default">{editingRow.groupId}</Tag>
            ) : null}
          </div>
        }
        open={isEditOpen}
        onCancel={() => {
          setIsEditOpen(false);
          setEditingRow(null);
        }}
        footer={
          <Space>
            <Button
              onClick={() => {
                setIsEditOpen(false);
                setEditingRow(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => saveEdit(false)} loading={isSavingEdit}>
              Save
            </Button>
            <Button type="primary" onClick={() => saveEdit(true)} loading={isSavingEdit}>
              Save & Approve
            </Button>
          </Space>
        }
        width={880}
        destroyOnHidden
      >
        <Form layout="vertical" form={form}>
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <Form.Item
              label="Question"
              name="question"
              className="!mb-2"
              rules={[{ required: true, message: "Question is required" }]}
            >
              <Input.TextArea ref={questionRef} rows={3} placeholder="Write the final, student-facing question statement." />
            </Form.Item>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Text type="secondary" className="text-xs">
                Math tools:
              </Text>
              <Button size="small" onClick={() => insertIntoTextAreaField("question", questionRef, "²")}>
                ²
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("question", questionRef, "³")}>
                ³
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("question", questionRef, "√")}>
                √
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("question", questionRef, "∛")}>
                ∛
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("question", questionRef, "π")}>
                π
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("question", questionRef, "×")}>
                ×
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("question", questionRef, "÷")}>
                ÷
              </Button>
            </div>
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item label="Section" name="section" className="!mb-0">
                  <Select
                    showSearch
                    allowClear
                    loading={isLoadingEditSections}
                    placeholder="Select section from blueprint"
                    options={editSectionOptions}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Topic" name="topic" className="!mb-0">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select or type topic"
                    options={
                      watchedEditSection && editSectionTopicsMap[String(watchedEditSection)]?.length
                        ? editSectionTopicsMap[String(watchedEditSection)].map((topic) => ({
                            value: topic,
                            label: topic,
                          }))
                        : editTopicOptions.length > 0
                        ? editTopicOptions
                        : REVIEW_TOPICS
                    }
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item label="Difficulty" name="difficulty" className="!mb-0">
                  <Select
                    options={[
                      { value: "easy", label: "Easy" },
                      { value: "medium", label: "Medium" },
                      { value: "hard", label: "Hard" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item label="Q. Number" name="questionNumber" className="!mb-0">
                  <InputNumber min={1} max={500} className="w-full" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <Text strong>RC Passage Group</Text>
              <Tag color={watchedGroupType === "rc_passage" ? "geekblue" : "default"}>
                {watchedGroupType === "rc_passage" ? "rc_passage" : "none"}
              </Tag>
            </div>

            <Row gutter={12}>
              <Col xs={24} md={6}>
                <Form.Item label="Group Type" name="groupType" className="!mb-2">
                  <Select
                    options={[
                      { value: "none", label: "none" },
                      { value: "rc_passage", label: "rc_passage" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  label="Group ID"
                  name="groupId"
                  className="!mb-2"
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (watchedGroupType !== "rc_passage") return Promise.resolve();
                        if (String(value || "").trim()) return Promise.resolve();
                        return Promise.reject(new Error("Group ID is required for rc_passage"));
                      },
                    },
                  ]}
                >
                  <Input placeholder="e.g., rc-sbi-2025-shift1-p1" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Group Title" name="groupTitle" className="!mb-2">
                  <Input placeholder="e.g., Directions (1-5)" />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Group Order" name="groupOrder" className="!mb-2">
                  <InputNumber min={1} max={200} className="w-full" />
                </Form.Item>
              </Col>
            </Row>

            {watchedGroupType === "rc_passage" ? (
              <>
                <Form.Item
                  label="Passage Text"
                  name="passageText"
                  className="!mb-2"
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (watchedGroupType !== "rc_passage") return Promise.resolve();
                        if (String(value || "").trim()) return Promise.resolve();
                        return Promise.reject(new Error("Passage text is required for rc_passage"));
                      },
                    },
                  ]}
                >
                  <Input.TextArea ref={passageRef} rows={5} placeholder="Paste reading comprehension passage text here." />
                </Form.Item>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Text type="secondary" className="text-xs">
                    Math tools:
                  </Text>
                  <Button size="small" onClick={() => insertIntoTextAreaField("passageText", passageRef, "²")}>
                    ²
                  </Button>
                  <Button size="small" onClick={() => insertIntoTextAreaField("passageText", passageRef, "³")}>
                    ³
                  </Button>
                  <Button size="small" onClick={() => insertIntoTextAreaField("passageText", passageRef, "√")}>
                    √
                  </Button>
                  <Button size="small" onClick={() => insertIntoTextAreaField("passageText", passageRef, "∛")}>
                    ∛
                  </Button>
                  <Button size="small" onClick={() => insertIntoTextAreaField("passageText", passageRef, "π")}>
                    π
                  </Button>
                  <Button size="small" onClick={() => insertIntoTextAreaField("passageText", passageRef, "×")}>
                    ×
                  </Button>
                  <Button size="small" onClick={() => insertIntoTextAreaField("passageText", passageRef, "÷")}>
                    ÷
                  </Button>
                </div>

                <Form.Item
                  name="applyRcToGroup"
                  valuePropName="checked"
                  className="!mb-0"
                  extra="When enabled, passage/group metadata updates apply to all questions that share this groupId for the same owner."
                >
                  <Switch checkedChildren="Apply to group" unCheckedChildren="Only this question" />
                </Form.Item>
              </>
            ) : (
              <Text type="secondary" className="text-xs">
                Use rc_passage only for reading comprehension sets (passage + multiple questions).
              </Text>
            )}
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <Text strong>Options</Text>
              <Tag color={optionsCount >= 2 ? "green" : "red"}>{optionsCount} option(s)</Tag>
            </div>
            <Form.Item
              name="optionsText"
              className="!mb-2"
              rules={[
                {
                  validator: (_, value) => {
                    const count = String(value || "")
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean).length;
                    if (count === 0) return Promise.resolve();
                    if (count < 2) return Promise.reject(new Error("If provided, add at least 2 options"));
                    if (count > 5) return Promise.reject(new Error("Maximum 5 options allowed"));
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input.TextArea ref={optionsRef} rows={6} placeholder={"Option A\nOption B\nOption C\nOption D"} />
            </Form.Item>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Text type="secondary" className="text-xs">
                Math tools:
              </Text>
              <Button size="small" onClick={() => insertIntoTextAreaField("optionsText", optionsRef, "²")}>
                ²
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("optionsText", optionsRef, "³")}>
                ³
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("optionsText", optionsRef, "√")}>
                √
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("optionsText", optionsRef, "π")}>
                π
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("optionsText", optionsRef, "×")}>
                ×
              </Button>
              <Button size="small" onClick={() => insertIntoTextAreaField("optionsText", optionsRef, "÷")}>
                ÷
              </Button>
            </div>
            <Text type="secondary">Use one option per line. Keep option text concise and unambiguous.</Text>
            {watchedOptionsList.length > 0 ? (
              <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2">
                <Text type="secondary" className="text-xs">Click an option to auto-set Answer + Answer Key:</Text>
                <div className="mt-2 flex flex-wrap gap-2">
                  {watchedOptionsList.map((opt, idx) => {
                    const key = String.fromCharCode(65 + idx);
                    return (
                      <Button
                        key={`edit-answer-pick-${idx}`}
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({
                            answer: opt,
                            answerKey: key,
                          });
                        }}
                      >
                        {key}. {opt}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 p-3">
            <Row gutter={12}>
              <Col xs={24} md={8}>
                <Form.Item label="Answer (text)" name="answer" className="!mb-2">
                  <Input placeholder="Exact correct option text" />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Answer Key" name="answerKey" className="!mb-2">
                  <Select
                    allowClear
                    placeholder="A-E"
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
                <Form.Item label="Explanation" name="explanation" className="!mb-2">
                  <Input.TextArea rows={2} placeholder="Short reasoning to explain the correct answer." />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <Text strong>Question Assets</Text>
              <Space>
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
                  Open Library
                </Button>
              </Space>
            </div>
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
            {editAssets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {editAssets.map((asset, idx) => (
                  <div key={`edit-asset-${idx}`} className="rounded border border-slate-200 bg-white p-2">
                    <Image
                      src={String(asset?.url || "")}
                      alt={String(asset?.alt || "Question asset")}
                      width={120}
                      height={90}
                    />
                    <div className="mt-1 flex justify-end">
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setEditAssets((prev) => prev.filter((_, removeIdx) => removeIdx !== idx));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">No assets attached.</Text>
            )}
          </div>
        </Form>
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
                <Image src={item.url} alt={item.fileName} width={150} height={110} />
                <Button
                  size="small"
                  type="primary"
                  className="mt-2 w-full"
                  onClick={() => {
                    setEditAssets((prev) => [
                      ...prev,
                      { kind: "image", url: item.url, alt: item.fileName },
                    ]);
                    message.success("Asset attached to question.");
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
