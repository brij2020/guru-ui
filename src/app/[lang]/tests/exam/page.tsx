"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Typography, Radio, Button, Row, Col, Divider, Alert, Input, Card, Tag, Modal, Checkbox, Progress, message, Grid } from "antd";
import { useParams, useRouter } from "next/navigation";
import { FastForwardOutlined, WarningOutlined, DownOutlined, RightOutlined, LeftOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import { Test, TestQuestion } from "@/utils/testData";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import { GOV_EXAMS } from "@/lib/mockTestBuilder";

const { Title, Text } = Typography;
const { TextArea } = Input;
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 420,
        borderRadius: 8,
        border: "1px solid #253246",
        background: "#0f172a",
      }}
    />
  ),
});

// Question type timing configuration (in seconds)
const QUESTION_TIMINGS: Record<string, { min: number, max: number, recommended: number }> = {
  'mcq': { min: 1800, max: 1800, recommended: 1800 },
  'theory': { min: 1800, max: 1800, recommended: 1800 },
  'output': { min: 1800, max: 1800, recommended: 1800 },
  'scenario': { min: 1800, max: 1800, recommended: 1800 },
  'coding': { min: 1800, max: 1800, recommended: 1800 }
};
const BYPASS_QUESTION_TIMEOUT = true;

// Define QuestionStatus as a union type
const QuestionStatusValues = ['answered', 'unanswered', 'skipped', 'timed-out'] as const;
type QuestionStatus = typeof QuestionStatusValues[number];
type SectionPlanItem = {
  section: string;
  targetCount: number;
  servedCount: number;
};
type SectionBucket = {
  key: string;
  label: string;
  indices: number[];
  targetCount?: number;
  servedCount?: number;
};
type BlueprintSection = {
  key?: string;
  label?: string;
  count?: number;
};
type SectionPlanSource = "" | "session" | "blueprint" | "question-meta" | "inferred";
type RcQuestionMeta = TestQuestion & {
  groupType?: string;
  groupId?: string;
  groupTitle?: string;
  passageText?: string;
  groupOrder?: number | null;
};

// Define UserAnswer type
type UserAnswer = {
  type: 'text' | 'code' | 'mcq';
  value: string | string[];
};

const hasMeaningfulAnswer = (answer?: UserAnswer) => {
  if (!answer?.value) return false;
  if (typeof answer.value === 'string') {
    return answer.value.trim().length > 0;
  }
  if (Array.isArray(answer.value)) {
    return answer.value.length > 0;
  }
  return false;
};

type QuestionSegment =
  | { kind: 'text'; content: string }
  | { kind: 'code'; language: string; content: string };

const parseQuestionSegments = (questionText: string): QuestionSegment[] => {
  const source = String(questionText || '');
  const fenceRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  const segments: QuestionSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(source)) !== null) {
    const [fullMatch, language = '', code = ''] = match;
    const start = match.index;

    if (start > lastIndex) {
      const textChunk = source.slice(lastIndex, start).trim();
      if (textChunk) {
        segments.push({ kind: 'text', content: textChunk });
      }
    }

    segments.push({
      kind: 'code',
      language: language.trim() || 'javascript',
      content: code.trim(),
    });

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < source.length) {
    const tail = source.slice(lastIndex).trim();
    if (tail) {
      segments.push({ kind: 'text', content: tail });
    }
  }

  if (segments.length === 0) {
    return [{ kind: 'text', content: source }];
  }

  return segments;
};

const stripLeadingLabel = (value: string, label: string) => {
  const source = String(value || '').trim();
  if (!source) return '';
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source.replace(new RegExp(`^${escaped}\\s*:?\\s*`, 'i'), '').trim();
};

const stripLeadingQuestionPrefix = (value: string) =>
  String(value || '')
    .replace(/^\s*(q(?:uestion)?)[\s.:)\-]*/i, '')
    .trim();

const normalizeSectionKey = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toSectionLabel = (value: string) =>
  String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const inferGovSection = (question: TestQuestion): string => {
  const meta = question as TestQuestion & { section?: string; topic?: string };
  const explicitSection = String(meta.section || "").trim();
  if (explicitSection) {
    return toSectionLabel(explicitSection);
  }
  const source = `${meta.section || ""} ${meta.topic || ""} ${question.question || ""}`.toLowerCase();

  if (
    /\b(quant|aptitude|number|series|simplification|percentage|profit|loss|ratio|time and work|data interpretation|quadratic|arithmetic)\b/.test(
      source
    )
  ) {
    return "Numerical Ability";
  }
  if (
    /\b(english|grammar|vocabulary|synonym|antonym|comprehension|cloze|para jumbles|error detection|sentence)\b/.test(
      source
    )
  ) {
    return "English Language";
  }
  if (
    /\b(gk|general awareness|current affairs|history|geography|polity|economy|science|static)\b/.test(
      source
    )
  ) {
    return "General Awareness";
  }
  if (
    /\b(reasoning|puzzle|seating|syllogism|coding decoding|analogy|classification|statement|conclusion|blood relation)\b/.test(
      source
    )
  ) {
    return "Reasoning Ability";
  }
  return "Mixed";
};

const normalizeSectionPlan = (value: unknown): SectionPlanItem[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      section: String((item as { section?: unknown })?.section || "").trim(),
      targetCount: Number((item as { targetCount?: unknown })?.targetCount || 0),
      servedCount: Number((item as { servedCount?: unknown })?.servedCount || 0),
    }))
    .filter((item) => item.section);
};

