"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Col, Form, Image, Input, InputNumber, Modal, Radio, Row, Select, Space, Switch, Tag, Typography, message } from "antd";
import { CheckOutlined, EditOutlined, LeftOutlined, ReloadOutlined, RightOutlined, SaveOutlined, StopOutlined } from "@ant-design/icons";
import { useParams, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import type { TextAreaRef } from "antd/es/input/TextArea";

const { Title, Text } = Typography;

type ReviewStatus = "draft" | "reviewed" | "approved" | "rejected";

type ReviewRow = {
  id: string;
  examSlug: string;
  stageSlug: string;
  section: string;
  topic: string;
  difficulty: string;
  question: string;
  options?: Array<string | { id?: string; text?: string; value?: string; label?: string }>;
  optionObjects?: Array<{ id?: string; text?: string }>;
  answer?: string;
  answerKey?: string;
  explanation?: string;
  questionNumber?: number | null;
  reviewStatus: ReviewStatus;
  groupType?: "none" | "rc_passage";
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
};

type ReviewListResponse = {
  data?: {
    items: ReviewRow[];
    total: number;
    page: number;
    limit: number;
  };
};

type ReviewUpdateResponse = {
  data?: {
    matched: number;
    modified: number;
    reviewStatus: ReviewStatus;
  };
};

type QuestionSegment =
  | { kind: "text"; content: string }
  | { kind: "code"; language: string; content: string };

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

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
      if (textChunk) segments.push({ kind: "text", content: textChunk });
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
    if (tail) segments.push({ kind: "text", content: tail });
  }

  return segments.length > 0 ? segments : [{ kind: "text", content: source }];
};

const getOptionLines = (row: ReviewRow) => {
  const fromOptionObjects = Array.isArray(row.optionObjects)
    ? row.optionObjects
        .map((item) => String(item?.text || "").trim())
        .filter(Boolean)
    : [];
  if (fromOptionObjects.length > 0) return fromOptionObjects;

  return Array.isArray(row.options)
    ? row.options
        .map((item) => {
          if (typeof item === "string") return item.trim();
          return String(item?.text || item?.value || item?.label || "").trim();
        })
        .filter(Boolean)
    : [];
};

const resolveAnswerIndex = (row: ReviewRow, options: string[]) => {
  const key = normalizeText(row.answerKey || "").toUpperCase();
  if (key && /^[A-E]$/.test(key)) {
    return key.charCodeAt(0) - 65;
  }
  const normalizedAnswer = normalizeText(row.answer || "").toLowerCase();
  if (!normalizedAnswer) return -1;
  const idx = options.findIndex((opt) => normalizeText(opt).toLowerCase() === normalizedAnswer);
  return idx >= 0 ? idx : -1;
};

