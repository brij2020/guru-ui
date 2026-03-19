"use client";

import { useState, useEffect } from "react";
import { Typography, Button, Card, Row, Col } from "antd";
import { useRouter } from "next/navigation";
import {
  AppstoreOutlined,
  CodeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  FormOutlined,
  FireOutlined,
  RocketOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Test, TestQuestion, getQuestionTypeDisplay } from "@/utils/testData";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";

const { Title, Text } = Typography;

interface DifficultyOption {
  key: string;
  label: string;
  desc: string;
  color?: string;
  order?: number;
}

interface ListDifficultiesResponse {
  data?: Array<{
    _id: string;
    level: string;
  }>;
}

interface TopicOption {
  key: string;
  label: string;
}

interface ListTopicsResponse {
  data?: Array<{
    _id: string;
    name: string;
  }>;
}

interface QuestionStyleOption {
  key: string;
  label: string;
}

interface ListQuestionStylesResponse {
  data?: Array<{
    _id: string;
    style: string;
  }>;
}

interface QuestionCountOption {
  key: string;
  label: string;
  desc: string;
}

type AttemptMode = "practice" | "exam";

interface ListQuestionCountsResponse {
  data?: Array<{
    _id: string;
    count: number;
  }>;
}

const fallbackDifficultyLevels: DifficultyOption[] = [
  { key: "all", label: "All Levels", color: "#e0f2fe", desc: "Mix of all difficulty levels", order: 1 },
  { key: "easy", label: "Easy", color: "#dcfce7", desc: "Beginner friendly questions", order: 2 },
  { key: "medium", label: "Medium", color: "#ffedd5", desc: "Balanced mix of challenges", order: 3 },
  { key: "hard", label: "Hard", color: "#fee2e2", desc: "Advanced level challenges", order: 4 },
];

const normalizeDifficultyKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const mapDifficultyLevels = (
  levels: Array<{
    _id: string;
    level: string;
  }>
): DifficultyOption[] => {
  const unique = new Map<string, DifficultyOption>();

  for (const item of levels) {
    const key = normalizeDifficultyKey(item.level);
    if (!key || unique.has(key)) {
      continue;
    }

    unique.set(key, {
      key,
      label: item.level.trim(),
      desc: `${item.level.trim()} level questions`,
    });
  }

  const knownOrder: Record<string, number> = {
    easy: 2,
    medium: 3,
    hard: 4,
  };

  const mapped = Array.from(unique.values()).sort((a, b) => {
    const aRank = knownOrder[a.key] ?? 50;
    const bRank = knownOrder[b.key] ?? 50;
    if (aRank !== bRank) {
      return aRank - bRank;
    }
    return a.label.localeCompare(b.label);
  });

  return [
    { key: "all", label: "All Levels", color: "#e0f2fe", desc: "Mix of all difficulty levels", order: 1 },
    ...mapped,
  ];
};

const mapTopics = (
  topics: Array<{
    _id: string;
    name: string;
  }>
): TopicOption[] => {
  const unique = new Map<string, TopicOption>();
  for (const item of topics) {
    const label = item.name.trim();
    const key = normalizeDifficultyKey(label);
    if (!label || unique.has(key)) {
      continue;
    }
    unique.set(key, { key, label });
  }

  return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
};

const mapTopicsFromQuestions = (questions: TestQuestion[]): TopicOption[] =>
  Array.from(new Set(questions.map((q) => q.type))).map((type) => ({
    key: normalizeDifficultyKey(type),
    label: getQuestionTypeDisplay(type),
  }));

const fallbackQuestionStyles: QuestionStyleOption[] = [
  { key: "mcq", label: "MCQ" },
  { key: "io", label: "IO" },
  { key: "problem solving", label: "Problem Solving" },
  { key: "output based", label: "Output Based" },
];

