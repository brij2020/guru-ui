export type Lang = "en" | "hi";

export type ExamConfig = {
  slug: string;
  name: string;
  description: string;
  stages: Array<{
    slug: string;
    name: string;
    durationMinutes: number;
    questionCount: number;
  }>;
};

export type GoalConfig = {
  slug: string;
  name: string;
  summary: string;
  recommendedMix: string;
};

export type StruggleArea = {
  slug: string;
  label: string;
  hint: string;
  recommendedGoal: string;
};

export const GOV_EXAMS: ExamConfig[] = [
  {
    slug: "ssc-cgl",
    name: "SSC CGL",
    description: "Tier-wise mock tests for Quant, Reasoning, English, and GK coverage.",
    stages: [
      { slug: "tier-1", name: "Tier 1", durationMinutes: 60, questionCount: 100 },
      { slug: "tier-2", name: "Tier 2", durationMinutes: 120, questionCount: 120 },
    ],
  },
  {
    slug: "ssc-chsl",
    name: "SSC CHSL",
    description: "10+2 Level exam for Lower Division Clerk and Postal Assistants.",
    stages: [
      { slug: "tier-1", name: "Tier 1", durationMinutes: 60, questionCount: 100 },
      { slug: "tier-2", name: "Tier 2", durationMinutes: 90, questionCount: 100 },
    ],
  },
  {
    slug: "ssc-mts",
    name: "SSC MTS",
    description: "Multi-Tasking Staff exam for Group C posts.",
    stages: [
      { slug: "tier-1", name: "Tier 1", durationMinutes: 90, questionCount: 100 },
      { slug: "tier-2", name: "Tier 2", durationMinutes: 60, questionCount: 100 },
    ],
  },
  {
    slug: "upsc-cse",
    name: "UPSC CSE",
    description: "GS + CSAT style mock preparation with wide-topic revision focus.",
    stages: [
      { slug: "prelims", name: "Prelims", durationMinutes: 120, questionCount: 100 },
      { slug: "mains", name: "Mains", durationMinutes: 180, questionCount: 20 },
    ],
  },
  {
    slug: "ibps-po",
    name: "IBPS PO",
    description: "Banking-focused mocks for speed, puzzle solving, and sectional balance.",
    stages: [
      { slug: "prelims", name: "Prelims", durationMinutes: 60, questionCount: 100 },
      { slug: "mains", name: "Mains", durationMinutes: 180, questionCount: 155 },
    ],
  },
  {
    slug: "ibps-clerk",
    name: "IBPS Clerk",
    description: "Clerk exam pattern for banking sector jobs.",
    stages: [
      { slug: "prelims", name: "Prelims", durationMinutes: 60, questionCount: 100 },
      { slug: "mains", name: "Mains", durationMinutes: 160, questionCount: 190 },
    ],
  },
  {
    slug: "sbi-po",
    name: "SBI PO",
    description: "Probationary Officer exam for State Bank of India.",
    stages: [
      { slug: "prelims", name: "Prelims", durationMinutes: 60, questionCount: 100 },
      { slug: "mains", name: "Mains", durationMinutes: 200, questionCount: 160 },
    ],
  },
  {
    slug: "sbi-clerk",
    name: "SBI Clerk",
    description: "Clerk exam pattern mocks focused on speed, comprehension, and reasoning.",
    stages: [
      { slug: "prelims", name: "Prelims", durationMinutes: 60, questionCount: 100 },
      { slug: "mains", name: "Mains", durationMinutes: 160, questionCount: 190 },
    ],
  },
  {
    slug: "rrb-ntpc",
    name: "RRB NTPC",
    description: "Railway pattern simulation with timed drills and accuracy control.",
    stages: [
      { slug: "cbt-1", name: "CBT 1", durationMinutes: 90, questionCount: 100 },
      { slug: "cbt-2", name: "CBT 2", durationMinutes: 90, questionCount: 120 },
    ],
  },
  {
    slug: "rrb-group-d",
    name: "RRB Group D",
    description: "Railway Group D exam for Level 1 posts.",
    stages: [
      { slug: "cbt", name: "CBT", durationMinutes: 90, questionCount: 100 },
    ],
  },
  {
    slug: "lic-aao",
    name: "LIC AAO",
    description: "Life Insurance Corporation Assistant Administrative Officer exam.",
    stages: [
      { slug: "prelims", name: "Prelims", durationMinutes: 60, questionCount: 100 },
      { slug: "mains", name: "Mains", durationMinutes: 120, questionCount: 140 },
    ],
  },
  {
    slug: "nda",
    name: "NDA",
    description: "National Defence Academy entrance exam.",
    stages: [
      { slug: "written", name: "Written", durationMinutes: 150, questionCount: 270 },
      { slug: "ssb", name: "SSB Interview", durationMinutes: 0, questionCount: 0 },
    ],
  },
  {
    slug: "cds",
    name: "CDS",
    description: "Combined Defence Services exam for IMA, AFA, INA, OTA.",
    stages: [
      { slug: "written", name: "Written", durationMinutes: 180, questionCount: 300 },
      { slug: "ssb", name: "SSB Interview", durationMinutes: 0, questionCount: 0 },
    ],
  },
  {
    slug: "afcat",
    name: "AFCAT",
    description: "Air Force Common Admission Test for flying and ground duties.",
    stages: [
      { slug: "cbt", name: "CBT", durationMinutes: 120, questionCount: 100 },
    ],
  },
  {
    slug: "state-psc",
    name: "State PSC",
    description: "State-level PSC prep with prelims and mains-specific mock configurations.",
    stages: [
      { slug: "prelims", name: "Prelims", durationMinutes: 120, questionCount: 150 },
      { slug: "mains", name: "Mains", durationMinutes: 180, questionCount: 20 },
    ],
  },
  {
    slug: "bpsc-tre-4",
    name: "BPSC TRE 4",
    description: "Bihar Teacher Recruitment Exam 4 - Offline OMR based exam.",
    stages: [
      { slug: "main", name: "Main Exam", durationMinutes: 150, questionCount: 150 },
    ],
  },
];

