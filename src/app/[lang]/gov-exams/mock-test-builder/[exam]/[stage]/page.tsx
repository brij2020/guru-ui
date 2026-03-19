import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GOALS, STRUGGLE_AREAS, getBuilderCopy, getExamBySlug, getStageBySlug } from "@/lib/mockTestBuilder";
import BuilderLayout from "@/components/govMockBuilder/BuilderLayout";
import StruggleGoalSelector from "@/components/govMockBuilder/StruggleGoalSelector";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: "en" | "hi"; exam: string; stage: string }>;
}): Promise<Metadata> {
  const { exam, stage } = await params;
  const examConfig = getExamBySlug(exam);
  if (!examConfig) return { title: "Exam Not Found" };
  const stageConfig = getStageBySlug(examConfig, stage);
  if (!stageConfig) return { title: "Stage Not Found" };

  return {
    title: `${examConfig.name} ${stageConfig.name} Mock Test Goals`,
    description: `Pick your preparation goal for ${examConfig.name} ${stageConfig.name} and generate an AI mock test plan.`,
  };
}

export default async function GovMockBuilderStagePage({
  params,
}: {
  params: Promise<{ lang: "en" | "hi"; exam: string; stage: string }>;
}) {
  const { lang, exam, stage } = await params;
  const copy = getBuilderCopy(lang);
  const examConfig = getExamBySlug(exam);
  if (!examConfig) notFound();
  const stageConfig = getStageBySlug(examConfig, stage);
  if (!stageConfig) notFound();

  return (
    <BuilderLayout
      step={3}
      badge={copy.goalStepLabel}
      title={`${examConfig.name} • ${stageConfig.name}`}
      subtitle={`Base format: ${stageConfig.questionCount} questions in ${stageConfig.durationMinutes} minutes. Select your goal.`}
      crumbs={[
        { label: "Mock Test Builder", href: `/${lang}/gov-exams/mock-test-builder` },
        { label: examConfig.name, href: `/${lang}/gov-exams/mock-test-builder/${examConfig.slug}` },
        { label: stageConfig.name },
      ]}
      backHref={`/${lang}/gov-exams/mock-test-builder/${examConfig.slug}`}
      backLabel="Back to Stages"
    >
      <StruggleGoalSelector
        lang={lang}
        examSlug={examConfig.slug}
        stageSlug={stageConfig.slug}
        goals={GOALS}
        struggles={STRUGGLE_AREAS}
      />
    </BuilderLayout>
  );
}
