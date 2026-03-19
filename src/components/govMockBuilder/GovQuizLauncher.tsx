"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, message } from "antd";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import { buildGovExamPromptContext, FULL_COVERAGE_GOV_STYLES } from "@/lib/govExamPrompt";
import type { Test, TestQuestion } from "@/utils/testData";

type GovQuizLauncherProps = {
  lang: "en" | "hi";
  launchHref: string;
  changePlanHref: string;
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

const normalizeAnswer = (answer: string, options: string[]) => {
  const normalized = String(answer || "").trim();
  if (!normalized) return options[0] || "";
  const upper = normalized.toUpperCase();
  const indexMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };
  if (upper in indexMap && options[indexMap[upper]]) {
    return options[indexMap[upper]];
  }
  const matched = options.find((option) => option.toLowerCase() === normalized.toLowerCase());
  return matched || normalized;
};

const mapApiQuestionsToUi = (questions: unknown[]): TestQuestion[] => {
  const normalizeAssets = (value: unknown): TestQuestion["assets"] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const row = item as Record<string, unknown>;
        const url = String(row.url || "").trim();
        const data = row.data && typeof row.data === "object" ? (row.data as Record<string, unknown>) : null;
        if (!url && !data) return null;
        return {
          kind: String(row.kind || "image").trim(),
          url,
          alt: String(row.alt || "").trim(),
          width: Number.isFinite(Number(row.width)) ? Number(row.width) : null,
          height: Number.isFinite(Number(row.height)) ? Number(row.height) : null,
          caption: String(row.caption || "").trim(),
          sourcePage: Number.isFinite(Number(row.sourcePage)) ? Number(row.sourcePage) : null,
          data,
        };
      })
      .filter((item): item is NonNullable<TestQuestion["assets"]>[number] => item !== null)
      .slice(0, 8);
  };

  return questions
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const q = item as Record<string, unknown>;
      const rawType = String(q.type || "")
        .trim()
        .toLowerCase();
      const rawDifficulty = String(q.difficulty || "")
        .trim()
        .toLowerCase();

      const type = QUESTION_TYPE_MAP[rawType] || "mcq";
      const difficulty = DIFFICULTY_MAP[rawDifficulty] || "medium";
      const question = String(q.question || "").trim();
      if (!question) return null;

      const options = Array.isArray(q.options)
        ? q.options.map((opt) => String(opt)).filter(Boolean).slice(0, 5)
        : [];

        const mapped: TestQuestion = {
          id: String(q.id || `q${index + 1}`),
          type,
          difficulty,
          question,
        options: type === "mcq" || type === "output" ? options : [],
        answer:
          type === "mcq" || type === "output"
            ? normalizeAnswer(String(q.answer || q.correctAnswer || ""), options)
            : String(q.answer || ""),
        explanation: String(q.explanation || ""),
        inputOutput: String(q.inputOutput || ""),
        solutionApproach: String(q.solutionApproach || ""),
          sampleSolution: String(q.sampleSolution || ""),
          complexity: String(q.complexity || ""),
          section: String(q.section || "").trim(),
          topic: String(q.topic || "").trim(),
          groupType: String(q.groupType || "none").trim().toLowerCase(),
          groupId: String(q.groupId || "").trim(),
          groupTitle: String(q.groupTitle || "").trim(),
          passageText: String(q.passageText || "").trim(),
          groupOrder: Number.isFinite(Number(q.groupOrder)) ? Number(q.groupOrder) : null,
          hasVisual: Boolean(q.hasVisual),
          assets: normalizeAssets(q.assets),
        };

      return mapped;
    })
    .filter((item): item is TestQuestion => item !== null);
};

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