const mapQuestionStyles = (
  styles: Array<{
    _id: string;
    style: string;
  }>
): QuestionStyleOption[] => {
  const unique = new Map<string, QuestionStyleOption>();
  for (const item of styles) {
    const label = item.style.trim();
    const key = normalizeDifficultyKey(label);
    if (!label || unique.has(key)) {
      continue;
    }
    unique.set(key, { key, label });
  }
  return Array.from(unique.values()).sort((a, b) => a.label.localeCompare(b.label));
};

const fallbackQuestionCounts = [5, 10, 15, 20, 25, 30];

const buildQuestionCountOptions = (counts: number[], totalQuestions: number): QuestionCountOption[] => {
  const options = counts.filter((count) => count > 0);
  const unique = Array.from(new Set(options)).sort((a, b) => a - b);

  return [
    { key: "all", label: "All Questions", desc: `Use all available ${totalQuestions} questions` },
    ...unique.map((count) => ({
      key: String(count),
      label: `${count} Questions`,
      desc: `Attempt first ${count} questions`,
    })),
  ];
};

const mapQuestionCounts = (
  counts: Array<{
    _id: string;
    count: number;
  }>
): number[] => {
  const values = counts
    .map((item) => item.count)
    .filter((count) => Number.isFinite(count) && count > 0);

  return Array.from(new Set(values)).sort((a, b) => a - b);
};

const NumberBadge = ({ value, selected }: { value: string; selected: boolean }) => (
  <div
    style={{
      width: 44,
      height: 44,
      minWidth: 44,
      minHeight: 44,
      maxWidth: 44,
      maxHeight: 44,
      aspectRatio: "1 / 1",
      borderRadius: "999px",
      background: selected ? "#2563eb" : "#e2e8f0",
      color: selected ? "#fff" : "#334155",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      lineHeight: 1,
      fontSize: value === "all" ? 11 : 15,
      fontWeight: 700,
      letterSpacing: value === "all" ? "0.04em" : "normal",
    }}
  >
    {value === "all" ? "ALL" : value}
  </div>
);

const topicVisuals: Record<string, { icon: React.ReactNode }> = {
  mcq: { icon: <CheckCircleOutlined /> },
  theory: { icon: <FileTextOutlined /> },
  coding: { icon: <CodeOutlined /> },
  output: { icon: <FormOutlined /> },
  scenario: { icon: <BulbOutlined /> },
};

const getTopicIcon = (topicKey: string, topicLabel: string) => {
  const key = normalizeDifficultyKey(topicKey);
  const label = normalizeDifficultyKey(topicLabel);
  const value = `${key} ${label}`;

  if (value.includes("mcq") || value.includes("choice") || value.includes("quiz")) {
    return <CheckCircleOutlined />;
  }
  if (value.includes("theory") || value.includes("concept") || value.includes("fundamental")) {
    return <FileTextOutlined />;
  }
  if (value.includes("coding") || value.includes("code") || value.includes("program")) {
    return <CodeOutlined />;
  }
  if (value.includes("output") || value.includes("io") || value.includes("input")) {
    return <FormOutlined />;
  }
  if (value.includes("scenario") || value.includes("case") || value.includes("problem")) {
    return <BulbOutlined />;
  }
  if (value.includes("sql") || value.includes("database") || value.includes("mongo")) {
    return <DatabaseOutlined />;
  }
  if (value.includes("api") || value.includes("backend") || value.includes("server")) {
    return <CloudServerOutlined />;
  }
  if (value.includes("devops") || value.includes("tools") || value.includes("docker")) {
    return <ToolOutlined />;
  }

  return topicVisuals[key]?.icon || <AppstoreOutlined />;
};

