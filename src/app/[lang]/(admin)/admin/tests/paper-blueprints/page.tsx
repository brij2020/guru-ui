"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Input, InputNumber, Row, Select, Slider, Space, Table, Tag, Typography, message, Divider, Checkbox, Modal, Progress } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, ReloadOutlined, SaveOutlined, DeleteOutlined, ThunderboltOutlined, AppstoreOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";

const { Title, Text } = Typography;

type ExamStage = {
  slug: string;
  name: string;
  durationMinutes?: number;
  questionCount?: number;
};

type ExamItem = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  stages: ExamStage[];
  isActive?: boolean;
};

type StageOption = { slug: string; name: string };

type SectionTopic = {
  key: string;
  label: string;
  selected: boolean;
  isCustom?: boolean;
};

type CustomTopic = {
  key: string;
  label: string;
};

type SectionRow = {
  key: string;
  label: string;
  count: number;
  topics: string[];
};

type DifficultyMix = {
  easy: number;
  medium: number;
  hard: number;
};

type LearningMode = "foundation" | "intermediate" | "advanced" | "expert";

const DEFAULT_DIFFICULTY_MIX: DifficultyMix = { easy: 0.5, medium: 0.35, hard: 0.15 };

const LEARNING_MODES: { value: LearningMode; label: string; description: string; difficultyMix: DifficultyMix }[] = [
  { value: "foundation", label: "Foundation", description: "Easy questions, building basics", difficultyMix: { easy: 0.5, medium: 0.35, hard: 0.15 } },
  { value: "intermediate", label: "Intermediate", description: "Mix of easy and medium difficulty", difficultyMix: { easy: 0.2, medium: 0.6, hard: 0.2 } },
  { value: "advanced", label: "Advanced", description: "Medium and hard questions", difficultyMix: { easy: 0.1, medium: 0.4, hard: 0.5 } },
  { value: "expert", label: "Expert", description: "Challenging questions for experts", difficultyMix: { easy: 0.05, medium: 0.25, hard: 0.7 } },
];

