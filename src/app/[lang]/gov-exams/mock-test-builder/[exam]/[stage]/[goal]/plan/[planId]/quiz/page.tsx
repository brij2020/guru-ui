"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Alert, Button, Card, Progress, Radio, Tag, Typography } from "antd";
import type { Test, TestQuestion } from "@/utils/testData";

const { Title, Text } = Typography;

type GovQuizSession = {
  examSlug: string;
  stageSlug: string;
  goalSlug: string;
  planId: string;
  test: Test;
  questions: TestQuestion[];
};

const STORAGE_KEY = "govExamQuizSession";

const readGovSession = (): GovQuizSession | null => {
  if (typeof window === "undefined") return null;

  const rawSession = sessionStorage.getItem(STORAGE_KEY);
  const rawLocal = localStorage.getItem(STORAGE_KEY);
  const raw = rawSession || rawLocal;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GovQuizSession;
  } catch {
    return null;
  }
};

export default function GovQuizPage() {
  const params = useParams<{
    lang: string;
    exam: string;
    stage: string;
    goal: string;
    planId: string;
  }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<GovQuizSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = readGovSession();
    if (!stored) return;
    setQuiz(stored);
  }, []);

  const routePlanHref = useMemo(
    () =>
      `/${params.lang}/gov-exams/mock-test-builder/${params.exam}/${params.stage}/${params.goal}/plan/${params.planId}`,
    [params.exam, params.goal, params.lang, params.planId, params.stage]
  );

  const currentQuestion = quiz?.questions?.[currentIndex];
  const answeredCount = Object.values(answers).filter((value) => String(value || "").trim().length > 0).length;
  const total = quiz?.questions?.length || 0;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const score = useMemo(() => {
    if (!quiz) return 0;
    let totalCorrect = 0;
    quiz.questions.forEach((q, idx) => {
      if (String(answers[idx] || "") === String(q.answer || "")) {
        totalCorrect += 1;
      }
    });
    return totalCorrect;
  }, [answers, quiz]);

  if (!quiz) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Alert
          type="warning"
          showIcon
          message="Quiz data not found"
          description="Generate the quiz from Step 5 first. This page needs the API JSON response stored in browser session."
        />
        <div className="mt-4">
          <Link href={routePlanHref} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Back to Step 5
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="rounded-2xl">
          <Title level={3}>Gov Mock Result</Title>
          <p className="text-sm text-slate-600">{quiz.test.title}</p>
          <div className="mt-4 flex items-center gap-3">
            <Tag color="blue">Score: {score}/{total}</Tag>
            <Tag color={percentage >= 70 ? "green" : "orange"}>{percentage}%</Tag>
          </div>
          <div className="mt-6 flex gap-3">
            <Button type="primary" onClick={() => router.push(routePlanHref)}>
              Regenerate Quiz
            </Button>
            <Button
              onClick={() => {
                setSubmitted(false);
                setCurrentIndex(0);
                setAnswers({});
              }}
            >
              Retry Same Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Card className="rounded-2xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title level={4} className="!mb-1">
              {quiz.test.title}
            </Title>
            <Text type="secondary">
              Gov Exam Quiz • Question {currentIndex + 1} of {total}
            </Text>
          </div>
          <Tag color="geekblue">{quiz.test.duration} min</Tag>
        </div>

        <Progress percent={progress} showInfo={false} />

        <div className="mt-6">
          <Text strong className="text-base">
            {currentQuestion?.question}
          </Text>
          <Radio.Group
            className="mt-4 !flex !flex-col gap-3"
            value={answers[currentIndex]}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [currentIndex]: e.target.value }))}
          >
            {(currentQuestion?.options || []).map((opt) => (
              <Radio key={opt} value={opt} className="rounded-lg border border-slate-200 p-3">
                {opt}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <Button disabled={currentIndex === 0} onClick={() => setCurrentIndex((prev) => prev - 1)}>
            Previous
          </Button>

          <div className="flex gap-2">
            <Button onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, total - 1))} disabled={currentIndex >= total - 1}>
              Next
            </Button>
            <Button type="primary" onClick={() => setSubmitted(true)}>
              Submit Quiz
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
