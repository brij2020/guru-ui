"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Lang = "en" | "hi";

interface GovHeroSliderProps {
  lang: Lang;
}

const slides = [
  {
    src: "/images/gov-slide-1-exams.svg",
    alt: "Government exam mock tests for SSC Banking UPSC and Railway aspirants",
    title: "Gov Exam Mock Tests",
    subtitle: "SSC • Banking • UPSC • Railway • PSC",
  },
  {
    src: "/images/gov-slide-2-rank.svg",
    alt: "Rank percentile and weak topic analysis for government exam preparation",
    title: "Rank & Percentile Insights",
    subtitle: "Track standing, speed, and weak topics",
  },
  {
    src: "/images/gov-slide-3-sip.svg",
    alt: "Daily and weekly SIP plan for government exam aspirants",
    title: "Daily & Weekly SIP Plans",
    subtitle: "Consistency plan for higher score and rank",
  },
];

export default function GovHeroSlider({ lang }: GovHeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <div className="relative w-full h-[360px] md:h-[420px] overflow-hidden rounded-3xl border border-[var(--section-border)] bg-white">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-500 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={index === 0}
              className="object-cover"
            />
            <div className="absolute left-4 top-4 rounded-lg bg-black/65 px-3 py-2 text-white">
              <p className="text-xs font-semibold">{slide.title}</p>
              <p className="text-[11px] text-white/85">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`${lang === "hi" ? "شريحة" : "Slide"} ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-7 bg-[var(--section-primary)]" : "w-2.5 bg-slate-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
