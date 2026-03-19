import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamBySlug, getGoalBySlug, getStageBySlug } from "@/lib/mockTestBuilder";
import BuilderLayout from "@/components/govMockBuilder/BuilderLayout";
import PromptComposerCard from "@/components/govMockBuilder/PromptComposerCard";

const PLAN_COPY: Record<string, { title: string; bullets: string[] }> = {
  "daily-45m": {
    title: "Daily 45m Plan",
    bullets: ["2 short timed sections", "Negative marking guardrails", "Daily weak-topic rotation"],
  },
  "weekend-full": {
    title: "Weekend Full Mock",
    bullets: ["Full-length simulation", "Section-wise score analysis", "AI revision priority list"],
  },
  "weak-topic-blitz": {
    title: "Weak Topic Blitz",
    bullets: ["Target your bottom 2 topics", "Progressive difficulty ramp", "Fast feedback loop"],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: "en" | "hi"; exam: string; stage: string; goal: string; planId: string }>;
}): Promise<Metadata> {
  const { exam, stage, goal, planId } = await params;
  const examConfig = getExamBySlug(exam);
  if (!examConfig) return { title: "Exam Not Found" };
  const stageConfig = getStageBySlug(examConfig, stage);
  if (!stageConfig) return { title: "Stage Not Found" };
  const goalConfig = getGoalBySlug(goal);
  if (!goalConfig) return { title: "Goal Not Found" };
  const plan = PLAN_COPY[planId];
  if (!plan) return { title: "Plan Not Found" };

  return {
    title: `${plan.title} | ${examConfig.name} ${stageConfig.name}`,
    description: `AI-generated ${plan.title.toLowerCase()} for ${examConfig.name} ${stageConfig.name} focused on ${goalConfig.name.toLowerCase()}.`,
  };
}

export default async function GovMockBuilderPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: "en" | "hi"; exam: string; stage: string; goal: string; planId: string }>;
  searchParams: Promise<{ struggle?: string }>;
}) {
  const { lang, exam, stage, goal, planId } = await params;
  const { struggle } = await searchParams;

  const examConfig = getExamBySlug(exam);
  if (!examConfig) notFound();
  const stageConfig = getStageBySlug(examConfig, stage);
  if (!stageConfig) notFound();
  const goalConfig = getGoalBySlug(goal);
  if (!goalConfig) notFound();
  const plan = PLAN_COPY[planId];
  if (!plan) notFound();

  const launchHref = `/${lang}/tests?exam=${encodeURIComponent(examConfig.slug)}&stage=${encodeURIComponent(
    stageConfig.slug
  )}&goal=${encodeURIComponent(goalConfig.slug)}&plan=${encodeURIComponent(planId)}${
    struggle ? `&struggle=${encodeURIComponent(struggle)}` : ""
  }`;

  return (
    <BuilderLayout
      step={5}
      badge="Step 5: Launch"
      title={plan.title}
      subtitle={`AI setup for ${examConfig.name} ${stageConfig.name} aligned to ${goalConfig.name}.`}
      crumbs={[
        { label: "Mock Test Builder", href: `/${lang}/gov-exams/mock-test-builder` },
        { label: examConfig.name, href: `/${lang}/gov-exams/mock-test-builder/${examConfig.slug}` },
        { label: stageConfig.name, href: `/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stageConfig.slug}` },
        { label: goalConfig.name, href: `/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stageConfig.slug}/${goalConfig.slug}` },
        { label: plan.title },
      ]}
      backHref={`/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stageConfig.slug}/${goalConfig.slug}`}
      backLabel="Back to Plans"
    >
      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {struggle ? (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              <span className="text-sm font-medium text-violet-900">
                Focused: <span className="font-semibold">{struggle.replace(/-/g, " ")}</span>
              </span>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Your Plan</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.bullets.map((bullet, idx) => (
              <span key={bullet} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-600">{idx + 1}</span>
                {bullet}
              </span>
            ))}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected Options</h3>
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs text-slate-500">Exam</span>
                <span className="text-sm font-semibold text-slate-900">{examConfig.name}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs text-slate-500">Stage</span>
                <span className="text-sm font-semibold text-slate-900">{stageConfig.name}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-xs text-slate-500">Goal</span>
                <span className="text-sm font-semibold text-slate-900">{goalConfig.name}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                <span className="text-xs text-blue-500">Questions</span>
                <span className="text-sm font-bold text-blue-700">{stageConfig.questionCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                <span className="text-xs text-emerald-500">Duration</span>
                <span className="text-sm font-bold text-emerald-700">{stageConfig.durationMinutes} min</span>
              </div>
            </div>
          </div>
          <Link
            href={`/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stageConfig.slug}/${goalConfig.slug}`}
            className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            ← Change Plan
          </Link>
        </aside>
      </div>

      <div className="mt-4">
        <PromptComposerCard
          lang={lang}
          examSlug={examConfig.slug}
          examName={examConfig.name}
          stageSlug={stageConfig.slug}
          stageName={stageConfig.name}
          goalSlug={goalConfig.slug}
          goalName={goalConfig.name}
          planId={planId}
          planName={plan.title}
          struggleFocus={struggle ? struggle.replace(/-/g, " ") : undefined}
          struggleSlug={struggle}
          durationMinutes={stageConfig.durationMinutes}
          questionCount={stageConfig.questionCount}
          changePlanHref={`/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stageConfig.slug}/${goalConfig.slug}`}
          legacyLaunchHref={launchHref}
        />
      </div>
    </BuilderLayout>
  );
}
