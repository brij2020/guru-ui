"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/apiConfig";
import { buildGovExamId } from "@/utils/govExamId";

type Lang = "en" | "hi";

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

interface PreferredExamNavigatorProps {
  lang: Lang;
}

const FALLBACK_TREE: HierarchyNode[] = [
  {
    id: 1,
    title: "Government Exams",
    children: [
      { id: 111, title: "SSC Exams" },
      { id: 112, title: "Civil Services Exam (UPSC)" },
      { id: 121, title: "Banking Exams" },
      { id: 122, title: "Insurance Exams" },
      { id: 151, title: "State Govt. Exams" },
    ],
  },
];

const flattenLeafNodes = (nodes: HierarchyNode[]): HierarchyNode[] => {
  const output: HierarchyNode[] = [];
  const walk = (list: HierarchyNode[]) => {
    list.forEach((node) => {
      if (node.children && node.children.length) {
        walk(node.children);
      } else {
        output.push(node);
      }
    });
  };
  walk(nodes);
  return output;
};

export default function PreferredExamNavigator({ lang }: PreferredExamNavigatorProps) {
  const [tree, setTree] = useState<HierarchyNode[]>(FALLBACK_TREE);
  const [selectedPath, setSelectedPath] = useState<HierarchyNode[]>([]);
  const [leafSearch, setLeafSearch] = useState("");

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.examHierarchy.get}`);
        if (!res.ok) return;
        const data = (await res.json()) as ExamHierarchyResponse;
        const apiTree = data?.data?.tree;
        if (Array.isArray(apiTree) && apiTree.length) {
          setTree(apiTree);
        }
      } catch {
        // Keep fallback tree for resilience.
      }
    };
    void loadHierarchy();
  }, []);

  const levelOptions = useMemo(() => {
    const levels: HierarchyNode[][] = [];
    let current = tree;
    levels.push(current);
    for (const node of selectedPath) {
      if (!node.children?.length) break;
      current = node.children;
      levels.push(current);
    }
    return levels;
  }, [tree, selectedPath]);

  const handleSelect = (levelIndex: number, nodeId: string) => {
    const options = levelOptions[levelIndex] || [];
    const selected = options.find((item) => String(item.id) === nodeId);
    if (!selected) return;
    const nextPath = selectedPath.slice(0, levelIndex);
    nextPath[levelIndex] = selected;
    setSelectedPath(nextPath);
  };

  const currentNode = selectedPath[selectedPath.length - 1];
  const candidateLeaves = currentNode?.children?.length
    ? flattenLeafNodes(currentNode.children)
    : currentNode
    ? [currentNode]
    : flattenLeafNodes(tree);

  const visibleLeaves = candidateLeaves.filter((item) =>
    item.title.toLowerCase().includes(leafSearch.trim().toLowerCase())
  );

  return (
    <section className="bg-[var(--section-bg-1)] px-6 md:px-12 lg:px-20 py-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--heading-color)]">
          {lang === "hi" ? "اختر امتحانك المفضل" : "Find Your Preferred Exam"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {lang === "hi"
            ? "اختر المسار خطوة بخطوة للوصول السريع للاختبار التجريبي المناسب."
            : "Navigate by hierarchy to reach the right mock test faster."}
        </p>

        <div className="mt-5 rounded-2xl border border-[var(--section-border)] bg-white p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {levelOptions.slice(0, 3).map((options, levelIndex) => (
              <div key={`level-${levelIndex}`}>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {lang === "hi" ? `المستوى ${levelIndex + 1}` : `Level ${levelIndex + 1}`}
                </label>
                <select
                  value={selectedPath[levelIndex] ? String(selectedPath[levelIndex].id) : ""}
                  onChange={(e) => handleSelect(levelIndex, e.target.value)}
                  className="w-full rounded-lg border border-[var(--section-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--section-primary)]/25"
                >
                  <option value="">
                    {lang === "hi" ? "اختر" : "Select"}
                  </option>
                  {options.map((node) => (
                    <option key={String(node.id)} value={String(node.id)}>
                      {node.title}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <input
              type="text"
              value={leafSearch}
              onChange={(e) => setLeafSearch(e.target.value)}
              placeholder={lang === "hi" ? "ابحث باسم الامتحان..." : "Search exam title..."}
              className="w-full md:max-w-sm rounded-lg border border-[var(--section-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--section-primary)]/25"
            />
            <p className="text-xs text-slate-500">
              {lang === "hi"
                ? `النتائج: ${visibleLeaves.length}`
                : `Results: ${visibleLeaves.length}`}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleLeaves.map((exam) => (
              <Link
                key={String(exam.id)}
                href={`/${lang}/tests?exam=${exam.slug || buildGovExamId(exam.title)}&examNodeId=${encodeURIComponent(String(exam.id))}`}
                className="rounded-xl border border-[var(--section-border)] bg-[var(--section-bg-2)] px-4 py-4 hover:border-[var(--section-primary)] hover:shadow-sm transition"
              >
                <p className="text-sm font-bold text-[var(--heading-color)]">{exam.title}</p>
                <p className="mt-1 text-xs text-[var(--section-primary)] font-semibold">
                  {lang === "hi" ? "ابدأ الاختبار التجريبي" : "Start Mock Test"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
