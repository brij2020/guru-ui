"use client";

import {
  BookOpen,
  BarChart3,
  Hash,
  Network,
  Layers,
  LibraryBig,
  ListChecks,
  Target,
  GraduationCap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ManageKey =
  | "category"
  | "topics"
  | "questionStyles"
  | "difficulty"
  | "questions"
  | "subjects"
  | "hierarchy"
  | "analytics"
  | "exams";

const manageItems: { key: ManageKey; label: string; icon: LucideIcon }[] = [
  { key: "category", label: "Category", icon: Layers },
  { key: "topics", label: "Topics", icon: LibraryBig },
  { key: "questionStyles", label: "Question Style", icon: ListChecks },
  { key: "difficulty", label: "Difficulty", icon: Target },
  { key: "questions", label: "Number of question", icon: Hash },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "exams", label: "Exams", icon: GraduationCap },
  { key: "hierarchy", label: "Hierarchy", icon: Network },
  { key: "analytics", label: "Stats", icon: BarChart3 },
];

interface ManagePanelProps {
  onSelect: (key: ManageKey) => void;
}

export default function ManagePanel({ onSelect }: ManagePanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-5 w-[320px] border border-gray-100">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Manage</h2>
      <div className="grid grid-cols-2 gap-4">
        {manageItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-50 transition group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-105 transition">
                <Icon className="text-indigo-600" size={20} />
              </div>

              <span className="text-xs mt-2 text-gray-600">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