export const GOALS: GoalConfig[] = [
  {
    slug: "full-exam-simulation",
    name: "Full Exam Simulation",
    summary: "Closest real-exam feel with complete section flow, pacing, and pressure.",
    recommendedMix: "30% easy, 50% medium, 20% hard",
  },
  {
    slug: "weak-topic-practice",
    name: "Weak Topic Practice",
    summary: "Concentrated drilling on low-score areas with quick correction cycles.",
    recommendedMix: "45% easy, 40% medium, 15% hard",
  },
  {
    slug: "previous-year-style",
    name: "Previous Year Style",
    summary: "Question pattern and framing tuned to historical exam tendencies.",
    recommendedMix: "35% easy, 45% medium, 20% hard",
  },
  {
    slug: "speed-test",
    name: "Speed Test",
    summary: "Timed aggressive attempt strategy to improve attempts-per-minute safely.",
    recommendedMix: "55% easy, 35% medium, 10% hard",
  },
  {
    slug: "concept-builder",
    name: "Concept Builder",
    summary: "Strengthen core fundamentals before pushing high-pressure mock attempts.",
    recommendedMix: "60% easy, 30% medium, 10% hard",
  },
];

export const STRUGGLE_AREAS: StruggleArea[] = [
  {
    slug: "time-management",
    label: "Time Management",
    hint: "You run out of time before finishing all questions.",
    recommendedGoal: "speed-test",
  },
  {
    slug: "negative-marking",
    label: "Negative Marking",
    hint: "Too many risky attempts are hurting final score.",
    recommendedGoal: "full-exam-simulation",
  },
  {
    slug: "weak-topics",
    label: "Weak Topics",
    hint: "Certain topics repeatedly reduce your score.",
    recommendedGoal: "weak-topic-practice",
  },
  {
    slug: "consistency",
    label: "Consistency",
    hint: "Your performance changes too much between attempts.",
    recommendedGoal: "full-exam-simulation",
  },
];

export const getExamBySlug = (slug: string) => GOV_EXAMS.find((exam) => exam.slug === slug);

export const getStageBySlug = (exam: ExamConfig, stageSlug: string) =>
  exam.stages.find((stage) => stage.slug === stageSlug);

export const getGoalBySlug = (goalSlug: string) => GOALS.find((goal) => goal.slug === goalSlug);

export const getBuilderCopy = (lang: Lang) => ({
  introTitle: lang === "hi" ? "Gov Mock Test Builder (Hindi)" : "Gov Mock Test Builder",
  introDescription:
    lang === "hi"
      ? "Pick exam, stage, and goal to generate a focused mock setup."
      : "Pick exam, stage, and goal to generate a focused mock setup.",
  examStepLabel: lang === "hi" ? "Step 1: Pick Exam" : "Step 1: Pick Exam",
  stageStepLabel: lang === "hi" ? "Step 2: Pick Stage" : "Step 2: Pick Stage",
  goalStepLabel: lang === "hi" ? "Step 3: Pick Goal" : "Step 3: Pick Goal",
  planStepLabel: lang === "hi" ? "Step 4: Pick AI Plan" : "Step 4: Pick AI Plan",
  ctaStart: lang === "hi" ? "Start Building" : "Start Building",
});
