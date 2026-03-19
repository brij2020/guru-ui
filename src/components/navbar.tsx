"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Drawer, Dropdown, MenuProps, Input } from "antd";
import {
  MenuOutlined,
  SearchOutlined,
  CloseOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/apiConfig";
import { buildGovExamId } from "@/utils/govExamId";

type Lang = "en" | "hi";

interface NavBarProps {
  dict: {
    navbar: {
      categories?: string;
      searchPlaceholder: string;
    };
  };
  lang: Lang;
}

interface HierarchyNode {
  id: string | number;
  title: string;
  slug?: string;
  children?: HierarchyNode[];
}

interface ExamHierarchyResponse {
  data?: {
    tree?: HierarchyNode[];
  } | null;
}

interface ExamLeaf {
  label: string;
  exam: string;
  examNodeId?: string;
}

const FALLBACK_EXAMS: ExamLeaf[] = [
  { label: "SSC CGL", exam: "gov-ssc-cgl" },
  { label: "IBPS PO", exam: "gov-ibps-po" },
  { label: "SBI Clerk", exam: "gov-sbi-clerk" },
  { label: "UPSC Prelims", exam: "gov-upsc-cse" },
  { label: "Railway NTPC", exam: "gov-rrb-ntpc" },
  { label: "State PSC", exam: "gov-state-psc" },
];

const flattenLeafNodes = (nodes: HierarchyNode[]): HierarchyNode[] => {
  const output: HierarchyNode[] = [];
  const walk = (list: HierarchyNode[]) => {
    list.forEach((node) => {
      if (node.children?.length) {
        walk(node.children);
      } else {
        output.push(node);
      }
    });
  };
  walk(nodes);
  return output;
};

export default function NavBar({ dict, lang }: NavBarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [examLeaves, setExamLeaves] = useState<ExamLeaf[]>(FALLBACK_EXAMS);
  const pathname = usePathname();
  const router = useRouter();
  const categoriesLabel = dict?.navbar?.categories || (lang === "hi" ? "الفئات" : "Categories");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const loadExamLeaves = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.examHierarchy.get}`);
        if (!res.ok) return;
        const data = (await res.json()) as ExamHierarchyResponse;
        const tree = data?.data?.tree;
        if (!Array.isArray(tree) || tree.length === 0) return;
        const leaves = flattenLeafNodes(tree)
          .map((node) => ({
            label: node.title,
            exam: node.slug || buildGovExamId(node.title),
            examNodeId: String(node.id),
          }))
          .filter((item) => item.label && item.exam)
          .slice(0, 30);
        if (leaves.length > 0) {
          setExamLeaves(leaves);
        }
      } catch {
        // Keep fallback exams if API read fails.
      }
    };
    void loadExamLeaves();
  }, []);

  const govExamItems: MenuProps["items"] = useMemo(
    () =>
      examLeaves.slice(0, 10).map((item) => ({
        key: item.examNodeId ? `${item.exam}:${item.examNodeId}` : item.exam,
        label: (
          <Link
            href={`/${lang}/tests?exam=${item.exam}${item.examNodeId ? `&examNodeId=${encodeURIComponent(item.examNodeId)}` : ""}`}
          >
            {item.label}
          </Link>
        ),
      })),
    [examLeaves, lang]
  );

  const primaryLinks = [
    { key: "home", label: lang === "hi" ? "الرئيسية" : "Home", href: `/${lang}` },
    { key: "gov-tests", label: lang === "hi" ? "اختبارات حكومية" : "Govt Exams", href: `/${lang}/tests?track=gov` },
    { key: "sip", label: lang === "hi" ? "SIP" : "SIP Plans", href: `/${lang}/tests?plan=sip-gov-aspirants` },
    { key: "news", label: lang === "hi" ? "الأخبار التعليمية" : "Edu News", href: `/${lang}#education-news` },
    { key: "resources", label: lang === "hi" ? "الموارد" : "Resources", href: `/${lang}#resources` },
  ];

  const mobileMenuItems = [
    ...primaryLinks,
    { key: "all-tests", label: lang === "hi" ? "كل الاختبارات" : "All Mock Tests", href: `/${lang}/tests` },
  ];

  const searchSuggestions = examLeaves;

  const filteredSuggestions = searchQuery.trim()
    ? searchSuggestions
        .filter((item) => item.label.toLowerCase().includes(searchQuery.trim().toLowerCase()))
        .slice(0, 5)
    : searchSuggestions.slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    const matchedExam = searchSuggestions.find(
      (item) => item.label.toLowerCase() === trimmedQuery.toLowerCase()
    );
    if (matchedExam) {
      router.push(
        `/${lang}/tests?exam=${matchedExam.exam}${matchedExam.examNodeId ? `&examNodeId=${encodeURIComponent(matchedExam.examNodeId)}` : ""}`
      );
      setShowSuggestions(false);
      return;
    }
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("q", trimmedQuery);
    router.push(`/${lang}/tests${params.toString() ? `?${params.toString()}` : ""}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (label: string, exam: string, examNodeId?: string) => {
    setSearchQuery(label);
    setShowSuggestions(false);
    router.push(`/${lang}/tests?exam=${exam}${examNodeId ? `&examNodeId=${encodeURIComponent(examNodeId)}` : ""}`);
  };

  const isActive = (href: string) => {
    const [pathOnly] = href.split("?");
    const normalized = pathOnly.split("#")[0];
    return pathname === normalized || pathname.startsWith(`${normalized}/`);
  };

  return (
    <>
      <nav className="shadow-md py-2 px-4 z-50 bg-white/95 backdrop-blur sticky top-0 border-b border-[var(--section-border)]" aria-label="Primary">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSidebar}
              className="md:hidden flex items-center justify-center p-2"
              aria-label="Open menu"
              aria-expanded={isSidebarOpen}
              aria-controls="mobile-main-menu"
            >
              <MenuOutlined className="text-lg" />
            </button>

            <Link href={`/${lang}`} aria-label="Go to homepage">
              <Image
                src="/branding/test-guru-seo-logo.svg"
                alt="Test Guru logo - online mock test platform"
                width={170}
                height={40}
                className="w-32 h-auto md:w-44 rounded-xl"
                priority
                unoptimized
                sizes="(min-width: 768px) 176px, 128px"
              />
            </Link>
          </div>

          <ul className="hidden lg:flex items-center gap-5" aria-label="Primary site links">
            {primaryLinks.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.href) ? "text-[var(--section-primary)]" : "text-gray-700 hover:text-[var(--section-primary)]"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Dropdown menu={{ items: govExamItems }} placement="bottomLeft" trigger={["hover", "click"]}>
                <button
                  type="button"
                  className="px-2 py-1 flex items-center text-sm font-medium text-gray-700 hover:text-[var(--section-primary)] transition-colors"
                  aria-label="Browse government exam categories"
                >
                  {categoriesLabel} <DownOutlined className="ml-1" />
                </button>
              </Dropdown>
            </li>
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 lg:flex-none lg:w-[390px]" role="search" aria-label="Site search">
              <label htmlFor="site-search" className="sr-only">Search mock tests and courses</label>
              <div className="relative flex-1">
                <Input
                  id="site-search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  placeholder={dict.navbar.searchPlaceholder || (lang === "hi" ? "ابحث عن اختبار" : "Search tests")}
                  prefix={<SearchOutlined />}
                  className="rounded-md"
                  allowClear
                />
                {showSuggestions && (
                  <div className="absolute top-[44px] z-[70] w-full rounded-lg border border-[var(--section-border)] bg-white shadow-lg overflow-hidden">
                    {filteredSuggestions.map((item) => (
                      <button
                        key={item.examNodeId ? `${item.exam}:${item.examNodeId}` : item.exam}
                        type="button"
                        onClick={() => handleSuggestionClick(item.label, item.exam, item.examNodeId)}
                        className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="rounded-md border border-[var(--section-border)] bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-[var(--section-primary)] hover:text-[var(--section-primary)]"
              >
                {lang === "hi" ? "بحث" : "Search"}
              </button>
            </form>
            <Link
              href={`/${lang}/auth/login`}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--section-primary)] text-[var(--section-primary)] font-semibold px-4 py-2.5 text-sm hover:bg-[var(--section-primary)] hover:text-white"
            >
              {lang === "hi" ? "تسجيل الدخول" : "Login"}
            </Link>
            <Link
              href={`/${lang}/auth/signUp`}
              className="inline-flex items-center justify-center rounded-lg bg-[var(--section-primary)] text-white font-semibold px-4 py-2.5 text-sm"
            >
              {lang === "hi" ? "اشترك مجانًا" : "Sign Up Free"}
            </Link>
          </div>
        </div>
      </nav>

      <Drawer
        title="Main Menu"
        placement="left"
        onClose={toggleSidebar}
        open={isSidebarOpen}
        width={280}
        closeIcon={<CloseOutlined />}
        className="md:hidden"
      >
        <form onSubmit={handleSearchSubmit} className="mb-6" role="search" aria-label="Mobile site search">
          <label htmlFor="mobile-site-search" className="sr-only">Search tests</label>
          <div className="flex items-center gap-2">
            <Input
              id="mobile-site-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.navbar.searchPlaceholder || (lang === "hi" ? "ابحث عن اختبار" : "Search tests")}
              prefix={<SearchOutlined />}
              className="rounded-md"
              allowClear
            />
            <button
              type="submit"
              className="rounded-md bg-[var(--section-primary)] text-white text-sm font-semibold px-3 py-2"
            >
              {lang === "hi" ? "بحث" : "Go"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {searchSuggestions.slice(0, 3).map((item) => (
              <button
                key={item.exam}
                type="button"
                onClick={() => handleSuggestionClick(item.label, item.exam)}
                className="rounded-full border border-[var(--section-border)] px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        </form>
        <ul id="mobile-main-menu" className="space-y-4">
          {mobileMenuItems.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={toggleSidebar}
                className="block text-gray-700 text-lg font-medium hover:text-[var(--section-primary)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-7 border-t border-[var(--section-border)] pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            {lang === "hi" ? "الاختبارات الحكومية الشائعة" : "Popular Govt Exams"}
          </p>
          <ul className="space-y-2">
            {govExamItems.map((item) => (
              <li key={String(item?.key)}>
                {item?.label}
              </li>
            ))}
          </ul>
        </div>
      </Drawer>
    </>
  );
}