export default function GovQuizLauncher(props: GovQuizLauncherProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const finalConfig = useMemo(
    () => ({
      testId: `gov-${props.examSlug}-${props.stageSlug}-${props.goalSlug}-${props.planId}`,
      testTitle: `${props.examName} ${props.stageName} - ${props.goalName}`,
      attemptMode: "exam" as const,
      difficulty: getDifficultyForGoal(props.goalSlug),
      topics: [props.goalName, props.stageName, props.struggleFocus || "general-awareness"],
      questionStyles: FULL_COVERAGE_GOV_STYLES,
      questionCount: String(props.questionCount),
    }),
    [props.examName, props.examSlug, props.goalName, props.goalSlug, props.planId, props.questionCount, props.stageName, props.stageSlug, props.struggleFocus]
  );

  const handleLaunch = async () => {
    setIsLoading(true);

    try {
      const promptContext = buildGovExamPromptContext({
        examName: props.examName,
        stageName: props.stageName,
        goalName: props.goalName,
        planName: props.planName,
        struggleFocus: props.struggleFocus,
        durationMinutes: props.durationMinutes,
        questionCount: props.questionCount,
        questionStyles: FULL_COVERAGE_GOV_STYLES,
      });

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
          difficulty: finalConfig.difficulty,
          topics: finalConfig.topics,
          questionStyles: FULL_COVERAGE_GOV_STYLES,
          questionCount: props.questionCount,
          domain: `Government Exam - ${props.examName}`,
          promptContext,
        },
        { timeout: 240000 }
      );

      const preparedQuestions = mapApiQuestionsToUi(
        Array.isArray(response.data?.data?.paper?.questions) ? response.data.data.paper.questions : []
      );
      const sectionPlan = Array.isArray(response.data?.data?.paper?.sectionPlan)
        ? response.data?.data?.paper?.sectionPlan
        : [];

      if (preparedQuestions.length === 0) {
        message.error("No questions were generated. Please try again.");
        setIsLoading(false);
        return;
      }

      const dbCount = Number(response.data?.data?.diagnostics?.dbCount || 0);
      const aiTopupCount = Number(response.data?.data?.diagnostics?.aiTopupCount || 0);
      const aiTopupError = String(response.data?.data?.diagnostics?.aiTopupError || "").trim();
      if (dbCount > 0 || aiTopupCount > 0) {
        message.success(`Questions loaded • DB: ${dbCount}, AI fallback: ${aiTopupCount}`);
      }
      if (aiTopupError) {
        message.warning(`AI top-up skipped: ${aiTopupError}`);
      }

      const currentTest: Test = {
        id: finalConfig.testId,
        title: finalConfig.testTitle,
        desc: `${props.planName} for ${props.examName} ${props.stageName}`,
        domain: `Gov Exams / ${props.examName}`,
        img: "/images/test-1.jpg",
        totalQuestions: preparedQuestions.length,
        duration: props.durationMinutes,
        questions: preparedQuestions,
      };

      for (const key of TEST_FLOW_STORAGE_KEYS) {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      }

      sessionStorage.setItem("currentTest", JSON.stringify(currentTest));
      sessionStorage.setItem("testAttemptMode", "exam");
      sessionStorage.setItem("testDifficulty", finalConfig.difficulty);
      sessionStorage.setItem("testTopics", JSON.stringify(finalConfig.topics));
      sessionStorage.setItem("testQuestionStyles", JSON.stringify(finalConfig.questionStyles));
      sessionStorage.setItem("testQuestionCount", finalConfig.questionCount);
      sessionStorage.setItem("testFinalConfig", JSON.stringify(finalConfig));
      sessionStorage.setItem("testSectionPlan", JSON.stringify(sectionPlan));
      sessionStorage.setItem("examQuestions", JSON.stringify(preparedQuestions));

      const govQuizPayload = {
        examSlug: props.examSlug,
        stageSlug: props.stageSlug,
        goalSlug: props.goalSlug,
        planId: props.planId,
        test: currentTest,
        questions: preparedQuestions,
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
      message.error(getApiErrorMessage(error, "Unable to generate quiz right now. Please try again."));
      if (status === 401) {
        router.push(`/${props.lang}/login`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Button type="primary" loading={isLoading} onClick={handleLaunch} className="!h-auto !rounded-lg !bg-blue-700 px-4 py-2 !text-sm !font-semibold">
        {isLoading ? "Step 5: Generating Quiz..." : "Step 5: Launch Mock Test"}
      </Button>
      <Link
        href={props.changePlanHref}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
      >
        Change Plan
      </Link>
      <Link href={props.launchHref} className="text-sm font-medium text-slate-500 underline-offset-2 hover:underline">
        Use legacy flow
      </Link>
    </div>
  );
}
