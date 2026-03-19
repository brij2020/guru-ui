const GOV_ID_RULES: Array<{ pattern: RegExp; id: string }> = [
  { pattern: /\bssc\s*cgl\b/i, id: "gov-ssc-cgl" },
  { pattern: /\bssc\s*chsl\b/i, id: "gov-ssc-chsl" },
  { pattern: /\bibps\s*po\b/i, id: "gov-ibps-po" },
  { pattern: /\bsbi\s*clerk\b/i, id: "gov-sbi-clerk" },
  { pattern: /\b(upsc|civil services)\b/i, id: "gov-upsc-cse" },
  { pattern: /\b(rrb|railway).*\bntpc\b/i, id: "gov-rrb-ntpc" },
  { pattern: /\bstate\b.*\bpsc\b/i, id: "gov-state-psc" },
];

const GOV_STOPWORDS = new Set([
  "exam",
  "exams",
  "examination",
  "examinations",
  "test",
  "tests",
  "recruitment",
  "government",
  "govt",
  "for",
  "and",
]);

export const buildGovExamId = (title: string) => {
  const trimmed = title.trim();
  if (!trimmed) return "gov-exam";

  for (const rule of GOV_ID_RULES) {
    if (rule.pattern.test(trimmed)) {
      return rule.id;
    }
  }

  const words = trimmed
    .toLowerCase()
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !GOV_STOPWORDS.has(word));

  const base = words.join("-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  if (!base) return "gov-exam";
  return base.startsWith("gov-") ? base : `gov-${base}`;
};