export default function DifficultyPage() {
  const [attemptMode, setAttemptMode] = useState<AttemptMode>("exam");
  const [level, setLevel] = useState("all");
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [testInfo, setTestInfo] = useState<Test | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedQuestionStyles, setSelectedQuestionStyles] = useState<string[]>([]);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<string>("all");
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyOption[]>(fallbackDifficultyLevels);
  const [topicOptions, setTopicOptions] = useState<TopicOption[]>([]);
  const [questionStyleOptions, setQuestionStyleOptions] = useState<QuestionStyleOption[]>(fallbackQuestionStyles);
  const [questionCountValues, setQuestionCountValues] = useState<number[]>(fallbackQuestionCounts);
  const router = useRouter();

  const getDifficultyIcon = (key: string) => {
    if (key === "easy") return <CheckCircleOutlined />;
    if (key === "medium") return <FireOutlined />;
    if (key === "hard") return <RocketOutlined />;
    return <AppstoreOutlined />;
  };

  useEffect(() => {
    const initializePage = async () => {
      const storedTest = sessionStorage.getItem('currentTest');
      if (storedTest) {
        const test = JSON.parse(storedTest);
        setTestInfo(test);
        setStep(1);
        setAttemptMode("exam");
        setSelectedTopics([]);
        setSelectedQuestionStyles([]);
        setSelectedQuestionCount("all");
        setTopicOptions(mapTopicsFromQuestions(test.questions));
      } else {
        router.push('/tests');
      }

      try {
        const res = await apiClient.get<ListDifficultiesResponse>(API_ENDPOINTS.difficultyLevels.list);
        const difficulties = Array.isArray(res.data?.data) ? mapDifficultyLevels(res.data.data) : [];
        if (difficulties.length > 1) {
          setDifficultyLevels(difficulties);
        }
      } catch {
        setDifficultyLevels(fallbackDifficultyLevels);
      }

      try {
        const res = await apiClient.get<ListTopicsResponse>(API_ENDPOINTS.topics.list);
        const topics = Array.isArray(res.data?.data) ? mapTopics(res.data.data) : [];
        if (topics.length > 0) {
          setTopicOptions(topics);
        }
      } catch {
        // Keep fallback topics derived from test question types.
      }

      try {
        const res = await apiClient.get<ListQuestionStylesResponse>(API_ENDPOINTS.questionStyles.list);
        const questionStyles = Array.isArray(res.data?.data) ? mapQuestionStyles(res.data.data) : [];
        if (questionStyles.length > 0) {
          setQuestionStyleOptions(questionStyles);
        }
      } catch {
        setQuestionStyleOptions(fallbackQuestionStyles);
      }

      try {
        const res = await apiClient.get<ListQuestionCountsResponse>(API_ENDPOINTS.questionCounts.list);
        const questionCounts = Array.isArray(res.data?.data) ? mapQuestionCounts(res.data.data) : [];
        if (questionCounts.length > 0) {
          setQuestionCountValues(questionCounts);
        }
      } catch {
        setQuestionCountValues(fallbackQuestionCounts);
      }
    };

    void initializePage();
  }, [router]);

  const handleNext = () => {
    const finalPayload = {
      testId: testInfo?.id || null,
      testTitle: testInfo?.title || "",
      attemptMode,
      difficulty: level,
      topics: selectedTopics,
      questionStyles: selectedQuestionStyles,
      questionCount: selectedQuestionCount,
    };

    sessionStorage.setItem('testAttemptMode', attemptMode);
    sessionStorage.setItem('testDifficulty', level);
    sessionStorage.setItem('testTopics', JSON.stringify(selectedTopics));
    sessionStorage.setItem('testQuestionStyles', JSON.stringify(selectedQuestionStyles));
    sessionStorage.setItem('testQuestionCount', selectedQuestionCount);
    sessionStorage.setItem('testFinalConfig', JSON.stringify(finalPayload));
    // Print final setup payload for verification/debug.
    console.log("Final Test Config:", finalPayload);
    router.push("/tests/instructions");
  };

  if (!testInfo) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((item) => item !== topic)
        : [...prev, topic]
    );
  };

  const toggleQuestionStyle = (questionStyle: string) => {
    setSelectedQuestionStyles((prev) =>
      prev.includes(questionStyle)
        ? prev.filter((item) => item !== questionStyle)
        : [...prev, questionStyle]
    );
  };

  const questionCountOptions = buildQuestionCountOptions(questionCountValues, testInfo.questions.length);
  const finalPayloadPreview = {
    testId: testInfo.id,
    testTitle: testInfo.title,
    attemptMode,
    difficulty: level,
    topics: selectedTopics,
    questionStyles: selectedQuestionStyles,
    questionCount: selectedQuestionCount,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 0%, #dbeafe 0%, #eef2ff 35%, #f8fafc 100%)",
        display: "block",
        justifyContent: "center",
        padding: "24px 16px 40px",
      }}
    >
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <Card
          styles={{
            body: {
              padding: 28,
            },
          }}
          style={{
            borderRadius: 22,
            border: "1px solid #dbe6f6",
            boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <Text style={{ fontSize: 12, letterSpacing: "0.08em", color: "#64748b" }}>
              PRE-TEST SETUP
            </Text>
            <Title level={2} style={{ margin: "4px 0 6px", fontWeight: 700, color: "#0f172a" }}>
              {testInfo.title}
            </Title>
            {/* <Text style={{ color: "#64748b", fontSize: 15 }}>
              {testInfo.totalQuestions} questions • {testInfo.duration} minutes
            </Text> */}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            {[
              { n: 1 as const, label: "Test Mode" },
              { n: 2 as const, label: "Difficulty" },
              { n: 3 as const, label: "Topics" },
              { n: 4 as const, label: "Question Style" },
              { n: 5 as const, label: "Question Count" },
            ].map((item) => {
              const isActive = step === item.n;
              const isDone = step > item.n;
              return (
                <div
                  key={item.n}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: isActive ? "1px solid #2563eb" : "1px solid #dbe2ea",
                    background: isActive
                      ? "#eff6ff"
                      : isDone
                      ? "#ecfdf3"
                      : "#f8fafc",
                    color: isActive ? "#1e40af" : isDone ? "#166534" : "#64748b",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      background: isActive ? "#2563eb" : isDone ? "#22c55e" : "#cbd5e1",
                      color: "#fff",
                    }}
                  >
                    {item.n}
                  </span>
                  {item.label}
                </div>
              );
            })}
          </div>

          <Text style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 6 }}>
            Step {step} of 5
          </Text>
          <Title level={4} style={{ marginBottom: 12, color: "#0f172a", fontWeight: 700 }}>
            {step === 1
              ? "How would you like to attempt this test?"
              : step === 2
              ? "Choose Difficulty"
              : step === 3
              ? "Choose Topics"
              : step === 4
              ? "Choose Question Style"
              : "Choose Number of Questions"}
          </Title>

          {step === 1 && (
            <div key="step-1" className="step-panel">
              <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
                {[
                  {
                    key: "practice" as const,
                    icon: "🧘‍♂️",
                    title: "Practice Mode",
                    points: ["No timer", "Learn at your pace", "See hints (optional future feature)"],
                  },
                  {
                    key: "exam" as const,
                    icon: "🎯",
                    title: "Exam Mode",
                    points: ["Full test timer", "Real exam simulation", "No pause"],
                  },
                ].map((modeOption) => {
                  const selected = attemptMode === modeOption.key;
                  return (
                    <Col xs={24} md={12} key={modeOption.key}>
                      <button
                        type="button"
                        onClick={() => setAttemptMode(modeOption.key)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          cursor: "pointer",
                          padding: 16,
                          borderRadius: 18,
                          border: selected ? "1px solid #2563eb" : "1px solid #dbe2ea",
                          background: selected
                            ? "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)"
                            : "#ffffff",
                          boxShadow: selected
                            ? "0 10px 22px rgba(37,99,235,0.18)"
                            : "0 4px 12px rgba(15,23,42,0.06)",
                          transition: "all 220ms ease",
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 8 }}>{modeOption.icon}</div>
                        <div style={{ fontWeight: 700, color: selected ? "#1e40af" : "#0f172a", marginBottom: 8 }}>
                          {modeOption.title}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: "#475569", fontSize: 13, lineHeight: 1.7 }}>
                          {modeOption.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </button>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}

          {step === 2 && (
            <div key="step-2" className="step-panel">
              <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
              {difficultyLevels.map((item, index) => {
                const selected = level === item.key;
                return (
                  <Col xs={24} sm={12} lg={6} key={item.key}>
                    <button
                      type="button"
                      className="tile-card"
                      onClick={() => setLevel(item.key)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        cursor: "pointer",
                        padding: 14,
                        borderRadius: 22,
                        border: selected ? "1px solid #2563eb" : "1px solid #dbe2ea",
                        background: selected
                          ? "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)"
                          : "#ffffff",
                        boxShadow: selected
                          ? "0 10px 22px rgba(37,99,235,0.18)"
                          : "0 4px 12px rgba(15,23,42,0.06)",
                        transition: "all 220ms ease",
                        animation: `tileEnter 420ms cubic-bezier(.2,.8,.2,1) both`,
                        animationDelay: `${index * 70}ms`,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: selected ? "#2563eb" : "#e2e8f0",
                          color: selected ? "#fff" : "#475569",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 20,
                          marginBottom: 8,
                        }}
                      >
                        {getDifficultyIcon(item.key)}
                      </div>
                      <div style={{ fontWeight: 600, color: selected ? "#1e40af" : "#0f172a", marginBottom: 6 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{item.desc}</div>
                    </button>
                  </Col>
                );
              })}
              </Row>
            </div>
          )}

          {step === 3 && (
            <div key="step-3" className="step-panel">
              <div style={{ marginBottom: 14 }}>
                <Text style={{ color: "#64748b" }}>
                  Select one or more topics. Leave empty to include all topics.
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {topicOptions.map((topic, index) => {
                  const selected = selectedTopics.includes(topic.key);
                  return (
                    <button
                      key={topic.key}
                      type="button"
                      className="topic-pill"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleTopic(topic.key);
                      }}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        cursor: "pointer",
                        borderRadius: 999,
                        border: "none",
                        padding: "10px 16px",
                        fontSize: 14,
                        fontWeight: 600,
                        color: selected ? "#ffffff" : "#475569",
                        background: selected ? "#2563eb" : "#f1f5f9",
                        boxShadow: selected
                          ? "0 10px 20px rgba(37,99,235,0.30)"
                          : "0 1px 2px rgba(15,23,42,0.08)",
                        transition: "all 220ms ease",
                        animation: `topicEnter 320ms ease both`,
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div key="step-4" className="step-panel">
              <div style={{ marginBottom: 14 }}>
                <Text style={{ color: "#64748b" }}>
                  Select one or more question styles. Leave empty to include all styles.
                </Text>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {questionStyleOptions.map((questionStyle, index) => {
                  const selected = selectedQuestionStyles.includes(questionStyle.key);
                  return (
                    <button
                      key={questionStyle.key}
                      type="button"
                      className="topic-pill"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleQuestionStyle(questionStyle.key);
                      }}
                      onPointerDown={(event) => {
                        event.stopPropagation();
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        cursor: "pointer",
                        borderRadius: 999,
                        border: "none",
                        padding: "10px 16px",
                        fontSize: 14,
                        fontWeight: 600,
                        color: selected ? "#ffffff" : "#475569",
                        background: selected ? "#2563eb" : "#f1f5f9",
                        boxShadow: selected
                          ? "0 10px 20px rgba(37,99,235,0.30)"
                          : "0 1px 2px rgba(15,23,42,0.08)",
                        transition: "all 220ms ease",
                        animation: `topicEnter 320ms ease both`,
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {questionStyle.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div key="step-5" className="step-panel">
              <div style={{ marginBottom: 16 }}>
                <Text style={{ color: "#64748b", fontSize: 14 }}>
                  Select how many questions you want to attempt.
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Text style={{ color: "#0f172a", fontWeight: 600 }}>
                    Selected:{" "}
                    <span style={{ color: "#2563eb" }}>
                      {selectedQuestionCount === "all" ? "All Questions" : `${selectedQuestionCount} Questions`}
                    </span>
                  </Text>
                </div>
              </div>

              <div className="number-badge-grid" style={{ marginBottom: 16 }}>
                {questionCountOptions.map((option, index) => {
                  const selected = selectedQuestionCount === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`number-badge-btn ${selected ? "is-selected" : ""}`}
                      onClick={() => setSelectedQuestionCount(option.key)}
                      aria-label={`Select ${option.label}`}
                      title={option.desc}
                      style={{
                        animation: "badgeEnter 320ms cubic-bezier(.2,.8,.2,1) both",
                        animationDelay: `${index * 55}ms`,
                      }}
                    >
                      <NumberBadge value={option.key} selected={selected} />
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 12 }}>
                <Text style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 8 }}>
                  Final JSON
                </Text>
                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #dbe2ea",
                    background: "#f8fafc",
                    color: "#0f172a",
                    fontSize: 12,
                    lineHeight: 1.5,
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(finalPayloadPreview, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              width: "100%",
              marginTop: 6,
            }}
          >
            {/* <Text style={{ color: "#475569" }}>
              You will attempt <strong>{filteredQuestions.length}</strong> question
              {filteredQuestions.length !== 1 ? "s" : ""} in this mode.
            </Text> */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {step > 1 && (
                <Button
                  size="large"
                  onClick={() => setStep((prev) => (prev === 5 ? 4 : prev === 4 ? 3 : prev === 3 ? 2 : 1))}
                  style={{ borderRadius: 12, height: 46, minWidth: 120 }}
                >
                  Back
                </Button>
              )}
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  if (step < 5) {
                    setStep((prev) =>
                      prev === 1 ? 2 : prev === 2 ? 3 : prev === 3 ? 4 : 5
                    );
                    return;
                  }
                  handleNext();
                }}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                style={{
                  minWidth: 170,
                  height: 46,
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(90deg, #0f62fe 0%, #1d4ed8 100%)",
                  fontWeight: 600,
                }}
              >
                {step < 5 ? "Next Step" : "Continue"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <style jsx>{`
        .step-panel {
          animation: stepEnter 280ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .tile-card:hover {
          transform: translateY(-2px);
        }
        .topic-pill:hover {
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
        }
        .number-badge-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          align-items: center;
        }
        .number-badge-btn {
          border: none;
          background: transparent;
          padding: 0;
          width: 52px;
          height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          cursor: pointer;
          border-radius: 999px;
          transition: transform 180ms ease, box-shadow 180ms ease;
          position: relative;
        }
        .number-badge-btn:hover {
          transform: translateY(-1px);
        }
        .number-badge-btn:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 3px;
        }
        .number-badge-btn.is-selected {
          animation: selectedPulse 420ms ease;
        }
        .number-badge-btn.is-selected::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 999px;
          border: 1px solid rgba(37, 99, 235, 0.28);
          animation: selectedRipple 520ms ease-out;
          pointer-events: none;
        }
        @keyframes badgeEnter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes selectedPulse {
          0% {
            transform: scale(0.92);
          }
          60% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes selectedRipple {
          from {
            opacity: 0.5;
            transform: scale(0.92);
          }
          to {
            opacity: 0;
            transform: scale(1.14);
          }
        }
        @keyframes stepEnter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes tileEnter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes topicEnter {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
