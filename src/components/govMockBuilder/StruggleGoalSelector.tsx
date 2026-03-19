"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { GoalConfig, StruggleArea } from "@/lib/mockTestBuilder";

type StruggleGoalSelectorProps = {
  lang: "en" | "hi";
  examSlug: string;
  stageSlug: string;
  goals: GoalConfig[];
  struggles: StruggleArea[];
};

export default function StruggleGoalSelector({
  lang,
  examSlug,
  stageSlug,
  goals,
  struggles,
}: StruggleGoalSelectorProps) {
  const [selectedStruggle, setSelectedStruggle] = useState<string>(struggles[0]?.slug ?? "time-management");

  const selectedMeta = useMemo(
    () => struggles.find((item) => item.slug === selectedStruggle),
    [selectedStruggle, struggles]
  );

  const sortedGoals = useMemo(() => {
    if (!selectedMeta) return goals;
    return [...goals].sort((a, b) => {
      const aRank = a.slug === selectedMeta.recommendedGoal ? 0 : 1;
      const bRank = b.slug === selectedMeta.recommendedGoal ? 0 : 1;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });
  }, [goals, selectedMeta]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Retention Step</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Where do you struggle the most?</h2>
        <p className="mt-1 text-sm text-slate-600">Pick one to personalize your plan and improve score faster.</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {struggles.map((area) => {
            const active = area.slug === selectedStruggle;
            return (
              <button
                key={area.slug}
                type="button"
                onClick={() => setSelectedStruggle(area.slug)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-blue-300"
                }`}
              >
                {area.label}
              </button>
            );
          })}
        </div>

        {selectedMeta ? (
          <div className="mt-3 grid gap-3 rounded-lg bg-white px-3 py-3 text-sm text-slate-700 md:grid-cols-[1.7fr,1fr]">
            <p>
              {selectedMeta.hint} Recommended:{" "}
              <span className="font-semibold">
                {goals.find((g) => g.slug === selectedMeta.recommendedGoal)?.name ?? "Personalized Goal"}
              </span>
            </p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              <p className="font-semibold uppercase tracking-wide">Why this helps</p>
              <p className="mt-1">This recommendation optimizes both confidence and score stability for your next attempt.</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sortedGoals.map((goal) => {
          const isRecommended = selectedMeta?.recommendedGoal === goal.slug;
          return (
            <Link
              key={goal.slug}
              href={`/${lang}/gov-exams/mock-test-builder/${examSlug}/${stageSlug}/${goal.slug}?struggle=${encodeURIComponent(selectedStruggle)}`}
              className={`group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isRecommended ? "border-emerald-300 ring-2 ring-emerald-100 hover:border-emerald-400" : "border-slate-200 hover:border-blue-400"
              }`}
            >
              {isRecommended ? (
                <p className="mb-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                  Recommended For You
                </p>
              ) : null}
              <h3 className="text-lg font-semibold text-slate-900">{goal.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{goal.summary}</p>
              <p className="mt-3 rounded-lg bg-slate-100 px-2.5 py-2 text-xs font-medium text-slate-700">
                Recommended mix: {goal.recommendedMix}
              </p>
              <p className={`mt-4 text-sm font-semibold ${isRecommended ? "text-emerald-700 group-hover:text-emerald-800" : "text-blue-700 group-hover:text-blue-800"}`}>
                {isRecommended ? "Use Recommended Goal →" : "Choose Goal →"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