const parseSessionJson = <T,>(rawValue: string | null): T | null => {
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

const scaleBlueprintSections = (sections: BlueprintSection[], totalQuestions: number): SectionPlanItem[] => {
  if (!Array.isArray(sections) || sections.length === 0 || totalQuestions <= 0) return [];
  const normalized = sections
    .map((section, index) => ({
      section: toSectionLabel(String(section?.label || section?.key || `Section ${index + 1}`).trim()),
      count: Math.max(0, Number(section?.count || 0)),
    }))
    .filter((section) => section.section);
  if (normalized.length === 0) return [];
  const sourceTotal = normalized.reduce((sum, section) => sum + section.count, 0);

  if (sourceTotal <= 0) {
    const equal = Math.floor(totalQuestions / normalized.length);
    let remainder = totalQuestions - equal * normalized.length;
    return normalized.map((section) => {
      const target = equal + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      return {
        section: section.section,
        targetCount: target,
        servedCount: target,
      };
    });
  }

  if (sourceTotal === totalQuestions) {
    return normalized.map((section) => ({
      section: section.section,
      targetCount: section.count,
      servedCount: section.count,
    }));
  }

  const scaled = normalized.map((section) => {
    const raw = (section.count / sourceTotal) * totalQuestions;
    const floor = Math.floor(raw);
    return { section: section.section, target: floor, remainder: raw - floor };
  });
  let allocated = scaled.reduce((sum, section) => sum + section.target, 0);
  while (allocated < totalQuestions) {
    scaled.sort((a, b) => b.remainder - a.remainder);
    for (const section of scaled) {
      if (allocated >= totalQuestions) break;
      section.target += 1;
      allocated += 1;
    }
  }

  return scaled.map((section) => ({
    section: section.section,
    targetCount: section.target,
    servedCount: section.target,
  }));
};

const buildSectionPlanFromQuestionMeta = (questions: TestQuestion[]): SectionPlanItem[] => {
  const buckets = new Map<string, SectionPlanItem>();
  const orderedKeys: string[] = [];

  for (const question of questions) {
    const explicitSection = toSectionLabel(String((question as TestQuestion & { section?: string })?.section || "").trim());
    if (!explicitSection) continue;
    const key = normalizeSectionKey(explicitSection);
    if (!key) continue;
    if (!buckets.has(key)) {
      orderedKeys.push(key);
      buckets.set(key, {
        section: explicitSection,
        targetCount: 0,
        servedCount: 0,
      });
    }
    const row = buckets.get(key);
    if (row) {
      row.targetCount += 1;
      row.servedCount += 1;
    }
  }

  return orderedKeys
    .map((key) => buckets.get(key))
    .filter((item): item is SectionPlanItem => Boolean(item));
};

const normalizeExamStageSlug = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-");

const expandStageSlugCandidates = (stageSlug: string): string[] => {
  const normalized = normalizeExamStageSlug(stageSlug);
  if (!normalized) return [];
  const compact = normalized.replace(/-/g, "");
  const alphaNum = compact.match(/^([a-z]+)(\d+)$/);
  const reconstructed = alphaNum ? `${alphaNum[1]}-${alphaNum[2]}` : "";
  return Array.from(new Set([normalized, compact, reconstructed].filter(Boolean)));
};

const deriveGovContextFromTestId = (testId: string): { examSlug: string; stageSlug: string } => {
  const normalizedTestId = normalizeExamStageSlug(testId);
  if (!normalizedTestId.startsWith("gov-")) {
    return { examSlug: "", stageSlug: "" };
  }

  for (const exam of GOV_EXAMS) {
    const examSlug = normalizeExamStageSlug(exam.slug);
    if (!examSlug) continue;
    const examPrefix = `gov-${examSlug}-`;
    if (!normalizedTestId.startsWith(examPrefix)) continue;
    const suffix = normalizedTestId.slice(examPrefix.length);
    const stageCandidates = [...exam.stages]
      .map((stage) => normalizeExamStageSlug(stage.slug))
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    for (const stageSlug of stageCandidates) {
      if (suffix === stageSlug || suffix.startsWith(`${stageSlug}-`)) {
        return { examSlug, stageSlug };
      }
    }
  }

  return { examSlug: "", stageSlug: "" };
};

export default function ExamPage() {
  const screens = Grid.useBreakpoint();
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<number, number>>({});
  const [questionStatus, setQuestionStatus] = useState<Record<number, QuestionStatus>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testInfo, setTestInfo] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [sectionPlan, setSectionPlan] = useState<SectionPlanItem[]>([]);
  const [sectionPlanSource, setSectionPlanSource] = useState<SectionPlanSource>("");
  const [activeSection, setActiveSection] = useState<string | "All">("All");
  const [answeredCount, setAnsweredCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [solutionApproachVisible, setSolutionApproachVisible] = useState<Record<number, boolean>>({});
  const questionStartTimeRef = useRef<number>(Date.now());
  const examEndTimeRef = useRef<number>(0);
  const examTimerStorageKeyRef = useRef<string>("");
  const didAutoSubmitRef = useRef(false);
  const router = useRouter();
  const params = useParams<{ lang: string }>();
  const lang = params?.lang || "en";

  const clearExamTimerState = () => {
    if (examTimerStorageKeyRef.current) {
      sessionStorage.removeItem(examTimerStorageKeyRef.current);
    }
    examEndTimeRef.current = 0;
  };

  useEffect(() => {
    const storedTest = sessionStorage.getItem('currentTest');
    const storedQuestions = sessionStorage.getItem('examQuestions');
    
    if (storedTest && storedQuestions) {
      try {
        const test = JSON.parse(storedTest);
        const examQuestions = JSON.parse(storedQuestions);
        if (!Array.isArray(examQuestions) || examQuestions.length === 0) {
          router.push(`/${lang}/tests`);
          return;
        }

        setTestInfo(test);
        const durationSeconds = Math.max(1, Math.round(Number(test?.duration || 0) * 60));
        const timerKey = `examTimerState:${String(test?.id || "default")}`;
        examTimerStorageKeyRef.current = timerKey;
        const now = Date.now();
        let resolvedEndTime = now + durationSeconds * 1000;

        const storedTimerState = sessionStorage.getItem(timerKey);
        if (storedTimerState) {
          try {
            const parsed = JSON.parse(storedTimerState);
            const savedEndTime = Number(parsed?.endTime || 0);
            const savedDurationSeconds = Number(parsed?.durationSeconds || 0);
            if (
              Number.isFinite(savedEndTime) &&
              savedEndTime > now &&
              savedDurationSeconds === durationSeconds
            ) {
              resolvedEndTime = savedEndTime;
            }
          } catch {
            // Ignore malformed state and create fresh timer state.
          }
        }

        examEndTimeRef.current = resolvedEndTime;
        didAutoSubmitRef.current = false;
        const initialLeft = Math.max(0, Math.ceil((resolvedEndTime - now) / 1000));
        setTimeLeft(initialLeft);
        sessionStorage.setItem(
          timerKey,
          JSON.stringify({
            testId: String(test?.id || ""),
            durationSeconds,
            endTime: resolvedEndTime,
            updatedAt: now,
          })
        );
        setQuestions(examQuestions);
        const loadDynamicSectionPlan = async () => {
          const testFinalConfig = parseSessionJson<Record<string, unknown>>(sessionStorage.getItem("testFinalConfig")) || {};
          const configExamSlug = normalizeExamStageSlug(String(testFinalConfig?.examSlug || ""));
          const configStageSlug = normalizeExamStageSlug(String(testFinalConfig?.stageSlug || ""));
          const govSession = parseSessionJson<Record<string, unknown>>(sessionStorage.getItem("govExamQuizSession")) || {};
          const govSessionExamSlug = normalizeExamStageSlug(String(govSession?.examSlug || ""));
          const govSessionStageSlug = normalizeExamStageSlug(String(govSession?.stageSlug || ""));
          const fromTestId = deriveGovContextFromTestId(String(test?.id || ""));

          const examSlug = configExamSlug || govSessionExamSlug || fromTestId.examSlug;
          const stageSlug = configStageSlug || govSessionStageSlug || fromTestId.stageSlug;

          if (examSlug && stageSlug) {
            const stageCandidates = expandStageSlugCandidates(stageSlug);
            for (const stageCandidate of stageCandidates) {
              try {
                const response = await apiClient.get<{ data?: { sections?: BlueprintSection[] } }>(
                  API_ENDPOINTS.paperBlueprints.get,
                  {
                    params: { examSlug, stageSlug: stageCandidate },
                  }
                );
                const blueprintSections = Array.isArray(response.data?.data?.sections) ? response.data?.data?.sections || [] : [];
                const blueprintPlan = scaleBlueprintSections(blueprintSections, examQuestions.length);
                if (blueprintPlan.length > 0) {
                  setSectionPlan(blueprintPlan);
                  setSectionPlanSource("blueprint");
                  sessionStorage.setItem("testSectionPlan", JSON.stringify(blueprintPlan));
                  return;
                }
                // Blueprint resolved but has no sections: keep UX strictly aligned with API.
                if (response.data?.data) {
                  setSectionPlan([]);
                  setSectionPlanSource("blueprint");
                  sessionStorage.removeItem("testSectionPlan");
                  return;
                }
              } catch {
                // Try next stage slug candidate.
              }
            }
          }

          const storedSectionPlan = sessionStorage.getItem("testSectionPlan");
          if (storedSectionPlan) {
            try {
              const normalized = normalizeSectionPlan(JSON.parse(storedSectionPlan));
              if (normalized.length > 0) {
                setSectionPlan(normalized);
                setSectionPlanSource("session");
                return;
              }
            } catch {
              // Continue to fallback resolution.
            }
          }

          const fromQuestionMeta = buildSectionPlanFromQuestionMeta(examQuestions);
          if (fromQuestionMeta.length > 0) {
            setSectionPlan(fromQuestionMeta);
            setSectionPlanSource("question-meta");
            return;
          }

          setSectionPlan([]);
          setSectionPlanSource("inferred");
        };
        void loadDynamicSectionPlan();
        
        // Load saved answers
        const savedAnswers = sessionStorage.getItem('userAnswers');
        if (savedAnswers) {
          const parsedAnswers = JSON.parse(savedAnswers);
          setUserAnswers(parsedAnswers);
          
          // Count answered questions
          let count = 0;
          Object.values(parsedAnswers as Record<string, UserAnswer>).forEach((answer) => {
            if (answer?.value && 
                ((typeof answer.value === 'string' && answer.value.trim().length > 0) ||
                 (Array.isArray(answer.value) && answer.value.length > 0))) {
              count++;
            }
          });
          setAnsweredCount(count);
        }

        // Load saved question times
        const savedTimes = sessionStorage.getItem('questionTimes');
        if (savedTimes) {
          setQuestionTimeSpent(JSON.parse(savedTimes));
        }

        // Load saved question status with proper type casting
        const savedStatus = sessionStorage.getItem('questionStatus');
        if (savedStatus) {
          try {
            const parsedStatus = JSON.parse(savedStatus);
            // Validate and cast to Record<number, QuestionStatus>
            const validatedStatus: Record<number, QuestionStatus> = {};
            Object.entries(parsedStatus).forEach(([key, value]) => {
              const index = parseInt(key);
              if (QuestionStatusValues.includes(value as QuestionStatus)) {
                const nextStatus =
                  BYPASS_QUESTION_TIMEOUT && value === 'timed-out'
                    ? 'unanswered'
                    : (value as QuestionStatus);
                validatedStatus[index] = nextStatus;
              } else {
                validatedStatus[index] = 'unanswered';
              }
            });
            setQuestionStatus(validatedStatus);
          } catch {
            // If parsing fails, initialize with default status
            initializeQuestionStatus(examQuestions);
          }
        } else {
          initializeQuestionStatus(examQuestions);
        }
      } catch {
        router.push(`/${lang}/tests`);
      } finally {
        setIsInitializing(false);
      }
    } else {
      setIsInitializing(false);
      router.push(`/${lang}/tests`);
    }
  }, [lang, router]);

  const initializeQuestionStatus = (examQuestions: TestQuestion[]) => {
    const initialStatus: Record<number, QuestionStatus> = {};
    examQuestions.forEach((_, index) => {
      initialStatus[index] = 'unanswered';
    });
    setQuestionStatus(initialStatus);
    sessionStorage.setItem('questionStatus', JSON.stringify(initialStatus));
  };

  // Main timer for total test time
  useEffect(() => {
    if (isInitializing || !testInfo || !examEndTimeRef.current) return;

    const syncTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((examEndTimeRef.current - now) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && !didAutoSubmitRef.current) {
        didAutoSubmitRef.current = true;
        clearExamTimerState();
        handleAutoSubmit();
      }
    };

    syncTimer();
    const timer = setInterval(syncTimer, 1000);
    return () => clearInterval(timer);
  }, [isInitializing, testInfo]);

  // Question timer - track time spent on current question
  useEffect(() => {
    questionStartTimeRef.current = Date.now();

    const questionTimer = setInterval(() => {
      const timeSpentOnThisVisit = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
      
      // Don't update time for timed-out or answered questions
      if (questionStatus[currentQuestionIndex] === 'timed-out' || 
          questionStatus[currentQuestionIndex] === 'answered') {
        return;
      }

      const totalTimeSpent = (questionTimeSpent[currentQuestionIndex] || 0) + timeSpentOnThisVisit;
      
      const newTimes = {
        ...questionTimeSpent,
        [currentQuestionIndex]: totalTimeSpent
      };
      
      setQuestionTimeSpent(newTimes);
      sessionStorage.setItem('questionTimes', JSON.stringify(newTimes));

      // Auto mark as timed-out when time completes
      const currentQuestion = questions[currentQuestionIndex];
      if (!BYPASS_QUESTION_TIMEOUT && currentQuestion && questionStatus[currentQuestionIndex] === 'unanswered') {
        const questionTiming = getQuestionTimingInfo(currentQuestion.type);
        if (totalTimeSpent >= questionTiming.recommended) {
          // Mark as timed-out with proper type
          const newStatus: Record<number, QuestionStatus> = {
            ...questionStatus,
            [currentQuestionIndex]: 'timed-out'
          };
          setQuestionStatus(newStatus);
          sessionStorage.setItem('questionStatus', JSON.stringify(newStatus));
          
          // Auto move to next question if not last
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
          }
        }
      }
    }, 1000);

    return () => clearInterval(questionTimer);
  }, [currentQuestionIndex, questions, questionStatus]);

  const handleAnswerSelect = (answer: UserAnswer) => {
    const newAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: answer
    };
    
    setUserAnswers(newAnswers);
    
    // Mark as answered only when answer has real content.
    const nextStatus: QuestionStatus = hasMeaningfulAnswer(answer) ? 'answered' : 'unanswered';
    const newStatus: Record<number, QuestionStatus> = {
      ...questionStatus,
      [currentQuestionIndex]: nextStatus
    };
    setQuestionStatus(newStatus);
    sessionStorage.setItem('questionStatus', JSON.stringify(newStatus));
    
    // Update answered count
    let count = 0;
    Object.values(newAnswers).forEach((ans: UserAnswer) => {
      if (hasMeaningfulAnswer(ans)) {
        count++;
      }
    });
    setAnsweredCount(count);
    
    sessionStorage.setItem('userAnswers', JSON.stringify(newAnswers));
  };

  const handleTextAnswer = (text: string) => {
    handleAnswerSelect({ type: 'text', value: text });
  };

  const handleCodeAnswer = (code: string) => {
    handleAnswerSelect({ type: 'code', value: code });
  };

  const handleMcqAnswer = (value: string | string[]) => {
    handleAnswerSelect({ type: 'mcq', value });
  };

  const handleMultiSelectAnswer = (option: string, checked: boolean) => {
    const currentValue = userAnswers[currentQuestionIndex]?.value || [];
    const current = currentValue as string[];
    const newValue = checked
      ? Array.from(new Set([...current, option]))
      : current.filter((item: string) => item !== option);

    handleMcqAnswer(newValue);
  };

  const handleSkipQuestion = () => {
    // Mark current question as skipped with proper type
    const newStatus: Record<number, QuestionStatus> = {
      ...questionStatus,
      [currentQuestionIndex]: 'skipped'
    };
    setQuestionStatus(newStatus);
    sessionStorage.setItem('questionStatus', JSON.stringify(newStatus));
    
    // Move to next question if not last
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const toggleSolutionApproach = (index: number) => {
    setSolutionApproachVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleUnskipQuestion = () => {
    // Change from skipped back to unanswered with proper type
    const newStatus: Record<number, QuestionStatus> = {
      ...questionStatus,
      [currentQuestionIndex]: 'unanswered'
    };
    setQuestionStatus(newStatus);
    sessionStorage.setItem('questionStatus', JSON.stringify(newStatus));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (!userAnswer?.value) return;
      
      if (question.type === 'mcq') {
        if (typeof userAnswer.value === 'string') {
          if (userAnswer.value === question.answer) {
            correct++;
          }
        }
      }
    });
    return correct;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    clearExamTimerState();
    const score = calculateScore();
    const baseResults = {
      testInfo,
      score,
      totalQuestions: questions.length,
      userAnswers,
      questionTimeSpent,
      questionStatus,
      questions,
      timeSpent: (testInfo.duration * 60) - timeLeft,
      submittedAt: new Date().toISOString()
    };

    try {
      const evalResponse = await apiClient.post<{
        data?: {
          summary?: {
            score?: number;
            totalQuestions?: number;
            correctCount?: number;
            attemptedCount?: number;
            percentage?: number;
            overallFeedback?: string;
            strengths?: string[];
            improvements?: string[];
          };
          questionFeedback?: Array<{
            questionIndex: number;
            verdict: "correct" | "partial" | "incorrect" | "unattempted";
            score: number;
            feedback?: string;
            improvement?: string;
            expectedAnswer?: string;
          }>;
        };
      }>(
        API_ENDPOINTS.ai.evaluateTest,
        {
          provider: "openai",
          payload: {
            testInfo,
            questions,
            userAnswers,
            questionStatus,
            questionTimeSpent,
            timeSpent: (testInfo.duration * 60) - timeLeft,
          },
        },
        { timeout: 180000 }
      );

      const aiEvaluation = evalResponse.data?.data;
      const aiScore = Number(aiEvaluation?.summary?.score);
      const finalResults = {
        ...baseResults,
        score: Number.isFinite(aiScore) ? aiScore : baseResults.score,
        aiEvaluation: aiEvaluation || null,
      };

      sessionStorage.setItem('testResults', JSON.stringify(finalResults));
      router.push(`/${lang}/tests/result`);
    } catch {
      const fallbackResults = {
        ...baseResults,
        aiEvaluation: null,
      };
      sessionStorage.setItem('testResults', JSON.stringify(fallbackResults));
      message.warning("AI evaluation unavailable. Showing result based on objective scoring.");
      router.push(`/${lang}/tests/result`);
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const handleAutoSubmit = () => {
    clearExamTimerState();
    const score = calculateScore();
    const results = {
      testInfo,
      score,
      totalQuestions: questions.length,
      userAnswers,
      questionTimeSpent,
      questionStatus,
      questions,
      submittedAt: new Date().toISOString(),
      autoSubmitted: true
    };
    sessionStorage.setItem('testResults', JSON.stringify(results));
    router.push(`/${lang}/tests/result`);
  };

  const getQuestionTimingInfo = (questionType: string) => {
    return QUESTION_TIMINGS[questionType] || QUESTION_TIMINGS.mcq;
  };

  const toTitleCase = (value: string) =>
    String(value || '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const getQuestionTypeUxLabel = (questionType: TestQuestion['type']) => {
    if (questionType === 'coding') return 'Coding Challenge';
    if (questionType === 'output') return 'Output Prediction';
    if (questionType === 'scenario') return 'Scenario';
    if (questionType === 'theory') return 'Theory';
    return 'MCQ';
  };


  const getStatusUxLabel = (status?: QuestionStatus) => {
    if (status === 'answered') return 'Answered';
    if (status === 'skipped') return 'Skipped';
    if (status === 'timed-out') return "Time's Up";
    return 'Unanswered';
  };

  const getButtonColor = (index: number) => {
    const status = questionStatus[index];
    
    if (currentQuestionIndex === index) return '#2563eb'; // Active blue
    if (status === 'answered') return '#16a34a'; // Success green
    if (status === 'skipped' || status === 'timed-out') return '#dc2626'; // Error red
    return 'transparent'; // White for unanswered
  };

  const getButtonTextColor = (index: number) => {
    const status = questionStatus[index];
    if (status === 'skipped' || status === 'timed-out' || status === 'answered') {
      return 'white';
    }
    if (currentQuestionIndex === index) {
      return 'white';
    }
    return 'inherit';
  };

  const renderQuestionStem = (questionText: string) => {
    const segments = parseQuestionSegments(questionText);
    let prefixed = false;
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {segments.map((segment, index) => {
          if (segment.kind === 'text') {
            const clean = stripLeadingQuestionPrefix(segment.content);
            const content = !prefixed ? `Q. ${clean}` : clean;
            prefixed = true;
            return (
              <Text key={`text-${index}`} style={{ fontSize: 16, color: "#0f172a", lineHeight: 1.6 }}>
                {content}
              </Text>
            );
          }

          return (
            <div
              key={`code-${index}`}
              style={{
                background: '#000000',
                border: '2px solid #1f1f1f',
                borderRadius: 10,
                padding: 14,
                boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ color: '#b7e4c7', fontSize: 12, marginBottom: 8, letterSpacing: '0.04em' }}>
                CHALKBOARD CODE • {segment.language.toUpperCase()}
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#e8f5e9',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                }}
              >
                {segment.content}
              </pre>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRichPromptCard = (
    title: string,
    content: string,
    options?: { background?: string; borderColor?: string; accent?: string }
  ) => {
    const normalized = stripLeadingLabel(content, title);
    if (!normalized) return null;
    const segments = parseQuestionSegments(normalized);

    return (
      <Card
        size="small"
        style={{
          marginBottom: 16,
          background: options?.background || '#f8fafc',
          borderColor: options?.borderColor || '#dbe5f0',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <Text strong style={{ color: options?.accent || '#1d4e89', fontSize: 13, letterSpacing: '0.03em' }}>
            {title.toUpperCase()}
          </Text>
          {segments.map((segment, index) =>
            segment.kind === 'text' ? (
              <Text key={`${title}-text-${index}`} style={{ color: '#334155', lineHeight: 1.7 }}>
                {segment.content}
              </Text>
            ) : (
              <div
                key={`${title}-code-${index}`}
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid #1f2a3a',
                  background: '#0b1220',
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
                    borderBottom: '1px solid #253246',
                    padding: '8px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 600 }}>
                    {title} Snippet
                  </Text>
                  <Tag style={{ margin: 0, background: '#1e293b', color: '#cbd5e1', borderColor: '#334155' }}>
                    {(segment.language || 'text').toUpperCase()}
                  </Tag>
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  }}
                >
                  {segment.content}
                </pre>
              </div>
            )
          )}
        </div>
      </Card>
    );
  };

  const renderQuestionContent = (question: TestQuestion) => {
    const currentAnswer = userAnswers[currentQuestionIndex];
    const status = questionStatus[currentQuestionIndex];

    // Check if this is a multi-select MCQ
    const isMultiSelect = question.type === 'mcq' && 
                         question.answer && 
                         typeof question.answer === 'string' && 
                         question.answer.includes(',');

    // Check if question is timed-out (user cannot answer)
    const isTimedOut = !BYPASS_QUESTION_TIMEOUT && status === 'timed-out';
    const codingStarterTemplate = `function solve(input) {
  // Write your logic here
  return input;
}

const input = "";
console.log(solve(input));`;
    const answerShellStyle = {
      border: '1px solid #dbe6f4',
      background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
      borderRadius: 14,
      padding: 14,
      marginTop: 10,
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
    };

    return (
      <div>
        {status === 'skipped' && (
          <Alert
            message="This question was skipped"
            description="You can still answer this question. Click 'Unskip Question' below to enable answering."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" type="primary" onClick={handleUnskipQuestion}>
                Unskip Question
              </Button>
            }
          />
        )}

        {isTimedOut && (
          <Alert
            message="Time's up for this question!"
            description="You cannot answer this question as the time has expired. Please proceed to the next question."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <div style={answerShellStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #edf2f7',
              paddingBottom: 8,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#1e3a8a',
              }}
            >
              YOUR ANSWER
            </Text>
            <Text style={{ fontSize: 11, color: '#64748b' }}>
              {isTimedOut ? 'Locked' : 'Editable'}
            </Text>
          </div>

        {question.type === 'mcq' ? (
          isMultiSelect ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Select one or more options
                </Text>
                <Tag color="blue">
                  {((currentAnswer?.value as string[]) || []).length} selected
                </Tag>
              </div>

              {question.options?.map((opt: string, index: number) => {
                const isChecked = ((currentAnswer?.value as string[]) || []).includes(opt);
                const optionLabel = String.fromCharCode(65 + index);
                return (
                  <div
                    key={index}
                    onClick={() => !isTimedOut && handleMultiSelectAnswer(opt, !isChecked)}
                    style={{
                      padding: "12px 14px",
                      border: isChecked ? "1px solid #1d4ed8" : "1px solid #d9e2ef",
                      borderRadius: "12px",
                      transition: "all 0.2s ease",
                      fontSize: "15px",
                      margin: 0,
                      background: isChecked ? '#eff6ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      opacity: isTimedOut ? 0.6 : 1,
                      cursor: isTimedOut ? 'not-allowed' : 'pointer',
                      boxShadow: isChecked ? '0 6px 18px rgba(37,99,235,0.12)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: isChecked ? '#ffffff' : '#1d4ed8',
                        background: isChecked ? '#1d4ed8' : '#eaf2ff',
                        border: isChecked ? 'none' : '1px solid #bfdbfe',
                        flexShrink: 0,
                      }}
                    >
                      {optionLabel}
                    </span>
                    <Checkbox
                      checked={isChecked}
                      disabled={isTimedOut}
                      onChange={(e) => handleMultiSelectAnswer(opt, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Text style={{ margin: 0 }}>{opt}</Text>
                  </div>
                );
              })}
            </div>
          ) : (
            // Single select Radio style
            <Radio.Group
              onChange={(e) => !isTimedOut && handleMcqAnswer(e.target.value)}
              value={currentAnswer?.value as string}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {question.options?.map((opt: string, index: number) => {
                const selected = currentAnswer?.value === opt;
                const optionLabel = String.fromCharCode(65 + index);
                return (
                <Radio
                  key={index}
                  value={opt}
                  disabled={isTimedOut}
                  style={{
                    padding: "12px 14px",
                    border: selected ? "1px solid #1d4ed8" : "1px solid #d9e2ef",
                    borderRadius: "12px",
                    transition: "all 0.2s ease",
                    fontSize: "15px",
                    margin: 0,
                    background: selected ? '#eff6ff' : '#ffffff',
                    opacity: isTimedOut ? 0.6 : 1,
                    boxShadow: selected ? '0 6px 18px rgba(37,99,235,0.12)' : 'none',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: selected ? '#ffffff' : '#1d4ed8',
                        background: selected ? '#1d4ed8' : '#eaf2ff',
                        border: selected ? 'none' : '1px solid #bfdbfe',
                        flexShrink: 0,
                      }}
                    >
                      {optionLabel}
                    </span>
                    <span>{opt}</span>
                  </span>
                </Radio>
              )})}
            </Radio.Group>
          )
        ) : question.type === 'coding' ? (
          <div>
            {question.inputOutput && (
              renderRichPromptCard('Input/Output', question.inputOutput, {
                background: '#f0f7ff',
                borderColor: '#cfe2ff',
                accent: '#1e3a8a',
              })
            )}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #1f2a3a',
                  background: '#0b1220',
                  boxShadow: '0 8px 22px rgba(2, 6, 23, 0.4)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
                    borderBottom: '1px solid #253246',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: '#ef4444' }} />
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: '#f59e0b' }} />
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: '#22c55e' }} />
                    <Tag style={{ marginLeft: 8, background: '#1e293b', color: '#cbd5e1', borderColor: '#334155' }}>
                      solution.js
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginRight: 8 }}>
                      Tab: indent • Cmd/Ctrl+Z: undo
                    </Text>
                    <Button
                      size="small"
                      onClick={() => !isTimedOut && handleCodeAnswer(codingStarterTemplate)}
                      disabled={isTimedOut}
                    >
                      Starter
                    </Button>
                    <Button
                      size="small"
                      onClick={() => !isTimedOut && handleCodeAnswer("")}
                      disabled={isTimedOut}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div style={{ padding: 10, background: '#0b1220' }}>
                  <CodeEditor
                    value={(currentAnswer?.value as string) || ''}
                    onChange={isTimedOut ? () => {} : handleCodeAnswer}
                    language="javascript"
                    height="420px"
                    theme="vs-dark"
                  />
                </div>
                <div
                  style={{
                    borderTop: '1px solid #253246',
                    background: '#0f172a',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                    Keep functions small and handle edge cases.
                  </Text>
                  <Text style={{ color: '#cbd5e1', fontSize: 12 }}>
                    {((currentAnswer?.value as string) || '').split('\n').length} lines
                  </Text>
                </div>
              </div>
              {isTimedOut && (
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  <WarningOutlined /> This question is locked as time has expired.
                </Text>
              )}
            </div>
            {question.solutionApproach && (
              <div style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => toggleSolutionApproach(currentQuestionIndex)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #ffe1b3',
                    background: '#fffaf0',
                    borderRadius: 10,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    marginBottom: solutionApproachVisible[currentQuestionIndex] ? 10 : 0,
                  }}
                >
                  <span
                    style={{
                      color: '#9a3412',
                      fontWeight: 600,
                      fontSize: 13,
                      letterSpacing: '0.02em',
                    }}
                  >
                    Solution Approach
                  </span>
                  {solutionApproachVisible[currentQuestionIndex] ? (
                    <DownOutlined style={{ color: '#9a3412', fontSize: 12 }} />
                  ) : (
                    <RightOutlined style={{ color: '#9a3412', fontSize: 12 }} />
                  )}
                </button>
                {solutionApproachVisible[currentQuestionIndex] &&
                  renderRichPromptCard('Solution Approach', question.solutionApproach, {
                    background: '#fff8eb',
                    borderColor: '#ffe1b3',
                    accent: '#9a3412',
                  })}
              </div>
            )}
          </div>
        ) : question.type === 'theory' ? (
          <div>
            <TextArea
              placeholder={isTimedOut ? "Time expired - Cannot answer" : "Write your explanation here..."}
              value={(currentAnswer?.value as string) || ''}
              onChange={(e) => !isTimedOut && handleTextAnswer(e.target.value)}
              rows={8}
              style={{ fontSize: '16px' }}
              disabled={isTimedOut}
            />
            {isTimedOut && (
              <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                <WarningOutlined /> Time expired for this question
              </Text>
            )}
          </div>
        ) : question.type === 'output' ? (
          <div>
            {question.code && (
              <Card size="small" style={{ marginBottom: 16, background: '#f6ffed' }}>
                <pre style={{ margin: 0, fontSize: '14px', fontFamily: 'monospace' }}>
                  {question.code}
                </pre>
              </Card>
            )}
            <TextArea
              placeholder={isTimedOut ? "Time expired - Cannot answer" : "Write expected output here..."}
              value={(currentAnswer?.value as string) || ''}
              onChange={(e) => !isTimedOut && handleTextAnswer(e.target.value)}
              rows={4}
              style={{
                fontSize: '15px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                background: '#0f172a',
                color: '#e2e8f0',
                borderColor: '#1e293b',
              }}
              disabled={isTimedOut}
            />
          </div>
        ) : question.type === 'scenario' ? (
          <div>
            {question.idealSolution && (
              <Card size="small" style={{ marginBottom: 16, background: '#fff0f6' }}>
                <Text strong>Considerations: </Text>
                <Text>{question.idealSolution}</Text>
              </Card>
            )}
            <TextArea
              placeholder={isTimedOut ? "Time expired - Cannot answer" : "Describe your approach and solution..."}
              value={(currentAnswer?.value as string) || ''}
              onChange={(e) => !isTimedOut && handleTextAnswer(e.target.value)}
              rows={8}
              style={{ fontSize: '16px' }}
              disabled={isTimedOut}
            />
          </div>
        ) : (
          <Text>Unsupported question type</Text>
        )}
        </div>
      </div>
    );
  };

  const visibleSections = useMemo(() => {
    if (sectionPlanSource === "blueprint" && sectionPlan.length === 0) {
      return [];
    }
    const buckets = new Map<string, SectionBucket>();
    const orderedPlanKeys: string[] = [];
    const sectionRanges: Array<{ start: number; end: number; label: string }> = [];
    let cursor = 0;

    for (const plan of sectionPlan) {
      const label = toSectionLabel(plan.section);
      const key = normalizeSectionKey(label);
      if (!key || buckets.has(key)) continue;
      const planCount = Number(plan.targetCount || plan.servedCount || 0);
      if (planCount > 0) {
        sectionRanges.push({
          start: cursor,
          end: cursor + planCount,
          label,
        });
        cursor += planCount;
      }
      orderedPlanKeys.push(key);
      buckets.set(key, {
        key,
        label,
        indices: [],
        targetCount: Number.isFinite(plan.targetCount) ? plan.targetCount : 0,
        servedCount: Number.isFinite(plan.servedCount) ? plan.servedCount : 0,
      });
    }

    questions.forEach((question, index) => {
      const meta = question as TestQuestion & { section?: string };
      const explicitSection = toSectionLabel(String(meta.section || "").trim());
      const planMatchedSection =
        !explicitSection && sectionRanges.length > 0
          ? sectionRanges.find((range) => index >= range.start && index < range.end)?.label || ""
          : "";
      const label =
        sectionPlanSource === "blueprint"
          ? planMatchedSection || explicitSection || inferGovSection(question)
          : explicitSection || planMatchedSection || inferGovSection(question);
      const key = normalizeSectionKey(label) || `section-${index + 1}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.indices.push(index);
        return;
      }
      buckets.set(key, { key, label, indices: [index] });
    });

    return Array.from(buckets.values())
      .filter((section) => section.indices.length > 0)
      .sort((a, b) => {
        const aPlanIndex = orderedPlanKeys.indexOf(a.key);
        const bPlanIndex = orderedPlanKeys.indexOf(b.key);
        if (aPlanIndex !== -1 || bPlanIndex !== -1) {
          if (aPlanIndex === -1) return 1;
          if (bPlanIndex === -1) return -1;
          return aPlanIndex - bPlanIndex;
        }
        return (a.indices[0] || 0) - (b.indices[0] || 0);
      });
  }, [questions, sectionPlan, sectionPlanSource]);

  const sectionByKey = useMemo(
    () => Object.fromEntries(visibleSections.map((section) => [section.key, section])) as Record<string, SectionBucket>,
    [visibleSections]
  );
  const filteredQuestionIndices =
    activeSection === "All" || !sectionByKey[activeSection]
      ? questions.map((_, index) => index)
      : sectionByKey[activeSection].indices;
  const sectionAnsweredCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const section of visibleSections) {
      counts[section.key] = section.indices.reduce(
        (sum, index) => sum + (questionStatus[index] === "answered" ? 1 : 0),
        0
      );
    }
    return counts;
  }, [visibleSections, questionStatus]);
  useEffect(() => {
    if (activeSection !== "All" && !sectionByKey[activeSection]) {
      setActiveSection("All");
    }
  }, [activeSection, sectionByKey]);
  const skippedCount = useMemo(
    () => Object.values(questionStatus).filter((status) => status === 'skipped' || status === 'timed-out').length,
    [questionStatus]
  );
  const overallProgress = useMemo(
    () => (questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0),
    [answeredCount, questions.length]
  );
  const answersFeedbackJsonString = useMemo(() => {
    if (!showSubmitModal) return "";
    return JSON.stringify(
      questions.map((question, index) => ({
        questionNo: index + 1,
        questionId: question.id || `q${index + 1}`,
        type: question.type,
        difficulty: question.difficulty,
        status: questionStatus[index] || 'unanswered',
        userAnswer: userAnswers[index]?.value ?? null,
        expectedAnswer: question.answer || null,
        timeSpentSec: questionTimeSpent[index] || 0,
      })),
      null,
      2
    );
  }, [showSubmitModal, questions, questionStatus, userAnswers, questionTimeSpent]);

  if (isInitializing || !testInfo || questions.length === 0) {
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

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionMeta = currentQuestion as RcQuestionMeta;
  const currentSection =
    visibleSections.find((section) => section.indices.includes(currentQuestionIndex))?.label ||
    inferGovSection(currentQuestion);
  const currentStatus = questionStatus[currentQuestionIndex];
  const isAnswered = currentStatus === 'answered';
  const isSkipped = currentStatus === 'skipped';
  const isTimedOut = !BYPASS_QUESTION_TIMEOUT && currentStatus === 'timed-out';
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const canSkip = !isAnswered && !isTimedOut && !isSkipped && !isLastQuestion;
  const difficultyLabel = toTitleCase(currentQuestion.difficulty || 'medium');
  const questionTypeLabel = getQuestionTypeUxLabel(currentQuestion.type);
  const statusLabel = getStatusUxLabel(currentStatus);
  const isMobile = !screens.md;
  const paletteColumns = screens.xl ? 10 : screens.lg ? 8 : screens.md ? 7 : screens.sm ? 6 : 5;
  const paletteTileSize = isMobile ? 28 : 30;
  const totalDurationSec = Math.max(1, testInfo.duration * 60);
  const timerProgressPct = Math.min(100, Math.max(0, Math.round(((totalDurationSec - timeLeft) / totalDurationSec) * 100)));
  const timerProgressDeg = Math.round((timerProgressPct / 100) * 360);
  const timerCritical = timeLeft < 300;
  const timerPrimary = timerCritical ? "#ea580c" : "#0f766e";
  const timerTrack = timerCritical ? "#fed7aa" : "#99f6e4";
  const currentGroupType = String(currentQuestionMeta?.groupType || "").toLowerCase();
  const currentGroupId = String(currentQuestionMeta?.groupId || "").trim();
  const currentIsRc = currentGroupType === "rc_passage" && currentGroupId.length > 0;
  const currentPassageText = String(currentQuestionMeta?.passageText || "").trim();
  const currentGroupTitle = String(currentQuestionMeta?.groupTitle || "Reading Comprehension").trim();
  const currentRcGroupIndices = currentIsRc
    ? questions
        .map((q, idx) => ({ q: q as RcQuestionMeta, idx }))
        .filter((entry) => String(entry.q.groupType || "").toLowerCase() === "rc_passage")
        .filter((entry) => String(entry.q.groupId || "").trim() === currentGroupId)
        .sort((a, b) => {
          const aOrder = Number(a.q.groupOrder || 0);
          const bOrder = Number(b.q.groupOrder || 0);
          if (aOrder > 0 || bOrder > 0) return aOrder - bOrder;
          return a.idx - b.idx;
        })
        .map((entry) => entry.idx)
    : [];
  const currentRcPosition = currentRcGroupIndices.findIndex((idx) => idx === currentQuestionIndex);

  return (
    <>
      <Row
        gutter={[16, 16]}
        style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%)" }}
      >
        {/* Left side - Question Panel */}
        <Col
          xs={24}
          lg={16}
          style={{
            padding: isMobile ? "18px 14px" : "28px 44px",
            background: "#ffffff",
            borderRight: screens.lg ? "1px solid #f0f0f0" : "none",
          }}
        >
          <div style={{ marginBottom: 30 }}>
            <Title level={4} style={{ color: "#0f172a", marginBottom: 5 }}>
              {testInfo.title} • {testInfo.domain}
            </Title>
            <Progress
              percent={overallProgress}
              showInfo={false}
              strokeColor={{ from: "#2563eb", to: "#0891b2" }}
              trailColor="#e2e8f0"
              style={{ margin: "8px 0 14px 0" }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <Tag color="blue" style={{ fontSize: 13, padding: '4px 10px', borderRadius: 999 }}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Tag>
              <Tag
                color={
                  currentQuestion.difficulty === 'easy'
                    ? 'green'
                    : currentQuestion.difficulty === 'medium'
                    ? 'orange'
                    : 'red'
                }
                style={{ fontSize: 13, padding: '4px 10px', borderRadius: 999 }}
              >
                {difficultyLabel}
              </Tag>
              <Tag style={{ fontSize: 13, padding: '4px 10px', borderRadius: 999 }}>
                {questionTypeLabel}
              </Tag>
              <Tag
                color={isAnswered ? 'success' : isTimedOut ? 'error' : isSkipped ? 'warning' : 'default'}
                style={{ fontSize: 13, padding: '4px 10px', borderRadius: 999 }}
              >
                {statusLabel}
              </Tag>
              <Tag color="cyan" style={{ fontSize: 13, padding: "4px 10px", borderRadius: 999 }}>
                Section: {currentSection}
              </Tag>
              {currentIsRc && (
                <Tag color="magenta" style={{ fontSize: 13, padding: "4px 10px", borderRadius: 999 }}>
                  RC Set • Q {Math.max(1, currentRcPosition + 1)}/{Math.max(1, currentRcGroupIndices.length)}
                </Tag>
              )}
            </div>
            {currentIsRc && currentPassageText && (
              <div
                style={{
                  border: "1px solid #f5d0fe",
                  background: "linear-gradient(180deg, #fdf4ff 0%, #f8fafc 100%)",
                  borderRadius: 14,
                  padding: isMobile ? 12 : 14,
                  marginBottom: 14,
                  boxShadow: "0 10px 20px rgba(168, 85, 247, 0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <Text strong style={{ color: "#86198f", letterSpacing: "0.02em" }}>
                    {currentGroupTitle || "Reading Comprehension Passage"}
                  </Text>
                  <Tag color="purple" style={{ borderRadius: 999 }}>
                    Linked Questions: {currentRcGroupIndices.length}
                  </Tag>
                </div>
                <div
                  style={{
                    maxHeight: isMobile ? 190 : 230,
                    overflowY: "auto",
                    paddingRight: 4,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "#3b0764", lineHeight: 1.8, fontSize: 14.5 }}>
                    {currentPassageText}
                  </Text>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {currentRcGroupIndices.map((idx, chipIndex) => {
                    const active = idx === currentQuestionIndex;
                    const status = questionStatus[idx];
                    const answered = status === "answered";
                    return (
                      <Button
                        key={`rc-chip-${idx}`}
                        size="small"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        style={{
                          borderRadius: 999,
                          height: 26,
                          paddingInline: 9,
                          fontSize: 11.5,
                          fontWeight: 700,
                          borderColor: active ? "#9333ea" : answered ? "#22c55e" : "#c4b5fd",
                          background: active ? "#9333ea" : answered ? "#dcfce7" : "#faf5ff",
                          color: active ? "#ffffff" : answered ? "#166534" : "#6b21a8",
                        }}
                      >
                        Q{chipIndex + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            {currentQuestion.type === 'coding' ? (
              <div
                style={{
                  background: '#0b1220',
                  border: '1px solid #1f2a3a',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
                    borderBottom: '1px solid #253246',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#e2e8f0', fontWeight: 700 }}>Problem Statement</Text>
                  <Tag style={{ margin: 0, background: '#1e293b', color: '#cbd5e1', borderColor: '#334155' }}>
                    Read carefully before coding
                  </Tag>
                </div>
                <div style={{ padding: 14 }}>
                  {renderQuestionStem(currentQuestion.question)}
                </div>
              </div>
            ) : (
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
                  borderRadius: 12,
                  padding: isMobile ? 12 : 14,
                }}
              >
                {renderQuestionStem(currentQuestion.question)}
              </div>
            )}
          </div>

          {renderQuestionContent(currentQuestion)}

          {/* Navigation Buttons */}
          <div
            style={{
              position: 'sticky',
              bottom: isMobile ? 8 : 12,
              marginTop: 28,
              padding: isMobile ? '10px' : '12px 14px',
              borderRadius: 14,
              border: '1px solid #e5eaf3',
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
              backdropFilter: 'blur(6px)',
              display: 'grid',
              gap: isMobile ? 8 : 12,
            }}
          >
            <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center' }}>
              {currentQuestionIndex + 1} / {questions.length}
            </Text>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'auto auto auto',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <Button
                icon={<LeftOutlined />}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                style={{
                  minWidth: isMobile ? 0 : 120,
                  width: isMobile ? '100%' : 'auto',
                  height: 40,
                  borderRadius: 10,
                  paddingInline: isMobile ? 8 : undefined,
                  fontSize: isMobile ? 13 : undefined,
                }}
              >
                Previous
              </Button>
              <Button
                type="default"
                danger
                icon={<FastForwardOutlined />}
                onClick={handleSkipQuestion}
                disabled={!canSkip}
                style={{
                  minWidth: isMobile ? 0 : 130,
                  width: isMobile ? '100%' : 'auto',
                  height: 40,
                  borderRadius: 10,
                  paddingInline: isMobile ? 8 : undefined,
                  fontSize: isMobile ? 13 : undefined,
                }}
              >
                Skip
              </Button>
              <Button
                type="primary"
                icon={<RightOutlined />}
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                disabled={isLastQuestion}
                style={{
                  minWidth: isMobile ? 0 : 120,
                  width: isMobile ? '100%' : 'auto',
                  height: 40,
                  borderRadius: 10,
                  paddingInline: isMobile ? 8 : undefined,
                  fontSize: isMobile ? 13 : undefined,
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </Col>

        {/* Right side - Timer + Controls */}
        <Col xs={24} lg={8} style={{ padding: isMobile ? "0 14px 20px" : "28px 22px" }}>
          {/*
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "18px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              marginBottom: 14,
              position: "sticky",
              top: 20
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
              <ClockCircleOutlined style={{ fontSize: 20, color: "#1890ff", marginRight: 10 }} />
              <Title level={4} style={{ margin: 0 }}>Total Time Remaining</Title>
            </div>
            <Text strong style={{
              fontSize: 28,
              color: timeLeft < 300 ? "#d4380d" : "#389e0d",
              display: 'block',
              textAlign: 'center',
              marginBottom: 10
            }}>
              {formatTime(timeLeft)}
            </Text>

            {timeLeft < 300 && timeLeft > 0 && (
              <Alert
                message="Less than 5 minutes remaining!"
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            )}
            {timeLeft === 0 && (
              <Alert
                message="Time's up! Submitting your test..."
                type="error"
                showIcon
              />
            )}
          </div>
          */}

          <div
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
              borderRadius: "16px",
              padding: "18px",
              border: "1px solid #dbe7ff",
              boxShadow: "0 10px 26px rgba(37, 99, 235, 0.08)",
              position: screens.lg ? "sticky" : "static",
              top: screens.lg ? 20 : "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <Title level={4} style={{ margin: 0, color: "#1e3a8a" }}>Question Navigation</Title>
              <div
                style={{
                  borderRadius: 999,
                  padding: 1.5,
                  minWidth: 104,
                  background: `conic-gradient(${timerPrimary} 0deg ${timerProgressDeg}deg, ${timerTrack} ${timerProgressDeg}deg 360deg)`,
                }}
              >
                <div
                  style={{
                    borderRadius: 999,
                    background: timerCritical
                      ? "linear-gradient(90deg, #fff7ed 0%, #ffedd5 100%)"
                      : "linear-gradient(90deg, #f0fdfa 0%, #ecfeff 100%)",
                    padding: "5px 12px",
                    textAlign: "center",
                    boxShadow: timerCritical
                      ? "0 4px 12px rgba(234, 88, 12, 0.18)"
                      : "0 4px 12px rgba(15, 118, 110, 0.16)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12.5,
                      color: timerCritical ? "#c2410c" : "#0f766e",
                      letterSpacing: "0.06em",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontWeight: 800,
                    }}
                  >
                    {formatTime(timeLeft)}
                  </Text>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ color: "#1e3a8a" }}>Question Palette</Text>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8, marginBottom: 10 }}>
                <Tag style={{ margin: 0, borderRadius: 999, borderColor: "#93c5fd", background: "#dbeafe", color: "#1e3a8a" }}>
                  Current
                </Tag>
                <Tag style={{ margin: 0, borderRadius: 999, borderColor: "#86efac", background: "#dcfce7", color: "#166534" }}>
                  Answered
                </Tag>
                <Tag style={{ margin: 0, borderRadius: 999, borderColor: "#fca5a5", background: "#fee2e2", color: "#991b1b" }}>
                  Skipped
                </Tag>
                <Tag style={{ margin: 0, borderRadius: 999, borderColor: "#cbd5e1", background: "#f8fafc", color: "#334155" }}>
                  Unanswered
                </Tag>
              </div>
            </div>
            {currentIsRc && (
              <div
                style={{
                  marginBottom: 10,
                  border: "1px solid #e9d5ff",
                  borderRadius: 12,
                  padding: "8px 8px 9px",
                  background: "linear-gradient(180deg, #fdf4ff 0%, #faf5ff 100%)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <Text strong style={{ color: "#7e22ce", fontSize: 12 }}>RC Navigator</Text>
                  <Text style={{ fontSize: 11, color: "#7e22ce", fontWeight: 700 }}>
                    {Math.max(1, currentRcPosition + 1)}/{Math.max(1, currentRcGroupIndices.length)}
                  </Text>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {currentRcGroupIndices.map((idx, chipIndex) => {
                    const active = idx === currentQuestionIndex;
                    return (
                      <Button
                        key={`rc-nav-${idx}`}
                        size="small"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        style={{
                          borderRadius: 999,
                          height: 24,
                          minWidth: 44,
                          paddingInline: 8,
                          borderColor: active ? "#9333ea" : "#d8b4fe",
                          background: active ? "#9333ea" : "#ffffff",
                          color: active ? "#ffffff" : "#6b21a8",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Q{chipIndex + 1}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${paletteColumns}, minmax(0, 1fr))`,
                gap: 6,
                padding: 8,
                border: "1px solid #dbeafe",
                borderRadius: 12,
                background: "#f8fbff",
                marginBottom: 16,
              }}
            >
              {filteredQuestionIndices.map((index) => {
                const buttonColor = getButtonColor(index);
                const textColor = getButtonTextColor(index);
                const status = questionStatus[index];

                return (
                  <Button
                    key={index}
                    type={currentQuestionIndex === index ? "primary" : "default"}
                    size="small"
                    onClick={() => {
                      if (BYPASS_QUESTION_TIMEOUT || questionStatus[currentQuestionIndex] !== "timed-out") {
                        setCurrentQuestionIndex(index);
                      }
                    }}
                    style={{
                      width: paletteTileSize,
                      minWidth: 0,
                      height: paletteTileSize,
                      padding: 0,
                      borderRadius: "50%",
                      background: buttonColor,
                      borderColor: buttonColor === "transparent" ? "#cbd5e1" : buttonColor,
                      color: textColor,
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: status === "skipped" || status === "timed-out" ? 700 : 600,
                      boxShadow:
                        currentQuestionIndex === index
                          ? "0 6px 14px rgba(37, 99, 235, 0.28)"
                          : "none",
                    }}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>

            <div
              style={{
                marginBottom: 10,
                border: "1px solid #bfdbfe",
                borderRadius: 12,
                padding: "8px 8px 9px",
                background: "linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <Text strong style={{ color: "#1d4ed8", fontSize: 12, letterSpacing: "0.02em" }}>Section View</Text>
                <Text style={{ fontSize: 11, color: "#1e3a8a", fontWeight: 600 }}>
                  {visibleSections.length} sections{sectionPlanSource === "blueprint" ? " • admin synced" : ""}
                </Text>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {visibleSections.map((section) => {
                  const indices = section.indices;
                  const answeredInSection = sectionAnsweredCounts[section.key] || 0;
                  const target = indices.find((index) => questionStatus[index] !== "answered") ?? indices[0];
                  const shortLabel = section.label;
                  const active = activeSection === section.key;
                  const accent = "#334155";

                  return (
                    <Button
                      key={`summary-${section.key}`}
                      size="small"
                      type="default"
                      onClick={() => {
                        setActiveSection(section.key);
                        if (typeof target === "number") setCurrentQuestionIndex(target);
                      }}
                      style={{
                        borderRadius: 999,
                        height: 28,
                        paddingInline: 9,
                        fontSize: 11.5,
                        fontWeight: 700,
                        lineHeight: 1,
                        borderColor: active ? accent : "#cbd5e1",
                        background: active ? `linear-gradient(90deg, ${accent}, #1d4ed8)` : "#ffffff",
                        color: active ? "#ffffff" : "#0f172a",
                        boxShadow: active ? "0 6px 14px rgba(37, 99, 235, 0.26)" : "none",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: 99,
                          marginRight: 6,
                          background: active ? "#ffffff" : accent,
                        }}
                      />
                      {shortLabel} {answeredInSection}/{section.targetCount || indices.length}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 15 }}>
              <Text strong>Progress: </Text>
              <Text>{answeredCount} of {questions.length} answered</Text>
              <Text style={{ color: '#f59e0b', marginLeft: 10 }}>
                ({questions.length - answeredCount} remaining)
              </Text>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <Tag color="success" style={{ borderRadius: 999, padding: "2px 10px" }}>Answered: {answeredCount}</Tag>
              <Tag color="error" style={{ borderRadius: 999, padding: "2px 10px" }}>Skipped: {skippedCount}</Tag>
              <Tag style={{ borderRadius: 999, padding: "2px 10px" }}>Unanswered: {Math.max(0, questions.length - answeredCount - skippedCount)}</Tag>
            </div>

            

            <Divider style={{ margin: "12px 0" }} />

            <Button
              type="primary"
              block
              size="large"
              onClick={() => setShowSubmitModal(true)}
              style={{ 
                height: 45,
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(90deg, #2261f5ff, #2073faff)',
                border: 'none'
              }}
            >
              Submit Test
            </Button>

            {answeredCount < questions.length && (
              <Text style={{ 
                display: 'block', 
                textAlign: 'center', 
                marginTop: 10,
                color: '#f59e0b',
                fontSize: 12
              }}>
                {questions.length - answeredCount} questions remaining
              </Text>
            )}
          </div>
        </Col>
      </Row>

      {/* Submit Confirmation Modal */}
      <Modal
        title="Submit Test"
        open={showSubmitModal}
        onOk={handleSubmit}
        onCancel={() => setShowSubmitModal(false)}
        okText="Yes, Submit Now"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        confirmLoading={isSubmitting}
        cancelButtonProps={{ disabled: isSubmitting }}
      >
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="Are you sure you want to submit your test?"
            description={
              <div>
                <p>Once submitted, you cannot make any changes.</p>
                <div style={{ marginTop: 10 }}>
                  <p><strong>Test Summary:</strong></p>
                  <p>• Questions Answered: {answeredCount} / {questions.length}</p>
                  <p>• Questions Remaining: {questions.length - answeredCount}</p>
                  <p>• Time Remaining: {formatTime(timeLeft)}</p>
                </div>
              </div>
            }
            type="warning"
            showIcon
          />
          {answeredCount < questions.length && (
            <Alert
              message="You have unanswered questions!"
              description={`You have ${questions.length - answeredCount} question(s) remaining. They will be marked as unattempted.`}
              type="error"
              showIcon
              style={{ marginTop: 15 }}
            />
          )}
          <div style={{ marginTop: 14 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Answer JSON Preview
            </Text>
            <div
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 10,
                padding: 10,
                maxHeight: 260,
                overflow: 'auto',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  color: '#e2e8f0',
                  fontSize: 12,
                  lineHeight: 1.5,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {answersFeedbackJsonString}
              </pre>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
