import Link from "next/link";
import type { ReactNode } from "react";

type BuilderCrumb = {
  label: string;
  href?: string;
};

type BuilderLayoutProps = {
  badge?: string;
  title: string;
  subtitle: string;
  step: 1 | 2 | 3 | 4 | 5;
  crumbs: BuilderCrumb[];
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

const STEPS = ["Exam", "Stage", "Goal", "Plan", "Launch"];
const STEP_ICONS = ["1", "2", "3", "4", "5"];

const getStepLabel = (stepNumber: number) => {
  if (stepNumber === 1) return "Exam";
  if (stepNumber === 2) return "Stage";
  if (stepNumber === 3) return "Goal";
  if (stepNumber === 4) return "Plan";
  return "Launch";
};

export default function BuilderLayout({
  badge,
  title,
  subtitle,
  step,
  crumbs,
  backHref,
  backLabel = "Back",
  children,
}: BuilderLayoutProps) {
  const resolvedBackHref =
    backHref ||
    [...crumbs]
      .reverse()
      .find((crumb, index) => index > 0 && crumb.href)?.href;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dbeafe_0%,_#f8fafc_45%)] px-5 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-200/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-emerald-200/20 blur-2xl" />
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {crumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
                {index > 0 ? <span>/</span> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="rounded-md px-2 py-1 transition hover:bg-slate-100 hover:text-blue-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {resolvedBackHref ? (
            <div className="mb-3">
              <Link
                href={resolvedBackHref}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                ← {backLabel}
              </Link>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-[1.8fr,1fr] md:items-start">
            <div>
              {badge ? (
                <p className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {badge}
                </p>
              ) : null}
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
              <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>
            </div>
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Journey Status</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Step {step} of 5 completed</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">Progress saves in URL so learners can continue seamlessly.</p>
            </aside>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-5">
            {STEPS.map((stepLabel, idx) => {
              const current = idx + 1;
              const active = step === current;
              const complete = step > current;

              return (
                <div
                  key={stepLabel}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    active
                      ? "border-blue-300 bg-blue-50 text-blue-800 shadow-sm"
                      : complete
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                        active
                          ? "bg-blue-600 text-white"
                          : complete
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {STEP_ICONS[idx]}
                    </span>
                    Step {current}
                  </p>
                  <p className="font-semibold">{stepLabel}</p>
                </div>
              );
            })}
          </div>
        </div>

        <section className="mt-6">{children}</section>
      </div>
    </main>
  );
}
