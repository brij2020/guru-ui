"use client";

import Link from "next/link";
import Image from "next/image";

type Lang = "en" | "hi";

type FooterProps = {
  dict?: unknown;
  lang: Lang;
};

export default function Footer({ lang }: FooterProps) {
  const staticLinks = [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ];

  return (
    <footer className="bg-[var(--section-bg-1)] border-t border-[var(--section-border)] text-[var(--section-text)] px-8 md:px-36 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href={`/${lang}`}>
          <Image
            src="/branding/test-guru-seo-logo.svg"
            alt="Test Guru logo - online mock test platform"
            width={160}
            height={40}
            className="h-auto rounded-xl"
            unoptimized
            loading="eager"
            fetchPriority="high"
            sizes="160px"
          />
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          {staticLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className="hover:text-[var(--section-primary)] transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