export default function DraftExamPreviewPage() {
  const params = useParams<{ lang?: string }>();
  const searchParams = useSearchParams();
  const lang = params?.lang || "en";

  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [scope, setScope] = useState<"global" | "owner">((searchParams.get("scope") as "global" | "owner") || "global");
  const [examSlug, setExamSlug] = useState(searchParams.get("examSlug") || "");
  const [stageSlug, setStageSlug] = useState(searchParams.get("stageSlug") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [limit] = useState(200);

  const current = rows[currentIndex] || null;
  const currentOptions = useMemo(() => (current ? getOptionLines(current) : []), [current]);
  const currentAnswerIdx = useMemo(() => (current ? resolveAnswerIndex(current, currentOptions) : -1), [current, currentOptions]);

  const [editForm] = Form.useForm();
  const watchedGroupType = Form.useWatch("groupType", editForm);
  const editQuestionRef = useRef<TextAreaRef | null>(null);
  const editPassageRef = useRef<TextAreaRef | null>(null);
  const editOptionsRef = useRef<TextAreaRef | null>(null);
  const [editingRow, setEditingRow] = useState<ReviewRow | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ReviewListResponse>(API_ENDPOINTS.questionBank.reviewList, {
        params: {
          scope,
          reviewStatus: "draft",
          examSlug: examSlug || undefined,
          stageSlug: stageSlug || undefined,
          search: search || undefined,
          page: 1,
          limit,
        },
      });
      const payload = response.data?.data;
      const items = Array.isArray(payload?.items) ? payload!.items : [];
      setRows(items);
      setTotal(Number(payload?.total || items.length || 0));
      setCurrentIndex(0);
      setShowAnswer(false);
      if (items.length === 0) {
        message.info("No draft questions found for these filters.");
      }
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, "Unable to load draft questions."));
    } finally {
      setIsLoading(false);
    }
  }, [examSlug, limit, scope, search, stageSlug]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const openEdit = (row: ReviewRow) => {
    setEditingRow(row);
    editForm.setFieldsValue({
      question: row.question || "",
      topic: row.topic || "",
      section: row.section || "",
      difficulty: row.difficulty || "medium",
      questionNumber: row.questionNumber ?? null,
      optionsText: getOptionLines(row).join("\n"),
      answer: row.answer || "",
      answerKey: row.answerKey || "",
      explanation: row.explanation || "",
      groupType: row.groupType || "none",
      groupId: row.groupId || "",
      groupTitle: row.groupTitle || "",
      groupOrder: row.groupOrder ?? null,
      passageText: row.passageText || "",
      applyRcToGroup: true,
    });
    setIsEditOpen(true);
  };

  const insertIntoEditField = (fieldName: string, ref: { current: TextAreaRef | null }, insertion: string) => {
    const value = String(editForm.getFieldValue(fieldName) || "");
    const textArea = ref.current?.resizableTextArea?.textArea;

    if (!textArea) {
      editForm.setFieldsValue({ [fieldName]: `${value}${insertion}` });
      return;
    }

    const start = Number(textArea.selectionStart || 0);
    const end = Number(textArea.selectionEnd || 0);
    const next = value.slice(0, start) + insertion + value.slice(end);
    const nextCursor = start + insertion.length;
    editForm.setFieldsValue({ [fieldName]: next });

    setTimeout(() => {
      try {
        textArea.focus();
        textArea.setSelectionRange(nextCursor, nextCursor);
      } catch {}
    }, 0);
  };

  const saveEdit = async () => {
    if (!editingRow) return;
    try {
      const values = await editForm.validateFields();
      const options = String(values.optionsText || "")
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean)
        .slice(0, 5);

      const payload: Record<string, unknown> = {
        question: String(values.question || "").trim(),
        topic: String(values.topic || "").trim(),
        section: String(values.section || "").trim(),
        difficulty: String(values.difficulty || "medium").trim(),
        questionNumber:
          values.questionNumber === null || values.questionNumber === undefined || values.questionNumber === ""
            ? null
            : Number(values.questionNumber),
        answer: String(values.answer || "").trim(),
        answerKey: String(values.answerKey || "").trim(),
        explanation: String(values.explanation || "").trim(),
        groupType: String(values.groupType || "none").trim(),
        groupId: String(values.groupId || "").trim(),
        groupTitle: String(values.groupTitle || "").trim(),
        passageText: String(values.passageText || "").trim(),
        groupOrder:
          values.groupOrder === null || values.groupOrder === undefined || values.groupOrder === ""
            ? null
            : Number(values.groupOrder),
        applyRcToGroup: Boolean(values.applyRcToGroup),
      };

      if (options.length > 0) payload.options = options;

      setIsSaving(true);
      await apiClient.put(API_ENDPOINTS.questionBank.reviewItemById(editingRow.id), payload);
      message.success("Draft updated.");

      const currentId = current?.id || "";
      setIsEditOpen(false);
      setEditingRow(null);
      await fetchDrafts();
      if (currentId) {
        const nextIndex = rows.findIndex((r) => r.id === currentId);
        if (nextIndex >= 0) setCurrentIndex(nextIndex);
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errorFields" in error) return;
      message.error(getApiErrorMessage(error, "Failed to save edits."));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (row: ReviewRow, reviewStatus: ReviewStatus) => {
    try {
      await apiClient.put<ReviewUpdateResponse>(API_ENDPOINTS.questionBank.reviewStatus, {
        ids: [row.id],
        reviewStatus,
      });
      message.success(`Marked as ${reviewStatus}.`);
      await fetchDrafts();
    } catch (error: unknown) {
      message.error(getApiErrorMessage(error, "Failed to update status."));
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <Title level={4} className="!mb-1">
          Draft Question Exam Preview
        </Title>
        <Text type="secondary">
          Admin-only preview using exam-style UX for <Text code>draft</Text> questions. URL: <Text code>/{lang}/admin/tests/draft-exam</Text>
        </Text>
      </Card>

      <Card>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}>
            <Text strong>Scope</Text>
            <Select
              className="!mt-1 w-full"
              value={scope}
              onChange={(value) => setScope(value as "global" | "owner")}
              options={[
                { value: "global", label: "Global" },
                { value: "owner", label: "Owner" },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Exam Slug</Text>
            <Input className="!mt-1" value={examSlug} onChange={(e) => setExamSlug(e.target.value)} placeholder="sbi-clerk" />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Stage Slug</Text>
            <Input className="!mt-1" value={stageSlug} onChange={(e) => setStageSlug(e.target.value)} placeholder="prelims" />
          </Col>
          <Col xs={24} md={6}>
            <Text strong>Search</Text>
            <Input className="!mt-1" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="keyword" />
          </Col>
        </Row>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={fetchDrafts} loading={isLoading}>
              Refresh Drafts
            </Button>
            <Switch checked={showAnswer} onChange={setShowAnswer} checkedChildren="Show Answer" unCheckedChildren="Hide Answer" />
          </Space>
          <Text type="secondary">
            Loaded: {rows.length} / {total}
          </Text>
        </div>
      </Card>

      {!current ? (
        <Alert type="info" showIcon message="No draft questions loaded." />
      ) : (
        <Row gutter={[12, 12]}>
          <Col xs={24} md={6}>
            <Card
              title="Drafts"
              size="small"
              extra={<Text type="secondary">{currentIndex + 1}/{rows.length}</Text>}
              className="h-full"
            >
              <div className="max-h-[70vh] overflow-auto space-y-1">
                {rows.map((row, idx) => (
                  <button
                    key={row.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowAnswer(false);
                    }}
                    className={`w-full rounded border px-2 py-1.5 text-left text-xs ${
                      idx === currentIndex ? "border-blue-300 bg-blue-50 text-blue-900" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">Q{row.questionNumber || idx + 1}</span>
                      {row.groupType === "rc_passage" ? <Tag color="geekblue" className="!mb-0">RC</Tag> : null}
                    </div>
                    <div className="line-clamp-2 mt-1 text-[11px] text-slate-600">{row.question || "-"}</div>
                  </button>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={18}>
            <Card
              size="small"
              title={
                <div className="flex flex-wrap items-center gap-2">
                  <Tag color="blue">{current.examSlug}</Tag>
                  <Tag color="geekblue">{current.stageSlug}</Tag>
                  <Tag color="gold">{current.difficulty || "medium"}</Tag>
                  {current.topic ? <Tag color="default">{current.topic}</Tag> : null}
                  {current.section ? <Tag color="purple">{current.section}</Tag> : null}
                  {current.reviewStatus ? <Tag>{current.reviewStatus}</Tag> : null}
                </div>
              }
              extra={
                <Space wrap>
                  <Button
                    icon={<LeftOutlined />}
                    disabled={currentIndex <= 0}
                    onClick={() => {
                      setCurrentIndex((v) => Math.max(0, v - 1));
                      setShowAnswer(false);
                    }}
                  />
                  <Button
                    icon={<RightOutlined />}
                    disabled={currentIndex >= rows.length - 1}
                    onClick={() => {
                      setCurrentIndex((v) => Math.min(rows.length - 1, v + 1));
                      setShowAnswer(false);
                    }}
                  />
                  <Button icon={<EditOutlined />} onClick={() => openEdit(current)}>
                    Edit
                  </Button>
                  <Button type="primary" icon={<CheckOutlined />} onClick={() => updateStatus(current, "approved")}>
                    Approve
                  </Button>
                  <Button icon={<CheckOutlined />} onClick={() => updateStatus(current, "reviewed")}>
                    Reviewed
                  </Button>
                  <Button danger icon={<StopOutlined />} onClick={() => updateStatus(current, "rejected")}>
                    Reject
                  </Button>
                </Space>
              }
            >
              <div className="space-y-3">
                {current.groupType === "rc_passage" && current.passageText ? (
                  <Card className="border border-indigo-200 bg-indigo-50/40" size="small">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Tag color="geekblue">Directions</Tag>
                      {current.groupTitle ? <Tag color="blue">{current.groupTitle}</Tag> : null}
                      {current.groupOrder ? <Tag color="purple">#{current.groupOrder}</Tag> : null}
                    </div>
                    <Text className="text-[13px] leading-6 text-indigo-950">{current.passageText}</Text>
                  </Card>
                ) : null}

                {(current.assets || []).filter((a) => Boolean(a?.url)).length > 0 ? (
                  <Card className="border border-slate-200" size="small" title="Images">
                    <div className="flex flex-wrap gap-2">
                      {(current.assets || [])
                        .filter((a) => Boolean(a?.url))
                        .slice(0, 8)
                        .map((asset, idx) => (
                          <a key={`${asset?.url}-${idx}`} href={String(asset?.url || "")} target="_blank" rel="noreferrer">
                            <Image
                              src={String(asset?.url || "")}
                              alt={String(asset?.alt || "Question image")}
                              width={180}
                              preview={false}
                              className="!rounded border border-slate-200 bg-white"
                            />
                          </a>
                        ))}
                    </div>
                  </Card>
                ) : null}

                <Card className="border border-slate-200" size="small">
                  <div className="space-y-2">
                    {parseQuestionSegments(current.question || "").map((seg, idx) =>
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

                <Card className="border border-slate-200" size="small" title="Options">
                  {currentOptions.length === 0 ? (
                    <Text type="secondary">No options</Text>
                  ) : (
                    <Radio.Group value={null} className="w-full">
                      <Space direction="vertical" className="w-full">
                        {currentOptions.map((opt, idx) => {
                          const isCorrect = showAnswer && currentAnswerIdx === idx;
                          return (
                            <div
                              key={`opt-${idx}`}
                              className={`rounded border px-2.5 py-2 ${isCorrect ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}
                            >
                              <Radio value={idx} className="w-full">
                                <span className="text-[13px] leading-6 text-slate-800">
                                  <span className={`mr-2 font-semibold ${isCorrect ? "text-emerald-700" : ""}`}>
                                    {String.fromCharCode(65 + idx)}.
                                  </span>
                                  {opt}
                                </span>
                              </Radio>
                            </div>
                          );
                        })}
                      </Space>
                    </Radio.Group>
                  )}
                </Card>

                {showAnswer ? (
                  <Card className="border border-emerald-200 bg-emerald-50/40" size="small" title="Answer & Explanation">
                    <div className="space-y-2">
                      <div>
                        <Text strong className="text-emerald-700">Answer</Text>
                        <div className="text-[13px] leading-6 text-emerald-950">
                          {normalizeText(current.answerKey) ? `${normalizeText(current.answerKey)} • ` : ""}
                          {current.answer || "-"}
                        </div>
                      </div>
                      <div>
                        <Text strong className="text-emerald-700">Explanation</Text>
                        <div className="text-[13px] leading-6 text-emerald-950">{current.explanation || "-"}</div>
                      </div>
                    </div>
                  </Card>
                ) : null}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Modal
        title="Edit Draft"
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
            <Button type="primary" icon={<SaveOutlined />} onClick={saveEdit} loading={isSaving}>
              Save
            </Button>
          </Space>
        }
        width={900}
        destroyOnHidden
      >
        <Form layout="vertical" form={editForm}>
          <Form.Item label="Question" name="question" rules={[{ required: true, message: "Question is required" }]}>
            <Input.TextArea ref={editQuestionRef} rows={3} />
          </Form.Item>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Text type="secondary" className="text-xs">
              Math tools:
            </Text>
            <Button size="small" onClick={() => insertIntoEditField("question", editQuestionRef, "²")}>
              ²
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("question", editQuestionRef, "³")}>
              ³
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("question", editQuestionRef, "√")}>
              √
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("question", editQuestionRef, "∛")}>
              ∛
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("question", editQuestionRef, "π")}>
              π
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("question", editQuestionRef, "×")}>
              ×
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("question", editQuestionRef, "÷")}>
              ÷
            </Button>
          </div>
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item label="Topic" name="topic">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Section" name="section">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Difficulty" name="difficulty">
                <Select
                  options={[
                    { value: "easy", label: "easy" },
                    { value: "medium", label: "medium" },
                    { value: "hard", label: "hard" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={4}>
              <Form.Item label="Q. Number" name="questionNumber">
                <InputNumber min={1} max={500} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Card className="border border-indigo-200 bg-indigo-50/40" size="small" title="RC Passage (Optional)">
            <Row gutter={12}>
              <Col xs={24} md={6}>
                <Form.Item label="Group Type" name="groupType" className="!mb-2">
                  <Select options={[{ value: "none", label: "none" }, { value: "rc_passage", label: "rc_passage" }]} />
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
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Group Title" name="groupTitle" className="!mb-2">
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item label="Group Order" name="groupOrder" className="!mb-2">
                  <InputNumber min={1} max={200} className="w-full" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Passage Text"
              name="passageText"
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
              <Input.TextArea ref={editPassageRef} rows={4} />
            </Form.Item>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Text type="secondary" className="text-xs">
                Math tools:
              </Text>
              <Button size="small" onClick={() => insertIntoEditField("passageText", editPassageRef, "²")}>
                ²
              </Button>
              <Button size="small" onClick={() => insertIntoEditField("passageText", editPassageRef, "³")}>
                ³
              </Button>
              <Button size="small" onClick={() => insertIntoEditField("passageText", editPassageRef, "√")}>
                √
              </Button>
              <Button size="small" onClick={() => insertIntoEditField("passageText", editPassageRef, "∛")}>
                ∛
              </Button>
              <Button size="small" onClick={() => insertIntoEditField("passageText", editPassageRef, "π")}>
                π
              </Button>
              <Button size="small" onClick={() => insertIntoEditField("passageText", editPassageRef, "×")}>
                ×
              </Button>
              <Button size="small" onClick={() => insertIntoEditField("passageText", editPassageRef, "÷")}>
                ÷
              </Button>
            </div>
            <Form.Item name="applyRcToGroup" valuePropName="checked" className="!mb-0">
              <Switch checkedChildren="Apply to group" unCheckedChildren="Only this question" />
            </Form.Item>
          </Card>

          <Form.Item label="Options (one per line)" name="optionsText" className="!mt-3">
            <Input.TextArea ref={editOptionsRef} rows={6} placeholder={"Option A\nOption B\nOption C\nOption D\nOption E"} />
          </Form.Item>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Text type="secondary" className="text-xs">
              Math tools:
            </Text>
            <Button size="small" onClick={() => insertIntoEditField("optionsText", editOptionsRef, "²")}>
              ²
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("optionsText", editOptionsRef, "³")}>
              ³
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("optionsText", editOptionsRef, "√")}>
              √
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("optionsText", editOptionsRef, "π")}>
              π
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("optionsText", editOptionsRef, "×")}>
              ×
            </Button>
            <Button size="small" onClick={() => insertIntoEditField("optionsText", editOptionsRef, "÷")}>
              ÷
            </Button>
          </div>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item label="Answer (text)" name="answer">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label="Answer Key" name="answerKey">
                <Input placeholder="A" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Explanation" name="explanation">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
