"use client";

import { useState, useEffect } from "react";
import { Typography, Button, Input, message } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { Test, TestQuestion, filterQuestionsByDifficulty } from "@/utils/testData";
import LoadingScreen from "@/components/LoadingScreen";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";

const { Title, Text } = Typography;
const TEST_FLOW_STORAGE_KEYS = [
  "currentTest",
  "testAttemptMode",
  "testDifficulty",
  "testTopics",
  "testQuestionStyles",
  "testQuestionCount",
  "testFinalConfig",
  "testSectionPlan",
  "examQuestions",
  "userAnswers",
  "questionTimes",
  "questionStatus",
  "testResults",
] as const;

const QUESTION_TYPE_MAP: Record<string, TestQuestion["type"]> = {
  coding: "coding",
  code: "coding",
  "problem-solving": "coding",
  "problem solving": "coding",
  mcq: "mcq",
  "multiple-choice": "mcq",
  multiplechoice: "mcq",
  theory: "theory",
  conceptual: "theory",
  output: "output",
  "output-based": "output",
  outputbased: "output",
  io: "output",
  scenario: "scenario",
  situational: "scenario",
};

const DIFFICULTY_MAP: Record<string, TestQuestion["difficulty"]> = {
  easy: "easy",
  basic: "easy",
  medium: "medium",
  intermediate: "medium",
  hard: "hard",
  advanced: "hard",
};

const mapApiQuestionsToUi = (questions: unknown[]): TestQuestion[] => {
  return questions
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const q = item as Record<string, unknown>;
      const rawType = String(q.type || "")
        .trim()
        .toLowerCase();
      const rawDifficulty = String(q.difficulty || "")
        .trim()
        .toLowerCase();

      const type = QUESTION_TYPE_MAP[rawType] || "theory";
      const difficulty = DIFFICULTY_MAP[rawDifficulty] || "medium";
      const question = String(q.question || "").trim();
      if (!question) return null;

      const mapped: TestQuestion = {
        id: String(q.id || ""),
        type,
        difficulty,
        question,
        section: String(q.section || "").trim(),
        topic: String(q.topic || "").trim(),
        groupType: String(q.groupType || "none").trim().toLowerCase(),
        groupId: String(q.groupId || "").trim(),
        groupTitle: String(q.groupTitle || "").trim(),
        passageText: String(q.passageText || "").trim(),
        groupOrder: Number.isFinite(Number(q.groupOrder)) ? Number(q.groupOrder) : null,
        options: Array.isArray(q.options) ? q.options.map((opt) => String(opt)) : [],
        answer: String(q.answer || ""),
        explanation: String(q.explanation || ""),
        inputOutput: String(q.inputOutput || ""),
        solutionApproach: String(q.solutionApproach || ""),
        sampleSolution: String(q.sampleSolution || ""),
        complexity: String(q.complexity || ""),
        code: String(q.code || ""),
        expectedOutput: String(q.expectedOutput || ""),
        idealSolution: String(q.idealSolution || ""),
        keyConsiderations: Array.isArray(q.keyConsiderations)
          ? q.keyConsiderations.map((item) => String(item))
          : [],
      };

      if (type !== "mcq" && type !== "output") {
        mapped.options = [];
      } else if (mapped.options && mapped.options.length > 5) {
        mapped.options = mapped.options.slice(0, 5);
      }

      return mapped;
    })
    .filter((item): item is TestQuestion => item !== null);
};

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