const SECTION_TEMPLATES: Record<string, Array<{ key: string; label: string; count: number; topics: string[] }>> = {
  // ==================== SSC CGL ====================
  "ssc-cgl:tier-1": [
    { key: "general-intelligence-reasoning", label: "General Intelligence & Reasoning", count: 25, topics: ["analogy", "classification", "series", "coding-decoding", "blood-relation", "direction", "order-ranking", "mirror-images", "venn-diagram", "syllogism", "inequality", "decision-making", "critical-reasoning", "odd-one-out", "matrix", "word-formation"] },
    { key: "english-comprehension", label: "English Comprehension", count: 25, topics: ["error-detection", "fill-in-the-blanks", "synonym", "antonym", "sentence-improvement", "reading-comprehension", "idioms-phrases", "one-word-substitution", "spelling-test", "sentence-rearrangement", "closet-test", "vocabulary", "grammar", "voice", "narration"] },
    { key: "quantitative-aptitude", label: "Quantitative Aptitude", count: 25, topics: ["percentage", "ratio", "average", "profit-loss", "time-work", "simplification", "quadratic-equations", "number-series", "mensuration", "geometry", "trigonometry", "algebra", "time-distance", "boats-streams", "mixture-alligation", "permutation-combination", "probability", "height-distance", "lcm-hcf"] },
    { key: "general-awareness", label: "General Awareness", count: 25, topics: ["history", "geography", "polity", "economics", "science", "current-affairs", "static-gk", "indian-constitution", "ancient-history", "medieval-history", "modern-history", "world-geography", "indian-geography", "physics", "chemistry", "biology", "computer-awareness", "environment-ecology"] },
  ],
  "ssc-cgl:tier-2": [
    { key: "quantitative-abilities", label: "Quantitative Abilities", count: 30, topics: ["algebra", "trigonometry", "geometry", "mensuration", "percentage", "profit-loss", "time-work", "ratio-average", "number-system", "simplification", "quadratic-equations", "data-interpretation", "pie-chart", "bar-graph", "line-graph", "tabular-data", "statistical-charts"] },
    { key: "english-language-comprehension", label: "English Language & Comprehension", count: 30, topics: ["reading-comprehension", "error-detection", "sentence-improvement", "para-jumbles", "vocabulary", "grammar", "fill-in-the-blanks", "synonym-antonym", "idioms-phrases", "one-word-substitution", "sentence-connector", " Cloze-test", "word-swap", "paragraph-completion"] },
    { key: "general-studies-finance-economics", label: "General Studies (Finance & Economics)", count: 30, topics: ["finance", "economics", "budget", "banking", "static-gk", "indian-economy", "money-market", "capital-market", "inflation", "gdp", "fiscal-policy", "monetary-policy", "banking-reforms", "economic-reforms", "international-economic-organizations"] },
    { key: "statistics", label: "Statistics", count: 30, topics: ["mean-median-mode", "correlation", "probability", "data-interpretation", "standard-deviation", "variance", "collection-data", "presentation-data", "index-numbers", "time-series-analysis"] },
  ],
  // ==================== SSC CHSL ====================
  "ssc-chsl:tier-1": [
    { key: "general-intelligence-reasoning", label: "General Intelligence & Reasoning", count: 25, topics: ["analogy", "classification", "series", "coding-decoding", "blood-relation", "direction", "order-ranking", "mirror-images", "venn-diagram", "syllogism", "inequality", "figure-counting", "paper-folding", "cube-dice", "calendar-clock"] },
    { key: "english", label: "English", count: 25, topics: ["error-detection", "fill-in-the-blanks", "synonym", "antonym", "sentence-improvement", "reading-comprehension", "idioms-phrases", "one-word-substitution", "spelling-test", "para-jumbles", "vocabulary", "grammar", "voice", "narration", "article"] },
    { key: "quantitative-aptitude", label: "Quantitative Aptitude", count: 25, topics: ["percentage", "ratio", "average", "profit-loss", "time-work", "simplification", "quadratic-equations", "number-series", "mensuration", "geometry", "algebra", "time-distance", "boats-streams", "mixture-alligation", "lcm-hcf", "simple-interest", "compound-interest"] },
    { key: "general-awareness", label: "General Awareness", count: 25, topics: ["history", "geography", "polity", "economics", "science", "current-affairs", "static-gk", "computer-awareness", "important-days", "inventors-discoveries", "sports", "awards-honours", "government-schemes", "national-international-organizations"] },
  ],
  // ==================== SSC MTS ====================
  "ssc-mts:tier-1": [
    { key: "reasoning", label: "Reasoning", count: 25, topics: ["analogy", "classification", "series", "coding-decoding", "blood-relation", "direction", "order-ranking", "mirror-images", "venn-diagram", "odd-one-out", "missing-number", "mathematical-operations"] },
    { key: "english", label: "English", count: 25, topics: ["error-detection", "fill-in-the-blanks", "synonym", "antonym", "sentence-improvement", "reading-comprehension", "idioms-phrases", "one-word-substitution", "spelling-test", "vocabulary", "grammar"] },
    { key: "numerical", label: "Numerical", count: 25, topics: ["percentage", "ratio", "average", "profit-loss", "time-work", "simplification", "number-series", "time-distance", "simple-interest", "geometry", "mensuration"] },
    { key: "general-awareness", label: "General Awareness", count: 25, topics: ["history", "geography", "polity", "science", "current-affairs", "static-gk", "computer-awareness", "important-days"] },
  ],
  // ==================== UPSC CSE ====================
  "upsc-cse:prelims": [
    { key: "general-studies-1", label: "General Studies I", count: 100, topics: ["history-ancient", "history-medieval", "history-modern", "world-history", "geography-india", "geography-world", "geography-physical", "geography-economic", "polity-indian-constitution", "polity-governance", "polity-panchayati-raj", "economy-indian", "economy-development", "science-physics", "science-chemistry", "science-biology", "environment-ecology", "environment-biodiversity", "climate-change", "disaster-management", "technology-space", "information-technology", "art-culture", "social-issues", "poverty-relief", "social-justice", "international-relations"] },
    { key: "csat", label: "CSAT", count: 80, topics: ["reading-comprehension", "logical-reasoning", "analogy", "classification", "series", "coding-decoding", "blood-relation", "direction", "order-ranking", "quantitative-aptitude", "data-interpretation", "data-sufficiency", "permutation-combination", "probability", "geometry", "algebra", "time-work", "profit-loss", "percentage", "ratio-average"] },
  ],
  "upsc-cse:mains": [
    { key: "essay", label: "Essay", count: 2, topics: ["essay-writing", "social-issues", "governance", "ethics-integrity", "economy", "technology", "environment", "international-relations", "women-empowerment", "poverty-development"] },
    { key: "general-studies-1", label: "General Studies I", count: 20, topics: ["history-modern-india", "world-history", "post-independence", "art-culture-india", "geography-india", "world-geography", "environment-ecology", "society-indian", "population-dynamics", "poverty-urbanization"] },
    { key: "general-studies-2", label: "General Studies II", count: 20, topics: ["polity-indian-constitution", "parliament", "executive", "judiciary", "federal-structure", "governance", "panchayati-raj", "social-justice", "international-relations", "indian-diplomacy", "treaties-agreements"] },
    { key: "general-studies-3", label: "General Studies III", count: 20, topics: ["economy-india", "planning-budget", "money-banking", "inflation", "agriculture-indian", "industry-policy", "infrastructure-energy", "environment-ecology", "disaster-management", "science-technology", "internal-security", "terrorism-naxalism", "cybersecurity", "space-program"] },
    { key: "general-studies-4", label: "General Studies IV", count: 20, topics: ["ethics-human-interface", "emotional-intelligence", "moral-values", "integrity", "aptitude", "public-service-values", "ethical-leadership", "corporate-governance", "probity-governance", "citizens-charters", "code-conduct"] },
  ],
  // ==================== IBPS PO ====================
  "ibps-po:prelims": [
    { key: "english-language", label: "English Language", count: 30, topics: ["reading-comprehension", "cloze-test", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "sentence-correction", "vocabulary", "grammar", "para-summary", "word-association", "connectors"] },
    { key: "quantitative-aptitude", label: "Quantitative Aptitude", count: 35, topics: ["simplification", "quadratic-equations", "number-series", "data-interpretation", "profit-loss", "time-work", "time-distance", "boats-streams", "percentage", "ratio-average", "mixture-alligation", "permutation-combination", "probability", "mensuration", "inequality"] },
    { key: "reasoning-ability", label: "Reasoning Ability", count: 35, topics: ["puzzles", "seating-arrangement", "coding-decoding", "syllogism", "blood-relations", "direction-sense", "inequality", "input-output", "logical-reasoning", "data-sufficiency", "analogy", "classification", "series", "statement-arguments", "statement-assumption"] },
  ],
  "ibps-po:mains": [
    { key: "reasoning-computer-aptitude", label: "Reasoning & Computer Aptitude", count: 45, topics: ["puzzles-box-based", "puzzles-floor-based", "puzzles-month-based", "puzzles-day-based", "seating-arrangement-circular", "seating-arrangement-linear", "coding-decoding-new-pattern", "syllogism-new-pattern", "input-output-data", "logical-reasoning-criti", "computer-fundamentals", "computer-software", "computer-hardware", "internet-networking", "ms-office", "database-management", "operating-system"] },
    { key: "english-language", label: "English Language", count: 35, topics: ["reading-comprehension", "cloze-test-new-pattern", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar", "para-summary", "connectors", "word-swapping", "sentence-completion", "text-completion"] },
    { key: "data-analysis-interpretation", label: "Data Analysis & Interpretation", count: 35, topics: ["caselet-di", "table-di", "bar-di", "pie-di", "line-di", "missing-di", "radar-di", "web-di", "di-mixed-questions", "data-comparison", "data-interpretation-advance", "quantity-based-questions"] },
    { key: "general-economy-banking-awareness", label: "General/Economy/Banking Awareness", count: 35, topics: ["banking-awareness", "banking-static", "banking-current-affairs", "economy-static", "economy-current-affairs", "finance-awareness", "government-schemes", "economic-reforms", "budget", " RBI-policy", "banking-terminology", "money-market", "capital-market", "international-financial-institutions"] },
  ],
  // ==================== IBPS Clerk ====================
  "ibps-clerk:prelims": [
    { key: "english-language", label: "English Language", count: 30, topics: ["reading-comprehension", "cloze-test", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar"] },
    { key: "numerical-ability", label: "Numerical Ability", count: 35, topics: ["simplification", "number-series", "percentage", "profit-loss", "time-work", "time-distance", "ratio-average", "quadratic-equations", "data-interpretation", "mensuration"] },
    { key: "reasoning-ability", label: "Reasoning Ability", count: 35, topics: ["puzzles", "seating-arrangement", "coding-decoding", "syllogism", "blood-relations", "direction-sense", "inequality", "input-output", "analogy", "classification"] },
  ],
  "ibps-clerk:mains": [
    { key: "reasoning-ability", label: "Reasoning Ability", count: 50, topics: ["puzzles", "seating-arrangement", "coding-decoding", "syllogism", "blood-relations", "direction-sense", "inequality", "input-output", "logical-reasoning", "data-sufficiency", "computer-awareness"] },
    { key: "english-language", label: "English Language", count: 40, topics: ["reading-comprehension", "cloze-test", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar", "para-summary"] },
    { key: "quantitative-aptitude", label: "Quantitative Aptitude", count: 50, topics: ["data-interpretation", "profit-loss", "time-work", "time-distance", "percentage", "ratio-average", "quadratic-equations", "number-series", "simplification", "mensuration", "permutation-combination", "probability"] },
    { key: "general-financial-awareness", label: "General/Financial Awareness", count: 40, topics: ["banking-awareness", "economy", "current-affairs", "government-schemes", "RBI-policy", "financial-terminology", "static-gk"] },
  ],
  // ==================== SBI PO ====================
  "sbi-po:prelims": [
    { key: "english-language", label: "English Language", count: 30, topics: ["reading-comprehension", "cloze-test", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar", "connectors", "para-summary"] },
    { key: "quantitative-aptitude", label: "Quantitative Aptitude", count: 35, topics: ["simplification", "quadratic-equations", "number-series", "data-interpretation", "profit-loss", "time-work", "time-distance", "percentage", "ratio-average", "mixture-alligation", "permutation-combination", "probability"] },
    { key: "reasoning-ability", label: "Reasoning Ability", count: 35, topics: ["puzzles", "seating-arrangement", "coding-decoding", "syllogism", "blood-relations", "direction-sense", "inequality", "input-output", "logical-reasoning", "data-sufficiency", "critical-reasoning"] },
  ],
  "sbi-po:mains": [
    { key: "reasoning-computer-aptitude", label: "Reasoning & Computer Aptitude", count: 45, topics: ["puzzles-complex", "seating-arrangement-complex", "coding-decoding", "syllogism", "input-output", "logical-reasoning", "data-sufficiency", "computer-fundamentals", "ms-office", "internet", "database", "networking", "software-hardware"] },
    { key: "data-analysis-interpretation", label: "Data Analysis & Interpretation", count: 35, topics: ["caselet-di", "table-di", "bar-di", "pie-di", "line-di", "missing-di", "data-comparison", "quantity-based", "di-logical"] },
    { key: "english-language", label: "English Language", count: 35, topics: ["reading-comprehension", "cloze-test", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar", "para-summary", "connectors"] },
    { key: "general-economy-banking-awareness", label: "General/Economy/Banking Awareness", count: 40, topics: ["banking-awareness", "economy", "current-affairs", "government-schemes", "RBI-monetary-policy", "financial-reforms", "banking-terminology", "money-market", "capital-market"] },
  ],
  // ==================== SBI Clerk ====================
  "sbi-clerk:prelims": [
    { key: "english-language", label: "English Language", count: 30, topics: ["reading-comprehension", "cloze-test", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar"] },
    { key: "numerical-ability", label: "Numerical Ability", count: 35, topics: ["simplification", "number-series", "quadratic-equations", "data-interpretation", "profit-loss", "time-work", "percentage", "ratio-average", "time-distance"] },
    { key: "reasoning-ability", label: "Reasoning Ability", count: 35, topics: ["puzzles", "seating-arrangement", "coding-decoding", "syllogism", "blood-relations", "direction-sense", "inequality", "analogy", "classification"] },
  ],
  "sbi-clerk:mains": [
    { key: "general-english", label: "General English", count: 40, topics: ["reading-comprehension", "cloze-test", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar", "para-summary"] },
    { key: "quantitative-aptitude", label: "Quantitative Aptitude", count: 50, topics: ["data-interpretation", "profit-loss", "time-work", "time-distance", "percentage", "ratio-average", "quadratic-equations", "number-series", "simplification", "mensuration", "permutation-combination", "probability"] },
    { key: "reasoning-ability-computer-aptitude", label: "Reasoning Ability & Computer Aptitude", count: 50, topics: ["puzzles", "seating-arrangement", "coding-decoding", "syllogism", "input-output", "computer-fundamentals", "ms-office", "internet", "database", "networking"] },
    { key: "general-financial-awareness", label: "General/Financial Awareness", count: 40, topics: ["banking-awareness", "economy", "current-affairs", "government-schemes", "RBI-policy", "financial-terminology"] },
  ],
  // ==================== RRB NTPC ====================
  "rrb-ntpc:cbt-1": [
    { key: "general-awareness", label: "General Awareness", count: 30, topics: ["current-affairs", "history", "geography", "polity", "economy", "science", "static-gk", "computer-awareness", "important-days", "awards", "sports", "books-authors", "government-schemes"] },
    { key: "mathematics", label: "Mathematics", count: 30, topics: ["simplification", "number-system", "percentage", "profit-loss", "time-work", "time-distance", "average", "ratio", "simple-interest", "compound-interest", "lcm-hcf", "geometry", "mensuration", "algebra", "quadratic-equations"] },
    { key: "general-intelligence-reasoning", label: "General Intelligence & Reasoning", count: 30, topics: ["analogy", "classification", "series", "coding-decoding", "direction-sense", "blood-relations", "syllogism", "venn-diagram", "mirror-images", "figure-counting", "puzzles", "seating-arrangement", "data-sufficiency"] },
  ],
  "rrb-ntpc:cbt-2": [
    { key: "general-awareness", label: "General Awareness", count: 30, topics: ["current-affairs", "history", "geography", "polity", "economy", "science", "static-gk", "computer-awareness", "computer-fundamentals", "internet", "ms-office"] },
    { key: "mathematics", label: "Mathematics", count: 30, topics: ["simplification", "number-system", "percentage", "profit-loss", "time-work", "time-distance", "average", "ratio", "mensuration", "geometry", "data-interpretation", "quadratic-equations"] },
    { key: "general-intelligence-reasoning", label: "General Intelligence & Reasoning", count: 30, topics: ["analogy", "classification", "series", "coding-decoding", "direction-sense", "blood-relations", "syllogism", "puzzles", "seating-arrangement", "inequality", "input-output", "logical-reasoning"] },
  ],
  // ==================== RRB Group D ====================
  "rrb-group-d: CBT": [
    { key: "general-awareness", label: "General Awareness", count: 25, topics: ["current-affairs", "history", "geography", "polity", "economy", "science", "static-gk", "computer-awareness", "railway-awareness"] },
    { key: "mathematics", label: "Mathematics", count: 25, topics: ["simplification", "number-system", "percentage", "profit-loss", "time-work", "time-distance", "average", "ratio", "simple-interest", "mensuration"] },
    { key: "general-intelligence-reasoning", label: "General Intelligence & Reasoning", count: 25, topics: ["analogy", "classification", "series", "coding-decoding", "direction-sense", "blood-relations", "venn-diagram", "figure-counting"] },
    { key: "general-science", label: "General Science", count: 25, topics: ["physics", "chemistry", "biology", "environment", "scientific-method", "inventions-discoveries"] },
  ],
  // ==================== BPSC TRE 4 ====================
  "bpsc-tre-4:main": [
    { key: "general-studies", label: "General Studies", count: 40, topics: ["history-bihar", "history-india", "geography-bihar", "geography-india", "polity-india", "economy-india", "science-physics", "science-chemistry", "science-biology", "current-affairs-bihar", "static-gk", "environment", "information-technology"] },
    { key: "hindi", label: "Hindi", count: 30, topics: ["hindi-grammar", "hindi-vocabulary", "hindi-comprehension", "fill-in-blanks", "error-detection", "sentence-improvement", "synonym-antonym", "idioms-phrases"] },
    { key: "mathematics", label: "Mathematics", count: 40, topics: ["number-system", "percentage", "profit-loss", "time-work", "time-distance", "ratio-proportion", "average", "simplification", "mensuration", "geometry", "algebra", "data-interpretation"] },
    { key: "reasoning", label: "Reasoning & General Intelligence", count: 40, topics: ["analogy", "classification", "series", "coding-decoding", "blood-relation", "direction-sense", "syllogism", "inequality", "puzzles", "seating-arrangement", "venn-diagram", "mirror-images", "figure-counting"] },
  ],
  // ==================== LIC AAO ====================
  "lic-aao:prelims": [
    { key: "reasoning-ability", label: "Reasoning Ability", count: 35, topics: ["puzzles", "seating-arrangement", "coding-decoding", "syllogism", "blood-relations", "direction-sense", "inequality", "input-output", "logical-reasoning"] },
    { key: "quantitative-aptitude", label: "Quantitative Aptitude", count: 35, topics: ["simplification", "quadratic-equations", "number-series", "data-interpretation", "profit-loss", "time-work", "percentage", "ratio-average", "mensuration"] },
    { key: "english-language", label: "English Language", count: 30, topics: ["reading-comprehension", "cloze-test", "fill-in-blanks", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar"] },
  ],
  "lic-aao:mains": [
    { key: "reasoning-ability", label: "Reasoning Ability", count: 40, topics: ["puzzles", "seating-arrangement", "coding-decoding", "syllogism", "input-output", "logical-reasoning", "data-sufficiency", "computer-awareness"] },
    { key: "quantitative-aptitude", label: "Quantitative Aptitude", count: 40, topics: ["data-interpretation", "profit-loss", "time-work", "percentage", "ratio-average", "quadratic-equations", "number-series", "mensuration", "permutation-combination", "probability"] },
    { key: "english-language", label: "English Language", count: 30, topics: ["reading-comprehension", "cloze-test", "error-detection", "para-jumbles", "sentence-improvement", "vocabulary", "grammar", "para-summary"] },
    { key: "general-awareness", label: "General Awareness", count: 30, topics: ["banking-awareness", "economy", "current-affairs", "insurance-awareness", "government-schemes", "static-gk"] },
  ],
  // ==================== State PSC ====================
  "state-psc:prelims": [
    { key: "general-studies", label: "General Studies", count: 100, topics: ["history", "geography", "polity", "economy", "science", "current-affairs", "static-gk", "art-culture", "environment", "computer-awareness", "state-specific-gk"] },
    { key: "aptitude", label: "Aptitude", count: 30, topics: ["reasoning", "quantitative-aptitude", "english", "data-interpretation"] },
  ],
  "state-psc:mains": [
    { key: "general-studies-1", label: "General Studies I", count: 30, topics: ["history", "geography", "society", "governance", "art-culture", "environment"] },
    { key: "general-studies-2", label: "General Studies II", count: 30, topics: ["polity", "governance", "international-relations", "social-justice", "constitution"] },
    { key: "language-paper", label: "Language Paper", count: 30, topics: ["essay", "grammar", "translation", "comprehension", "precis-writing"] },
  ],
  // ==================== UPSC NDA ====================
  "nda:cbt": [
    { key: "mathematics", label: "Mathematics", count: 120, topics: ["algebra", "trigonometry", "geometry", "mensuration", "statistics", "probability", "matrix-determinants", "coordinate-geometry", "differential-calculus", "integral-calculus", "vector-algebra"] },
    { key: "general-ability", label: "General Ability", count: 150, topics: ["physics", "chemistry", "biology", "history", "geography", "polity", "economy", "current-affairs", "static-gk", "english"] },
  ],
  // ==================== CDS ====================
  "cds:written": [
    { key: "english", label: "English", count: 100, topics: ["reading-comprehension", "grammar", "vocabulary", "para-jumbles", "error-detection", "sentence-improvement", "synonym-antonym", "idioms-phrases"] },
    { key: "general-knowledge", label: "General Knowledge", count: 120, topics: ["history", "geography", "polity", "economy", "science", "current-affairs", "static-gk"] },
    { key: "elementary-mathematics", label: "Elementary Mathematics", count: 100, topics: ["algebra", "trigonometry", "geometry", "mensuration", "number-system", "percentage", "profit-loss", "time-work", "time-distance", "simple-interest"] },
  ],
  // ==================== AFCAT ====================
  "afcat:cbt": [
    { key: "english", label: "English", count: 25, topics: ["reading-comprehension", "cloze-test", "error-detection", "vocabulary", "grammar", "para-jumbles"] },
    { key: "general-awareness", label: "General Awareness", count: 25, topics: ["history", "geography", "polity", "economy", "science", "current-affairs", "defence-awareness"] },
    { key: "numerical-aptitude", label: "Numerical Aptitude", count: 15, topics: ["percentage", "profit-loss", "time-work", "time-distance", "average", "ratio", "simplification", "data-interpretation"] },
    { key: "reasoning-military", label: "Reasoning & Military Aptitude", count: 35, topics: ["analogy", "classification", "series", "coding-decoding", "blood-relations", "direction", "spatial-ability", "figure-odd-one", "mirror-images", "hidden-figures"] },
  ],
};

const AVAILABLE_TOPICS = [
  { key: "analogy", label: "Analogy" },
  { key: "classification", label: "Classification" },
  { key: "series", label: "Series" },
  { key: "coding-decoding", label: "Coding Decoding" },
  { key: "blood-relation", label: "Blood Relations" },
  { key: "direction", label: "Direction" },
  { key: "order-ranking", label: "Order & Ranking" },
  { key: "mirror-images", label: "Mirror Images" },
  { key: "venn-diagram", label: "Venn Diagram" },
  { key: "error-detection", label: "Error Detection" },
  { key: "fill-in-the-blanks", label: "Fill in the Blanks" },
  { key: "synonym", label: "Synonym" },
  { key: "antonym", label: "Antonym" },
  { key: "sentence-improvement", label: "Sentence Improvement" },
  { key: "reading-comprehension", label: "Reading Comprehension" },
  { key: "idioms-phrases", label: "Idioms & Phrases" },
  { key: "one-word-substitution", label: "One Word Substitution" },
  { key: "percentage", label: "Percentage" },
  { key: "ratio", label: "Ratio & Proportion" },
  { key: "average", label: "Average" },
  { key: "profit-loss", label: "Profit & Loss" },
  { key: "time-work", label: "Time & Work" },
  { key: "simplification", label: "Simplification" },
  { key: "quadratic-equations", label: "Quadratic Equations" },
  { key: "number-series", label: "Number Series" },
  { key: "mensuration", label: "Mensuration" },
  { key: "geometry", label: "Geometry" },
  { key: "trigonometry", label: "Trigonometry" },
  { key: "algebra", label: "Algebra" },
  { key: "history", label: "History" },
  { key: "geography", label: "Geography" },
  { key: "polity", label: "Polity" },
  { key: "economics", label: "Economics" },
  { key: "science", label: "Science" },
  { key: "current-affairs", label: "Current Affairs" },
  { key: "static-gk", label: "Static GK" },
  { key: "puzzles", label: "Puzzles" },
  { key: "seating-arrangement", label: "Seating Arrangement" },
  { key: "syllogism", label: "Syllogism" },
  { key: "inequality", label: "Inequality" },
  { key: "input-output", label: "Input Output" },
  { key: "data-interpretation", label: "Data Interpretation" },
  { key: "cloze-test", label: "Cloze Test" },
  { key: "para-jumbles", label: "Para Jumbles" },
  { key: "banking", label: "Banking" },
  { key: "financial-awareness", label: "Financial Awareness" },
  { key: "computer-awareness", label: "Computer Awareness" },
  { key: "vocabulary", label: "Vocabulary" },
  { key: "grammar", label: "Grammar" },
  { key: "sentence-connection", label: "Sentence Connection" },
];

type BlueprintResponse = {
  data?: {
    _id?: string;
    examSlug: string;
    stageSlug: string;
    name?: string;
    learningMode?: LearningMode;
    totalQuestions: number;
    sections: SectionRow[];
    difficultyMix: DifficultyMix;
    isActive?: boolean;
  } | null;
};

export default function PaperBlueprintsPage() {
  const [examSlug, setExamSlug] = useState<string>("ssc-cgl");
  const [stageSlug, setStageSlug] = useState<string>("tier-1");
  const [name, setName] = useState<string>("");
  const [learningMode, setLearningMode] = useState<LearningMode>("foundation");
  const [totalQuestions, setTotalQuestions] = useState<number>(500);
  const [difficultyMix, setDifficultyMix] = useState<DifficultyMix>(DEFAULT_DIFFICULTY_MIX);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedBlueprint, setHasLoadedBlueprint] = useState(false);
  const [customTopics, setCustomTopics] = useState<CustomTopic[]>([]);
  const [newTopicLabel, setNewTopicLabel] = useState<string>("");
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const STORAGE_KEY = "paper-blueprint-work";

  const saveWork = () => {
    const workData = {
      examSlug,
      stageSlug,
      name,
      learningMode,
      totalQuestions,
      difficultyMix,
      sections,
      customTopics,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workData));
    setHasUnsavedChanges(false);
    message.success("Work saved! Your progress will persist after reload.");
  };

  const loadSavedWork = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data && typeof data === 'object') {
          if (data.examSlug && typeof data.examSlug === 'string') setExamSlug(data.examSlug);
          if (data.stageSlug && typeof data.stageSlug === 'string') setStageSlug(data.stageSlug);
          if (data.name && typeof data.name === 'string') setName(data.name);
          if (data.learningMode && typeof data.learningMode === 'string') setLearningMode(data.learningMode);
          if (data.totalQuestions && typeof data.totalQuestions === 'number') setTotalQuestions(data.totalQuestions);
          if (data.difficultyMix && typeof data.difficultyMix === 'object') setDifficultyMix(data.difficultyMix);
          if (Array.isArray(data.sections) && data.sections.length) {
            const cleanSections = data.sections.filter((s: Record<string, unknown>) => s && typeof s === 'object').map((s: Record<string, unknown>) => ({
              key: String(s.key || `section-${Date.now()}`),
              label: String(s.label || 'Unnamed Section'),
              count: Number(s.count) || 10,
              topics: Array.isArray(s.topics) ? s.topics.filter((t: unknown) => typeof t === 'string') : [],
            }));
            setSections(cleanSections);
          }
          if (Array.isArray(data.customTopics) && data.customTopics.length) {
            const cleanTopics = data.customTopics.filter((t: Record<string, unknown>) => t && typeof t === 'object' && typeof t.label === 'string').map((t: Record<string, unknown>) => ({
              key: String(t.key || String(t.label).toLowerCase().replace(/\s+/g, "-")),
              label: String(t.label),
            }));
            setCustomTopics(cleanTopics);
          }
          message.info("Your saved work has been loaded!");
          return true;
        }
      } catch (e) {
        console.warn('Failed to load saved work:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return false;
  };

  const fetchExams = useCallback(async () => {
    try {
      const res = await apiClient.get<{ data: ExamItem[] }>(API_ENDPOINTS.exams.list, {
        params: { active: 'true' }
      });
      setExams(res.data?.data || []);
      if (res.data?.data?.length && !res.data.data.find(e => e.slug === examSlug)) {
        setExamSlug(res.data.data[0].slug);
        setStageSlug(res.data.data[0].stages?.[0]?.slug || '');
      }
      if (!loadSavedWork()) {
        loadTemplate();
      }
    } catch {
      console.error('Failed to fetch exams');
    }
  }, [examSlug]);

  useEffect(() => {
    void fetchExams();
  }, []);

  useEffect(() => {
    if (sections.length > 0 || customTopics.length > 0 || name) {
      setHasUnsavedChanges(true);
      const timer = setTimeout(() => {
        saveWork();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [sections, customTopics, name, examSlug, stageSlug, learningMode, totalQuestions, difficultyMix]);

  const allTopics = useMemo(() => {
    return [...AVAILABLE_TOPICS, ...customTopics.map(t => ({ key: t.key, label: t.label }))];
  }, [customTopics]);

  const addCustomTopic = () => {
    const label = newTopicLabel?.trim();
    if (!label) {
      message.warning("Enter a topic name");
      return;
    }
    const key = label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (allTopics.some(t => t.key === key)) {
      message.warning("Topic already exists");
      return;
    }
    setCustomTopics(prev => [...prev, { key, label }]);
    setNewTopicLabel("");
    message.success(`Custom topic "${label}" added`);
  };

  const removeCustomTopic = (key: string) => {
    setCustomTopics(prev => prev.filter(t => t.key !== key));
    setSections(prev => prev.map(section => ({
      ...section,
      topics: section.topics.filter(t => t !== key)
    })));
    message.info("Custom topic removed");
  };

  const stageOptions: StageOption[] = useMemo(() => {
    const exam = exams.find((item) => item.slug === examSlug);
    return (exam?.stages || []).map((stage) => ({ slug: stage.slug, name: stage.name }));
  }, [exams, examSlug]);

  const templateKey = `${examSlug}:${stageSlug}`;
  const templateSections = SECTION_TEMPLATES[templateKey] || [];

  const canSave = sections.length > 0 && name.trim() !== "";

  const loadTemplate = () => {
    if (templateSections.length > 0) {
      setSections(templateSections);
      setName(`${exams.find(e => e.slug === examSlug)?.name || examSlug} ${stageSlug} ${learningMode} Blueprint`);
      message.success("Template loaded!");
    } else {
      message.warning("No template for this exam/stage");
    }
  };

  const autoGenerateBlueprint = () => {
    const templateKey = `${examSlug}:${stageSlug}`;
    const template = SECTION_TEMPLATES[templateKey];
    
    if (!template) {
      message.warning(`No template found for ${examSlug} ${stageSlug}. Please add sections manually.`);
      return;
    }

    const examName = exams.find(e => e.slug === examSlug)?.name || examSlug;
    const stageName = stageOptions.find(s => s.slug === stageSlug)?.name || stageSlug;
    
    // Get difficulty mix based on learning mode
    const modeConfig = LEARNING_MODES.find(m => m.value === learningMode);
    const difficultyMix = modeConfig?.difficultyMix || DEFAULT_DIFFICULTY_MIX;
    
    // Calculate total questions based on exam pattern
    const templateTotal = template.reduce((sum, sec) => sum + sec.count, 0);
    const scaledTotal = Math.max(totalQuestions, templateTotal);
    
    // Scale sections to match desired total
    const scaleFactor = scaledTotal / templateTotal;
    const scaledSections = template.map(sec => ({
      ...sec,
      count: Math.round(sec.count * scaleFactor),
      topics: [...sec.topics], // Ensure topics are copied
    }));
    
    // Adjust to match exact total
    const currentTotal = scaledSections.reduce((sum, sec) => sum + sec.count, 0);
    const diff = scaledTotal - currentTotal;
    if (diff !== 0 && scaledSections.length > 0) {
      scaledSections[0].count += diff;
    }
    
    setName(`${examName} ${stageName} ${modeConfig?.label || ''} Blueprint`.trim());
    setDifficultyMix(difficultyMix);
    setSections(scaledSections);
    
    message.success(`Blueprint generated for ${examName} ${stageName}! You can edit sections and topics as needed.`);
    setHasLoadedBlueprint(false);
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      { key: `section-${prev.length + 1}`, label: `Section ${prev.length + 1}`, count: 10, topics: [] },
    ]);
  };

  const updateSection = (index: number, field: keyof SectionRow, value: string | number | string[]) => {
    setSections((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTopic = (sectionIndex: number, topicKey: string) => {
    setSections((prev) =>
      prev.map((section, i) => {
        if (i !== sectionIndex) return section;
        const topics = section.topics.includes(topicKey)
          ? section.topics.filter((t) => t !== topicKey)
          : [...section.topics, topicKey];
        return { ...section, topics };
      })
    );
  };

  const loadBlueprint = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<BlueprintResponse>(API_ENDPOINTS.paperBlueprints.get, {
        params: { examSlug },
      });
      const blueprint = response.data?.data;
      if (!blueprint) {
        setHasLoadedBlueprint(false);
        message.info("No blueprint found. Load a template or create your own.");
        return;
      }

      setName(blueprint.name || "");
      setLearningMode(blueprint.learningMode || "foundation");
      setTotalQuestions(Number(blueprint.totalQuestions || 100));
      setSections(
        (Array.isArray(blueprint.sections) ? blueprint.sections : []).map((section) => ({
          key: section.key,
          label: section.label,
          count: Number(section.count || 0),
          topics: Array.isArray(section.topics) ? section.topics : [],
        }))
      );
      setDifficultyMix({
        easy: Number(blueprint.difficultyMix?.easy ?? 0.5),
        medium: Number(blueprint.difficultyMix?.medium ?? 0.35),
        hard: Number(blueprint.difficultyMix?.hard ?? 0.15),
      });
      setHasLoadedBlueprint(true);
      message.success("Blueprint loaded.");
    } catch {
      message.error("Unable to load blueprint.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveBlueprint = async () => {
    if (sections.length === 0) {
      message.error("Add at least one section.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.put(API_ENDPOINTS.paperBlueprints.upsert, {
        examSlug,
        stageSlug,
        name,
        learningMode,
        totalQuestions,
        sections,
        difficultyMix,
        isActive: true,
      });
      message.success("Blueprint saved!");
      setHasLoadedBlueprint(true);
    } catch {
      message.error("Unable to save blueprint.");
    } finally {
      setIsLoading(false);
    }
  };

  const sectionColumns: ColumnsType<SectionRow> = [
    {
      title: "Section",
      dataIndex: "label",
      key: "label",
      width: 150,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => updateSection(index, "label", e.target.value)}
          placeholder="Section name"
        />
      ),
    },
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      width: 120,
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => updateSection(index, "key", e.target.value)}
          placeholder="key-name"
        />
      ),
    },
    {
      title: "Questions",
      dataIndex: "count",
      key: "count",
      width: 100,
      render: (value, record, index) => (
        <InputNumber
          min={1}
          max={500}
          value={value}
          onChange={(val) => updateSection(index, "count", val || 10)}
          className="w-full"
        />
      ),
    },
    {
      title: "Topics",
      key: "topics",
      render: (_, record, index) => (
        <div className="max-h-32 overflow-y-auto border rounded p-2">
          <Checkbox.Group
            value={record.topics}
            onChange={(vals) => updateSection(index, "topics", vals as string[])}
            className="flex flex-col gap-1"
          >
            {allTopics.map((topic) => {
              const isCustom = customTopics.some(t => t.key === topic.key);
              return (
                <Checkbox key={topic.key} value={topic.key}>
                  {topic.label} {isCustom && <Tag color="blue" className="ml-1">Custom</Tag>}
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeSection(index)}
        />
      ),
    },
  ];

  return (
    <div className="!p-6 max-w-7xl !mx-auto">
      <div className="!flex !items-center !justify-between !mb-4">
        <div>
          <Title level={3} className="!m-0">Paper Blueprint</Title>
          <Text type="secondary">
            Create exam paper blueprints with sections, topics, and difficulty mix
          </Text>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={saveWork}
          disabled={!hasUnsavedChanges}
        >
          Save Work {hasUnsavedChanges && <Tag color="red" className="!ml-2">Unsaved</Tag>}
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Exam Configuration" size="small">
            <Space direction="vertical" className="!w-full">
              <div>
                <Text strong>Exam</Text>
                <Select
                  className="!mt-1 w-full"
                  value={examSlug}
                  onChange={(val) => {
                    setExamSlug(val);
                    const exam = exams.find((e) => e.slug === val);
                    setStageSlug(exam?.stages?.[0]?.slug || "");
                  }}
                  options={exams.map((exam) => ({
                    value: exam.slug,
                    label: exam.name,
                  }))}
                  loading={!exams.length}
                  placeholder="Select exam"
                />
              </div>
              <div>
                <Text strong>Stage</Text>
                <Select
                  className="!mt-1 w-full"
                  value={stageSlug}
                  onChange={setStageSlug}
                  options={stageOptions.map((stage) => ({
                    value: stage.slug,
                    label: stage.name,
                  }))}
                />
              </div>
              <div>
                <Text strong>Learning Mode</Text>
                <Select
                  className="!mt-1 w-full"
                  value={learningMode}
                  onChange={setLearningMode}
                  options={LEARNING_MODES.map((mode) => ({
                    value: mode.value,
                    label: mode.label,
                  }))}
                />
              </div>
              <div>
                <Text strong>Target Total Questions</Text>
                <InputNumber
                  className="!mt-1 w-full"
                  min={1}
                  max={2000}
                  value={totalQuestions}
                  onChange={(value) => setTotalQuestions(value || 500)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <Text strong>Blueprint Name</Text>
                <Input
                  className="!mt-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., SSC CGL Beginner Blueprint"
                />
              </div>
              <Button block onClick={loadTemplate} disabled={templateSections.length === 0}>
                Load Basic Template
              </Button>
              <Button 
                block 
                type="primary"
                icon={<ThunderboltOutlined />} 
                onClick={autoGenerateBlueprint}
              >
                Auto Generate (80% Real Pattern)
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Difficulty Mix" size="small">
            <Space direction="vertical" className="!w-full">
              <div>
                <Text>Easy: {Math.round(difficultyMix.easy * 100)}%</Text>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={difficultyMix.easy}
                  onChange={(val) => setDifficultyMix({ ...difficultyMix, easy: val })}
                />
              </div>
              <div>
                <Text>Medium: {Math.round(difficultyMix.medium * 100)}%</Text>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={difficultyMix.medium}
                  onChange={(val) => setDifficultyMix({ ...difficultyMix, medium: val })}
                />
              </div>
              <div>
                <Text>Hard: {Math.round(difficultyMix.hard * 100)}%</Text>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={difficultyMix.hard}
                  onChange={(val) => setDifficultyMix({ ...difficultyMix, hard: val })}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Summary" size="small">
            <Space direction="vertical" className="!w-full">
              <div>
                <Text strong>Sections:</Text>
                <Text className="!ml-2">{sections.length}</Text>
              </div>
              <div>
                <Text strong>Topics Selected:</Text>
                <Text className="!ml-2">
                  {sections.reduce((sum, s) => sum + s.topics.length, 0)}
                </Text>
              </div>
              <Divider />
              <Button
                type="primary"
                icon={<SaveOutlined />}
                block
                onClick={saveBlueprint}
                disabled={!canSave}
                loading={isLoading}
              >
                Save Blueprint
              </Button>
              <Button
                icon={<ReloadOutlined />}
                block
                onClick={loadBlueprint}
                loading={isLoading}
              >
                Load Existing
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Sections & Topics" className="!mt-4">
        <div className="!mb-4 !p-4 !bg-gray-50 !rounded">
          <Text strong className="!block !mb-2">Add Custom Topic</Text>
          <Space.Compact className="!w-full">
            <Input
              placeholder="Enter custom topic name (e.g., Ancient India)"
              value={newTopicLabel}
              onChange={(e) => setNewTopicLabel(e.target.value)}
              onPressEnter={addCustomTopic}
            />
            <Button type="primary" icon={<PlusCircleOutlined />} onClick={addCustomTopic}>
              Add
            </Button>
          </Space.Compact>
          {customTopics.length > 0 && (
            <div className="!mt-2">
              <Text type="secondary" className="!text-xs">Custom Topics:</Text>
              <div className="!flex !flex-wrap !gap-1 !mt-1">
                {customTopics.map(topic => (
                  <Tag
                    key={topic.key}
                    closable
                    onClose={() => removeCustomTopic(topic.key)}
                    color="blue"
                  >
                    {topic.label}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
        <Table
          dataSource={sections}
          columns={sectionColumns}
          rowKey={(record, index) => record.key || String(index)}
          pagination={false}
          size="small"
        />
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={addSection}
          className="!mt-4"
          block
        >
          Add Section
        </Button>
      </Card>
    </div>
  );
}
