"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, message } from "antd";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import { buildGovExamPrompt, buildGovExamPromptContext, FULL_COVERAGE_GOV_STYLES } from "@/lib/govExamPrompt";
import type { Test, TestQuestion } from "@/utils/testData";

type PromptComposerCardProps = {
  lang: "en" | "hi";
  examSlug: string;
  examName: string;
  stageSlug: string;
  stageName: string;
  goalSlug: string;
  goalName: string;
  planId: string;
  planName: string;
  struggleFocus?: string;
  struggleSlug?: string;
  durationMinutes: number;
  questionCount: number;
  changePlanHref: string;
  legacyLaunchHref: string;
};

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

export default function PromptComposerCard(props: PromptComposerCardProps) {
  const router = useRouter();
  const [alignmentTarget, setAlignmentTarget] = useState(85);
  const [currentAffairsMonths, setCurrentAffairsMonths] = useState<3 | 6 | 12>(6);
  const [language, setLanguage] = useState<"English" | "Hindi">("English");
  const [questionStyles, setQuestionStyles] = useState<string[]>(FULL_COVERAGE_GOV_STYLES);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");

  const styleOptions = FULL_COVERAGE_GOV_STYLES;

  const getDifficultyForGoal = (goalSlug: string): "easy" | "medium" | "hard" => {
    if (goalSlug === "concept-builder") return "easy";
    if (goalSlug === "full-exam-simulation" || goalSlug === "previous-year-style") return "hard";
    return "medium";
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

  const mapApiQuestionsToUi = (questions: unknown[]): TestQuestion[] => {
    return questions
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;
        const q = item as Record<string, unknown>;
        const question = String(q.question || "").trim();
        if (!question) return null;

        const options = Array.isArray(q.options)
          ? q.options.map((opt) => String(opt)).filter(Boolean).slice(0, 5)
          : [];

        const normalizedAnswer = String(q.answer || q.correctAnswer || "").trim();
        const upperAnswer = normalizedAnswer.toUpperCase();
        const indexMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
        const resolvedAnswer =
          upperAnswer in indexMap && options[indexMap[upperAnswer]]
            ? options[indexMap[upperAnswer]]
            : normalizedAnswer || options[0] || "";

        const rawDifficulty = String(q.difficulty || "").trim().toLowerCase();
        const difficulty =
          rawDifficulty === "easy" || rawDifficulty === "hard" || rawDifficulty === "medium"
            ? rawDifficulty
            : "medium";

        const mapped: TestQuestion = {
          id: String(q.id || `q${index + 1}`),
          type: "mcq",
          difficulty,
          question,
          options,
          answer: resolvedAnswer,
          explanation: String(q.explanation || ""),
          section: String(q.section || "").trim(),
          topic: String(q.topic || "").trim(),
          groupType: String(q.groupType || "none").trim().toLowerCase(),
          groupId: String(q.groupId || "").trim(),
          groupTitle: String(q.groupTitle || "").trim(),
          passageText: String(q.passageText || "").trim(),
          groupOrder: Number.isFinite(Number(q.groupOrder)) ? Number(q.groupOrder) : null,
        };

        return mapped;
      })
      .filter((item): item is TestQuestion => item !== null);
  };

  const finalConfig = useMemo(
    () => ({
      testId: `gov-${props.examSlug}-${props.stageSlug}-${props.goalSlug}-${props.planId}`,
      testTitle: `${props.examName} ${props.stageName} - ${props.goalName}`,
      attemptMode: "exam" as const,
      difficulty: getDifficultyForGoal(props.goalSlug),
      topics: [props.goalName, props.stageName, props.struggleFocus || "general-awareness"],
      questionStyles,
      questionCount: String(props.questionCount),
    }),
    [
      props.examSlug,
      props.stageSlug,
      props.goalSlug,
      props.planId,
      props.examName,
      props.stageName,
      props.goalName,
      props.struggleFocus,
      questionStyles,
      props.questionCount,
    ]
  );

  const toggleStyle = (style: string) => {
    setQuestionStyles((prev) => {
      if (prev.includes(style)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== style);
      }
      return [...prev, style];
    });
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchError("");
    try {
      const fullPrompt = buildGovExamPrompt({
        examName: props.examName,
        stageName: props.stageName,
        goalName: props.goalName,
        planName: props.planName,
        struggleFocus: props.struggleFocus,
        questionStyles,
        durationMinutes: props.durationMinutes,
        questionCount: props.questionCount,
        alignmentTarget,
        negativeMarking: "-0.25 per wrong answer (or exam-specific equivalent)",
        language,
        currentAffairsMonths,
      });
      const promptContext = buildGovExamPromptContext({
        examName: props.examName,
        stageName: props.stageName,
        goalName: props.goalName,
        planName: props.planName,
        struggleFocus: props.struggleFocus,
        durationMinutes: props.durationMinutes,
        questionCount: props.questionCount,
        questionStyles,
        currentAffairsMonths,
      });
      console.log("===== GOV MOCK PROMPT START =====");
      console.log(fullPrompt);
      console.log("===== GOV MOCK PROMPT END =====");

      let finalQuestions: TestQuestion[] = [];
      let sectionPlan: Array<{ section?: string; targetCount?: number; servedCount?: number }> = [];
      try {
        const response = await apiClient.post<{
          data?: {
            paper?: {
              questions?: unknown[];
              totalQuestions?: number;
              sectionPlan?: Array<{ section?: string; targetCount?: number; servedCount?: number }>;
            };
            diagnostics?: {
              dbCount?: number;
              aiTopupCount?: number;
              aiTopupError?: string;
              ownerPoolCount?: number;
              globalPoolCount?: number;
              [key: string]: unknown;
            };
          };
        }>(
          API_ENDPOINTS.questionBank.assemblePaper,
          {
            provider: "openai",
            assemblyMode: "flex",
            examSlug: props.examSlug,
            stageSlug: props.stageSlug,
            goalSlug: props.goalSlug,
            planId: props.planId,
            testId: finalConfig.testId,
            testTitle: finalConfig.testTitle,
            domain: `Government Exam - ${props.examName}`,
            difficulty: finalConfig.difficulty,
            topics: finalConfig.topics,
            questionStyles,
            questionCount: props.questionCount,
            promptContext,
          },
          { timeout: 240000 }
        );

        finalQuestions = mapApiQuestionsToUi(
          Array.isArray(response.data?.data?.paper?.questions) ? response.data.data.paper.questions : []
        );
        sectionPlan = Array.isArray(response.data?.data?.paper?.sectionPlan)
          ? response.data?.data?.paper?.sectionPlan
          : [];

        const dbCount = Number(response.data?.data?.diagnostics?.dbCount || 0);
        const aiTopupCount = Number(response.data?.data?.diagnostics?.aiTopupCount || 0);
        const aiTopupError = String(response.data?.data?.diagnostics?.aiTopupError || "").trim();
        if (dbCount > 0 || aiTopupCount > 0) {
          message.success(`Questions loaded • DB: ${dbCount}, AI fallback: ${aiTopupCount}`);
        }
        if (aiTopupError && finalQuestions.length > 0) {
          message.warning(`Partial paper served from DB. AI top-up skipped: ${aiTopupError}`);
        }
      } catch {
        finalQuestions = [];
      }

      if (finalQuestions.length === 0) {
        message.error("No questions available in question bank for this setup. Please import/seed more questions.");
        return;
      }

      const currentTest: Test = {
        id: finalConfig.testId,
        title: finalConfig.testTitle,
        desc: `${props.planName} for ${props.examName} ${props.stageName}`,
        domain: `Gov Exams / ${props.examName}`,
        img: "/images/test-1.jpg",
        totalQuestions: finalQuestions.length,
        duration: props.durationMinutes,
        questions: finalQuestions,
      };

      for (const key of TEST_FLOW_STORAGE_KEYS) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      }

      sessionStorage.setItem("currentTest", JSON.stringify(currentTest));
      sessionStorage.setItem("testAttemptMode", "exam");
      sessionStorage.setItem("testDifficulty", finalConfig.difficulty);
      sessionStorage.setItem("testTopics", JSON.stringify(finalConfig.topics));
      sessionStorage.setItem("testQuestionStyles", JSON.stringify(questionStyles));
      sessionStorage.setItem("testQuestionCount", String(props.questionCount));
      sessionStorage.setItem("testFinalConfig", JSON.stringify(finalConfig));
      sessionStorage.setItem("testSectionPlan", JSON.stringify(sectionPlan));
      sessionStorage.setItem("examQuestions", JSON.stringify(finalQuestions));

      const govQuizPayload = {
        examSlug: props.examSlug,
        stageSlug: props.stageSlug,
        goalSlug: props.goalSlug,
        planId: props.planId,
        promptContext,
        test: currentTest,
        questions: finalQuestions,
        sectionPlan,
      };

      sessionStorage.setItem("govExamQuizSession", JSON.stringify(govQuizPayload));
      localStorage.setItem("govExamQuizSession", JSON.stringify(govQuizPayload));

      router.push(`/${props.lang}/tests/exam`);
    } catch (error: unknown) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: unknown } }).response?.status === "number"
          ? Number((error as { response?: { status?: number } }).response?.status)
          : 0;

      const apiMessage = getApiErrorMessage(error, "Unable to generate quiz right now. Please try again.");
      setLaunchError(apiMessage);
      message.error(apiMessage);

      if (status === 401) {
        router.push(`/${props.lang}/login`);
      }
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Real Exam Prompt Composer</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Target: 70-90% Alignment
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">
          Alignment %
          <input
            type="range"
            min={70}
            max={90}
            value={alignmentTarget}
            onChange={(e) => setAlignmentTarget(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <span className="mt-1 block text-xs text-slate-500">{alignmentTarget}%</span>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Current Affairs Window
          <select
            value={currentAffairsMonths}
            onChange={(e) => setCurrentAffairsMonths(Number(e.target.value) as 3 | 6 | 12)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Output Language
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "English" | "Hindi")}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Step 5</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Question Style (Best-fit Adjustment)</p>
          <p className="mt-1 text-xs text-slate-600">Pick styles that should dominate this mock simulation.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {styleOptions.map((style) => {
              const selected = questionStyles.includes(style);
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleStyle(style)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-indigo-300"
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            type="primary"
            loading={isLaunching}
            onClick={handleLaunch}
            className="!h-auto !rounded-lg !bg-blue-700 px-4 py-2 !text-sm !font-semibold"
          >
            {isLaunching ? "Step 5: Generating Quiz..." : "Step 5: Launch Mock Test"}
          </Button>
          <Link
            href={props.changePlanHref}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Change Plan
          </Link>
          <Link href={props.legacyLaunchHref} className="text-sm font-medium text-slate-500 underline-offset-2 hover:underline">
            Use legacy flow
          </Link>
        </div>
        {launchError ? (
          <p className="mt-3 text-sm font-medium text-red-600">
            {launchError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