export default function InstructionsPage() {
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang || "en";
  const [inputValue, setInputValue] = useState("");
  const [testInfo, setTestInfo] = useState<Test | null>(null);

  
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState("all");
  const [filteredQuestions, setFilteredQuestions] = useState<TestQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Initializing Test Environment");

  const resetTestFlowStorage = (nextValues: Partial<Record<(typeof TEST_FLOW_STORAGE_KEYS)[number], string>>) => {
    for (const key of TEST_FLOW_STORAGE_KEYS) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    }

    for (const [key, value] of Object.entries(nextValues)) {
      if (typeof value === "string" && value.length > 0) {
        sessionStorage.setItem(key, value);
      }
    }
  };

  useEffect(() => {
    const storedTest = sessionStorage.getItem('currentTest');
    const storedDifficulty = sessionStorage.getItem('testDifficulty');
    const storedQuestionCount = sessionStorage.getItem('testQuestionCount');
    
    if (storedTest) {
      const test = JSON.parse(storedTest);
      setTestInfo(test);
      setQuestionCount(storedQuestionCount || "all");
      
      if (storedDifficulty) {
        setDifficulty(storedDifficulty);
        const byDifficulty = filterQuestionsByDifficulty(test.questions, storedDifficulty);
        if (storedQuestionCount && storedQuestionCount !== "all") {
          const limit = Number(storedQuestionCount);
          setFilteredQuestions(Number.isFinite(limit) && limit > 0 ? byDifficulty.slice(0, limit) : byDifficulty);
        } else {
          setFilteredQuestions(byDifficulty);
        }
      } else {
        if (storedQuestionCount && storedQuestionCount !== "all") {
          const limit = Number(storedQuestionCount);
          setFilteredQuestions(
            Number.isFinite(limit) && limit > 0 ? test.questions.slice(0, limit) : test.questions
          );
        } else {
          setFilteredQuestions(test.questions);
        }
        setDifficulty('all');
      }
    }
  }, []);

  const handleStart = async () => {
    if (inputValue.trim().toLowerCase() === "start") {
      setIsLoading(true);
      setLoadingProgress(25);
      setCurrentStep("Loading Questions");
      try {
        const rawConfig = sessionStorage.getItem("testFinalConfig");
        const parsedConfig = rawConfig ? (JSON.parse(rawConfig) as Record<string, unknown>) : {};
        const attemptMode = String(parsedConfig.attemptMode || "exam")
          .trim()
          .toLowerCase();

        const startResponse = await apiClient.post<{
          data?: {
            curatedQuestions?: unknown[];
            estimatedDurationMinutes?: number;
          };
        }>(
          API_ENDPOINTS.testAttempts.start,
          {
            provider: "openai",
            testId: String(parsedConfig.testId || testInfo?.id || ""),
            testTitle: String(parsedConfig.testTitle || testInfo?.title || "Untitled Test"),
            domain: testInfo?.domain || "",
            difficulty: String(parsedConfig.difficulty || difficulty || "all"),
            attemptMode,
            topics: Array.isArray(parsedConfig.topics) ? parsedConfig.topics : [],
            questionStyles: Array.isArray(parsedConfig.questionStyles) ? parsedConfig.questionStyles : [],
            questionCount: String(parsedConfig.questionCount || questionCount || "all"),
            totalQuestions: filteredQuestions.length,
            duration: 0,
            allowFallback: false,
          },
          {
            timeout: 180000,
          }
        );

        const curatedQuestions = Array.isArray(startResponse.data?.data?.curatedQuestions)
          ? mapApiQuestionsToUi(startResponse.data.data.curatedQuestions)
          : [];
        const estimatedDurationMinutes = Number(startResponse.data?.data?.estimatedDurationMinutes || 0);
        const nextTestInfo =
          Number.isFinite(estimatedDurationMinutes) && estimatedDurationMinutes > 0 && testInfo
            ? {
                ...testInfo,
                duration: Math.round(estimatedDurationMinutes),
              }
            : testInfo;

        if (nextTestInfo) {
          setTestInfo(nextTestInfo);
        }
        const preparedQuestions = curatedQuestions.length > 0 ? curatedQuestions : filteredQuestions;

        if (preparedQuestions.length === 0) {
          setIsLoading(false);
          message.error("No questions were generated for this test. Please try again.");
          return;
        }

        setFilteredQuestions(preparedQuestions);
        setLoadingProgress(100);
        setCurrentStep("Ready to Start");

        // Fresh exam state: clear stale test data from session/local storage,
        // then keep only current-test related keys.
        resetTestFlowStorage({
          currentTest: nextTestInfo ? JSON.stringify(nextTestInfo) : "",
          testAttemptMode: attemptMode,
          testDifficulty: String(parsedConfig.difficulty || difficulty || "all"),
          testTopics: JSON.stringify(Array.isArray(parsedConfig.topics) ? parsedConfig.topics : []),
          testQuestionStyles: JSON.stringify(
            Array.isArray(parsedConfig.questionStyles) ? parsedConfig.questionStyles : []
          ),
          testQuestionCount: String(parsedConfig.questionCount || questionCount || "all"),
          testFinalConfig: JSON.stringify(parsedConfig),
          examQuestions: JSON.stringify(preparedQuestions),
        });

        router.push(`/${lang}/tests/exam`);
      } catch (error: unknown) {
        setIsLoading(false);
        const apiMessage = getApiErrorMessage(
          error,
          "Unable to start test session. Please try again."
        );
        message.error(apiMessage);
        return;
      }
    }
  };

  // Show loading screen if loading
  if (isLoading) {
    return (
      <LoadingScreen
        testTitle={testInfo?.title || "Test"}
        domain={testInfo?.domain || "Domain"}
        progress={loadingProgress}
        currentStep={currentStep}
      />
    );
  }

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

  return (
    <div
      className="instructions-root"
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      <div style={{ maxWidth: 860, width: "100%" }}>
        <div className="panel">
              <Title level={4} style={{ marginBottom: 20 }}>
                <BulbOutlined style={{ marginRight: 10, color: "#faad14" }} /> Test Instructions
              </Title>

              <div style={{ lineHeight: 1.9, fontSize: 16, color: "#333", marginBottom: 30 }}>
                <p className="instruction-row">
                  <span className="instruction-label">Assessment Duration:</span>
                  <span>{testInfo.duration}:00 minutes (hh:mm:ss)</span>
                </p>
                <p className="instruction-row">
                  <span className="instruction-label">Total Questions:</span>
                  <span>{filteredQuestions.length} Mixed Format Questions</span>
                </p>
                <p className="instruction-row">
                  <span className="instruction-label">Difficulty Level:</span>
                  <span>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                </p>
                <p className="instruction-row">
                  <span className="instruction-label">Question Count:</span>
                  <span>{questionCount === "all" ? "All available" : questionCount}</span>
                </p>
                <p className="instruction-row">
                  <span className="instruction-label">Marking Scheme:</span>
                  <span>+1 for correct answer, 0 for incorrect/unattempted</span>
                </p>
                
                

                <div style={{ marginTop: 20 }}>
                  <Title level={5} style={{ marginBottom: 10 }}>Important Guidelines:</Title>
                  <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                    <li>Do not close the browser window or tab during the test</li>                   
                    <li>All questions are mandatory</li>
                    <li>Test will auto-submit when time expires</li>
                    <li>For coding questions, focus on both correctness and approach</li>
                  </ul>
                </div>
              </div>

              {/* START SECTION */}
              <div style={{ marginTop: 30 }}>
                <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 16 }}>
                  Type &quot;start&quot; in the box below to begin your test
                </Text>
                <div className="start-row">
                  <Input
                    className="start-input"
                    placeholder='Type "start" to Begin Test'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{ flex: 1, height: 45, fontSize: 16, borderRadius: 10 }}
                    disabled={isLoading}
                  />
                  <Button
                    className="start-button"
                    type="primary"
                    size="large"
                    disabled={inputValue.toLowerCase() !== "start" || isLoading}
                    onClick={handleStart}
                    style={{
                      height: 45,
                      fontSize: 16,
                      borderRadius: 10,
                    }}
                    loading={isLoading}
                  >
                    {isLoading ? "Starting..." : "Start Test →"}
                  </Button>
                </div>
                {isLoading && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
                    Please wait while we prepare your test environment...
                  </Text>
                )}
              </div>
            </div>
        </div>
      <style jsx>{`
        .panel {
          background: #ffffff;
          border: 1px solid #eceff3;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
          height: 100%;
        }
        .instruction-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 6px;
        }
        .instruction-label {
          font-weight: 700;
          min-width: 200px;
        }
        .start-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .instructions-root {
            padding: 16px 12px;
          }
          .panel {
            border-radius: 14px;
            padding: 16px;
          }
          .instruction-row {
            flex-direction: column;
            gap: 0;
            margin-bottom: 10px;
          }
          .instruction-label {
            min-width: 0;
          }
          .start-row {
            flex-direction: column;
            align-items: stretch;
          }
          :global(.start-button) {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
