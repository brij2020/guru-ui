import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBuilderCopy, getExamBySlug } from "@/lib/mockTestBuilder";
import BuilderLayout from "@/components/govMockBuilder/BuilderLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: "en" | "hi"; exam: string }>;
}): Promise<Metadata> {
  const { exam } = await params;
  const examConfig = getExamBySlug(exam);

  if (!examConfig) {
    return { title: "Exam Not Found" };
  }

  return {
    title: `${examConfig.name} Mock Test Builder`,
    description: `Choose your ${examConfig.name} exam stage and generate a personalized mock test setup.`,
  };
}

export default async function GovMockBuilderExamPage({
  params,
}: {
  params: Promise<{ lang: "en" | "hi"; exam: string }>;
}) {
  const { lang, exam } = await params;
  const copy = getBuilderCopy(lang);
  const examConfig = getExamBySlug(exam);

  if (!examConfig) notFound();

  return (
    <BuilderLayout
      step={2}
      badge={copy.stageStepLabel}
      title={examConfig.name}
      subtitle={examConfig.description}
      crumbs={[
        { label: "Mock Test Builder", href: `/${lang}/gov-exams/mock-test-builder` },
        { label: examConfig.name },
      ]}
      backHref={`/${lang}/gov-exams/mock-test-builder`}
      backLabel="Back to Exams"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {examConfig.stages.map((stage) => (
          <Link
            key={stage.slug}
            href={`/${lang}/gov-exams/mock-test-builder/${examConfig.slug}/${stage.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">{stage.name}</h2>
            <div className="mt-3 flex gap-2 text-xs font-medium">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{stage.questionCount} Questions</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{stage.durationMinutes} Minutes</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-blue-700 group-hover:text-blue-800">Choose Stage →</p>
          </Link>
        ))}
      </div>
    </BuilderLayout>
  );
}
