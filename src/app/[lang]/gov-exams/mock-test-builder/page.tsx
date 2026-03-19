import type { Metadata } from "next";
import Link from "next/link";
import { GOV_EXAMS, getBuilderCopy } from "@/lib/mockTestBuilder";
import BuilderLayout from "@/components/govMockBuilder/BuilderLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: "en" | "hi" }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isHindi = lang === "hi";

  return {
    title: isHindi
      ? "Government Mock Test Builder | English + Hindi"
      : "Government Mock Test Builder | English + Hindi",
    description: isHindi
      ? "Choose exam, stage, and goal to build your personalized government exam mock test."
      : "Choose exam, stage, and goal to build your personalized government exam mock test.",
  };
}

export default async function GovMockBuilderHome({
  params,
}: {
  params: Promise<{ lang: "en" | "hi" }>;
}) {
  const { lang } = await params;
  const copy = getBuilderCopy(lang);

  return (
    <BuilderLayout
      step={1}
      badge={copy.examStepLabel}
      title={copy.introTitle}
      subtitle={copy.introDescription}
      crumbs={[{ label: "Mock Test Builder" }]}
      backHref={`/${lang}`}
      backLabel="Back to Home"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {GOV_EXAMS.map((exam) => (
          <Link
            key={exam.slug}
            href={`/${lang}/gov-exams/mock-test-builder/${exam.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
          >
            <div className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">Government Exam</div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{exam.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{exam.description}</p>
            <p className="mt-4 text-sm font-semibold text-blue-700 group-hover:text-blue-800">{copy.ctaStart} →</p>
          </Link>
        ))}
      </div>
    </BuilderLayout>
  );
}
