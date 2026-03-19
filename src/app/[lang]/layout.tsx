import type { Metadata } from "next";
import { getDictionary } from "./dictionaries";
import AppLayoutClient from "@/components/AppLayoutClient";
import "../global.css";

export const metadata: Metadata = {
  title: "Test Guru - Online Mock Test Platform",
  description: "Practice online mock tests, track progress, and prepare smarter with Test Guru.",
  icons: {
    icon: "/branding/test-guru-mark.svg",
    shortcut: "/branding/test-guru-mark.svg",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", url: "/branding/test-guru-mark.svg", sizes: "32x32" },
      { rel: "icon", url: "/branding/test-guru-mark.svg", sizes: "192x192" },
    ],
  },
};

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "hi" }];
}

// 1. Define Props with params as a Promise
interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>; // Use string for broader compatibility
}

export default async function LangLayout({ children, params }: Props) {
  // 2. Await the params Promise
  const { lang } = await params;
  // 3. Narrow down the type after awaiting
  const validLang = lang === "hi" ? "hi" : "en";
  const dict = await getDictionary(validLang);

  return (
    <AppLayoutClient dict={dict} lang={validLang}>
      {children}
    </AppLayoutClient>
  );
}
