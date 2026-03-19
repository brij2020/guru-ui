import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuilderCopy, getExamBySlug, getGoalBySlug, getStageBySlug } from "@/lib/mockTestBuilder";
import BuilderLayout from "@/components/govMockBuilder/BuilderLayout";

const PLAN_VARIANTS = [
  { id: "daily-45m", label: "Daily 45m Plan", notes: "Short daily practice with consistency focus." },
  { id: "weekend-full", label: "Weekend Full Mock", notes: "Full-length timed simulation with detailed review." },
  { id: "weak-topic-blitz", label: "Weak Topic Blitz", notes: "Targeted drill for your lowest-performing sections." },
];

const GOAL_PLAN_MATCH: Record<string, string> = {
  "full-exam-simulation": "weekend-full",
  "weak-topic-practice": "weak-topic-blitz",
  "previous-year-style": "weekend-full",
  "speed-test": "daily-45m",
  "concept-builder": "daily-45m",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: "en" | "hi"; exam: string; stage: string; goal: string }>;
}): Promise<Metadata> {
  const { exam, stage, goal } = await params;
  const examConfig = getExamBySlug(exam);
  if (!examConfig) return { title: "Exam Not Found" };
  const stageConfig = getStageBySlug(examConfig, stage);
  if (!stageConfig) return { title: "Stage Not Found" };
  const goalConfig = getGoalBySlug(goal);
  if (!goalConfig) return { title: "Goal Not Found" };

  return {
    title: `${examConfig.name} ${stageConfig.name} ${goalConfig.name} Plans`,
    description: `Choose an AI plan template for ${examConfig.name} ${stageConfig.name} with ${goalConfig.name.toLowerCase()} focus.`,
  };
}

export default async function GovMockBuilderGoalPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: "en" | "hi"; exam: string; stage: string; goal: string }>;
  searchParams: Promise<{ struggle?: string }>;
}) {
  const { lang, exam, stage, goal } = await params;
  const { struggle } = await searchParams;
  const copy = getBuilderCopy(lang);
  const examConfig = getExamBySlug(exam);
  if (!examConfig) notFound();
  const stageConfig = getStageBySlug(examConfig, stage);
  if (!stageConfig) notFound();
  const goalConfig = getGoalBySlug(goal);
  if (!goalConfig) notFound();

  return (
    <BuilderLayout
      step={4}
      badge={copy.planStepLabel}
      title={`${goalConfig.name} for ${examConfig.name} ${stageConfig.name}`}
      subtitle={`${goalConfig.summary} Recommended mix: ${goalConfig.recommendedMix}.`}
      crumbs={[
        { label: "Mock Test Builder", href: `/${lang}/gov-exams/mock-test-builder` },
        { label: examConfig.name, href: `/${lang}/gov-exams/mock-test-builder/${examConfig.slug}` },
        { label: stageConfig.name, href: `/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stageConfig.slug}` },
        { label: goalConfig.name },
      ]}
      backHref={`/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stageConfig.slug}`}
      backLabel="Back to Goals"
    >
      {struggle ? (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Personalized focus selected: <span className="font-semibold">{struggle.replace(/-/g, " ")}</span>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_VARIANTS.map((plan) => {
          const recommended = GOAL_PLAN_MATCH[goalConfig.slug] === plan.id;
          return (
            <Link
              key={plan.id}
              href={`/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stageConfig.slug}/${goalConfig.slug}/plan/${plan.id}${
                struggle ? `?struggle=${encodeURIComponent(struggle)}` : ""
              }`}
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                recommended ? "border-emerald-300 ring-2 ring-emerald-100 hover:border-emerald-400" : "border-slate-200 hover:border-blue-400"
              }`}
            >
              {recommended ? (
                <p className="mb-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  Best Match
                </p>
              ) : null}
              <h2 className="text-lg font-semibold text-slate-900">{plan.label}</h2>
              <p className="mt-2 text-sm text-slate-600">{plan.notes}</p>
              <p className={`mt-4 text-sm font-semibold ${recommended ? "text-emerald-700 group-hover:text-emerald-800" : "text-blue-700 group-hover:text-blue-800"}`}>
                {recommended ? "Open Recommended Plan →" : "Open Plan →"}
              </p>
            </Link>
          );
        })}
      </div>
    </BuilderLayout>
  );
}
