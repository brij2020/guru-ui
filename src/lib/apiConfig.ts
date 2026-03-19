export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");
export const AUTH_STORAGE_KEY = "medCert";

export const API_ENDPOINTS = {
  auth: {
    login: "/api/v1/auth/login",
    refreshToken: "/api/v1/auth/refresh-token",
    register: "/api/v1/auth/register",
    logout: "/api/v1/auth/logout",
    me: "/api/v1/auth/me",
  },
  categories: {
    list: "/api/v1/categories",
    create: "/api/v1/categories",
    byId: (id: string) => `/api/v1/categories/${id}`,
  },
  topics: {
    list: "/api/v1/topics",
    create: "/api/v1/topics",
    byId: (id: string) => `/api/v1/topics/${id}`,
  },
  questionStyles: {
    list: "/api/v1/question-styles",
    create: "/api/v1/question-styles",
    byId: (id: string) => `/api/v1/question-styles/${id}`,
  },
  questionCounts: {
    list: "/api/v1/question-counts",
    create: "/api/v1/question-counts",
    byId: (id: string) => `/api/v1/question-counts/${id}`,
  },
  examHierarchy: {
    get: "/api/v1/exam-hierarchy",
    upsert: "/api/v1/exam-hierarchy",
  },
  exams: {
    list: "/api/v1/exams",
    create: "/api/v1/exams",
    byId: (slug: string) => `/api/v1/exams/${slug}`,
  },
  testAttempts: {
    start: "/api/v1/test-attempts/start",
  },
  ai: {
    evaluateTest: "/api/v1/ai/evaluate-test",
  },
  questionBank: {
    similar: "/api/v1/question-bank/similar",
    assemblePaper: "/api/v1/question-bank/assemble-paper",
    importJson: "/api/v1/question-bank/import-json",
    pdfJobs: "/api/v1/question-bank/pdf-jobs",
    pdfJobById: (id: string) => `/api/v1/question-bank/pdf-jobs/${id}`,
    runPdfJob: (id: string) => `/api/v1/question-bank/pdf-jobs/${id}/run`,
    importPdfJob: (id: string) => `/api/v1/question-bank/pdf-jobs/${id}/import`,
    reviewList: "/api/v1/question-bank/review-list",
    reviewStatus: "/api/v1/question-bank/review-status",
    reviewItemById: (id: string) => `/api/v1/question-bank/review-item/${id}`,
    reviewItemAiReviewById: (id: string) => `/api/v1/question-bank/review-item/${id}/ai-review`,
    coverage: "/api/v1/question-bank/coverage",
    bulkCreate: "/api/v1/question-bank/bulk-create",
  },
  paperBlueprints: {
    get: "/api/v1/paper-blueprints",
    upsert: "/api/v1/paper-blueprints",
  },
  aiGenerationJobs: {
    create: "/api/v1/ai-generation-jobs",
    list: "/api/v1/ai-generation-jobs",
    byId: (id: string) => `/api/v1/ai-generation-jobs/${id}`,
    processNext: "/api/v1/ai-generation-jobs/process-next",
  },
  difficulties: {
    list: "/api/v1/difficulties",
  },
  difficultyLevels: {
    list: "/api/v1/difficulty-levels",
    create: "/api/v1/difficulty-levels",
    byId: (id: string) => `/api/v1/difficulty-levels/${id}`,
  },
  legacy: {
    getProfiles: "/v1/profile/getProfiles",
    registerUser: "/v1/user/register",
  },
} as const;

export const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;
