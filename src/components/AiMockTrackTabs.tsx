"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import { apiClient } from "@/lib/apiClient";

type AiMockTrack = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  badge: string;
  highlights: string[];
};

export default function AiMockTrackTabs({
  tracks,
  isHindi,
  lang,
}: {
  tracks: AiMockTrack[];
  isHindi: boolean;
  lang: "en" | "hi";
}) {
  const [apiTracks, setApiTracks] = useState<AiMockTrack[]>([]);
  const [activeTrackId, setActiveTrackId] = useState(tracks[0]?.id ?? "");

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.categories.list);
        const items = Array.isArray(response.data?.data) ? response.data.data : [];

        const mapped: AiMockTrack[] = items
          .map((item: { _id?: string; name?: string; description?: string }) => {
            const id = item._id?.trim();
            const title = item.name?.trim();
            if (!id || !title) return null;

            return {
              id,
              title,
              description:
                item.description?.trim() ||
                (isHindi
                  ? "اختبارات تكيفية مع تحليل ذكي لتحسين الأداء في هذه الفئة."
                  : "Adaptive mock tests with AI analysis to improve performance in this category."),
              href: `/${lang}/tests?categoryId=${encodeURIComponent(id)}`,
              cta: isHindi ? "ابدأ الاختبار" : "Start Mock Test",
              badge: isHindi ? "فئة مخصصة" : "Category Track",
              highlights: isHindi
                ? ["اختبارات متدرجة الصعوبة", "تحليل فوري للأخطاء", "توصيات تدريب مخصصة"]
                : ["Difficulty-based test flow", "Instant mistake analysis", "Personalized improvement prompts"],
            };
          })
          .filter((track: AiMockTrack | null): track is AiMockTrack => Boolean(track));

        if (isMounted && mapped.length > 0) {
          setApiTracks(mapped);
          setActiveTrackId(mapped[0].id);
        }
      } catch {
        // Keep static fallback tracks when categories API is unavailable or unauthenticated.
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [isHindi, lang]);

  const displayTracks = useMemo(() => (apiTracks.length > 0 ? apiTracks : tracks), [apiTracks, tracks]);
  const activeTrack = displayTracks.find((track) => track.id === activeTrackId) ?? displayTracks[0];

  if (!activeTrack) return null;

  return (
    <div className="mt-6">
      <div
        className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-[var(--section-border)] bg-white p-2 md:w-auto"
        role="tablist"
        aria-label={isHindi ? "فئات الاختبارات" : "Mock test categories"}
      >
        {displayTracks.map((track) => {
          const isActive = track.id === activeTrack.id;
          return (
            <button
              key={track.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`track-panel-${track.id}`}
              onClick={() => setActiveTrackId(track.id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-[var(--section-primary)] text-white"
                  : "bg-transparent text-[var(--heading-color)] hover:bg-[var(--section-bg-2)]"
              }`}
            >
              {track.title}
            </button>
          );
        })}
      </div>

      <article
        id={`track-panel-${activeTrack.id}`}
        role="tabpanel"
        className="mt-4 rounded-2xl border border-[var(--section-border)] bg-white p-6 shadow-[0_10px_30px_rgba(0,115,230,0.08)]"
      >
        <p className="inline-flex rounded-full bg-[var(--section-bg-2)] px-3 py-1 text-xs font-semibold text-[var(--section-primary)]">
          {activeTrack.badge}
        </p>
        <h3 className="mt-3 text-xl font-bold text-[var(--heading-color)]">{activeTrack.title}</h3>
        <p className="mt-2 text-sm md:text-base text-gray-600">{activeTrack.description}</p>
        <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          {activeTrack.highlights.map((point) => (
            <li key={point}>• {point}</li>
          ))}
        </ul>
        <Link
          href={activeTrack.href}
          className="mt-5 inline-flex items-center rounded-lg bg-[var(--section-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95"
        >
          {activeTrack.cta}
        </Link>
      </article>
    </div>
  );
}
