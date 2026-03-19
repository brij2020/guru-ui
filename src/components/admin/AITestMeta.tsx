'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import ManagePanel, { ManageKey } from "@/components/admin/ManagePanel";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";

type DifficultyLevel = string;

interface CategoryItem {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryApiItem {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ListCategoriesResponse {
  data?: CategoryApiItem[];
}

interface CategoryMutationResponse {
  data?: CategoryApiItem;
}

interface CategoryFormValues {
  name: string;
}

interface TopicItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  updatedAt?: string;
}

interface TopicApiItem {
  _id: string;
  name: string;
  description?: string;
  category: string;
  updatedAt?: string;
}

interface ListTopicsResponse {
  data?: TopicApiItem[];
}

interface TopicMutationResponse {
  data?: TopicApiItem | TopicApiItem[];
}

interface TopicFormValues {
  categoryId: string;
  titles: string;
  description?: string;
}

interface DifficultyItem {
  id: string;
  level: DifficultyLevel;
  updatedAt?: string;
}

interface DifficultyApiItem {
  _id: string;
  level: string;
  updatedAt?: string;
}

interface ListDifficultiesResponse {
  data?: DifficultyApiItem[];
}

interface DifficultyMutationResponse {
  data?: DifficultyApiItem;
}

interface DifficultyFormValues {
  level: DifficultyLevel;
}

interface QuestionCountItem {
  id: string;
  count: number;
  updatedAt?: string;
}

interface QuestionCountApiItem {
  _id: string;
  count: number;
  updatedAt?: string;
}

interface ListQuestionCountsResponse {
  data?: QuestionCountApiItem[];
}

interface QuestionCountMutationResponse {
  data?: QuestionCountApiItem;
}

interface QuestionCountFormValues {
  count: number;
}

interface QuestionStyleItem {
  id: string;
  style: string;
  categoryId: string;
  updatedAt?: string;
}

interface QuestionStyleApiItem {
  _id: string;
  style: string;
  category: string;
  updatedAt?: string;
}

interface ListQuestionStylesResponse {
  data?: QuestionStyleApiItem[];
}

interface QuestionStyleMutationResponse {
  data?: QuestionStyleApiItem | QuestionStyleApiItem[];
}

interface QuestionStyleFormValues {
  style: string;
  categoryId: string;
}

interface SubjectItem {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
}

interface SubjectFormValues {
  name: string;
  description?: string;
}

interface HierarchyNode {
  id: number | string;
  title: string;
  slug?: string;
  children?: HierarchyNode[];
}

interface ExamHierarchyApiItem {
  _id: string;
  name?: string;
  tree?: HierarchyNode[];
  owner?: string;
  updatedAt?: string;
}

interface ExamHierarchyResponse {
  data?: ExamHierarchyApiItem | null;
}

interface HierarchyRow {
  key: string;
  id: string;
  title: string;
  slug?: string;
  level: number;
  path: string;
  children?: HierarchyRow[];
}

interface ExamStageItem {
  slug: string;
  name: string;
  durationMinutes?: number;
  questionCount?: number;
  totalMarks?: number;
  description?: string;
  negativeMarking?: {
    enabled: boolean;
    perWrongAnswer?: number;
  };
}

interface ExamNegativeMarking {
  enabled: boolean;
  perWrongAnswer: number;
}

interface ExamItem {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  stages: ExamStageItem[];
  isActive?: boolean;
  displayOrder?: number;
  negativeMarking?: ExamNegativeMarking;
  totalQuestions?: number;
  updatedAt?: string;
}

interface ExamFormValues {
  name: string;
  slug: string;
  description?: string;
  stages: ExamStageItem[];
  isActive?: boolean;
  displayOrder?: number;
  negativeMarking?: ExamNegativeMarking;
  totalQuestions?: number;
}

interface ListExamsResponse {
  data?: ExamItem[];
}

interface ExamMutationResponse {
  data?: ExamItem;
}

const HIERARCHY_STORAGE_KEY = "ai-test-hierarchy-v1";

const DEFAULT_GOV_HIERARCHY: HierarchyNode[] = [
  {
    id: 1,
    title: "Government Exams",
    children: [
      {
        id: 11,
        title: "Central Government",
        children: [
          { id: 111, title: "SSC Exams" },
          { id: 112, title: "Civil Services Exam (UPSC)" },
          { id: 113, title: "Railways Exams" },
          { id: 114, title: "Defence Exams" },
          { id: 115, title: "Police Exams" },
          { id: 116, title: "Nursing Exams" },
          { id: 117, title: "Judiciary Exams" },
          { id: 118, title: "Regulatory Body Exams" },
        ],
      },
      {
        id: 12,
        title: "Banking & Finance",
        children: [
          { id: 121, title: "Banking Exams" },
          { id: 122, title: "Insurance Exams" },
        ],
      },
      {
        id: 13,
        title: "Teaching & Education",
        children: [{ id: 131, title: "Teaching Exams" }],
      },
      {
        id: 14,
        title: "Engineering & Technical",
        children: [{ id: 141, title: "Engineering Recruitment Exams" }],
      },
      {
        id: 15,
        title: "State-Level",
        children: [
          { id: 151, title: "State Govt. Exams" },
          { id: 152, title: "Other Govt. Exams" },
        ],
      },
    ],
  },
];

const nowIso = () => new Date().toISOString();

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const validateHierarchyNodes = (value: unknown): HierarchyNode[] => {
  if (!Array.isArray(value)) {
    throw new Error("Root must be an array of hierarchy nodes.");
  }

  const walk = (node: unknown, path: string): HierarchyNode => {
    if (!node || typeof node !== "object") {
      throw new Error(`Invalid node at ${path}: must be an object.`);
    }
    const raw = node as Partial<HierarchyNode>;
    if (raw.id === undefined || raw.id === null) {
      throw new Error(`Missing 'id' at ${path}.`);
    }
    if (typeof raw.title !== "string" || !raw.title.trim()) {
      throw new Error(`Invalid 'title' at ${path}.`);
    }
    if (
      raw.slug !== undefined &&
      (typeof raw.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug.trim()))
    ) {
      throw new Error(`Invalid 'slug' at ${path}. Use lowercase-hyphen format.`);
    }
    const children = raw.children?.map((child, index) => walk(child, `${path}.children[${index}]`));
    return {
      id: raw.id,
      title: raw.title.trim(),
      ...(typeof raw.slug === "string" && raw.slug.trim()
        ? { slug: raw.slug.trim().toLowerCase() }
        : {}),
      ...(children && children.length ? { children } : {}),
    };
  };

  return value.map((node, index) => walk(node, `root[${index}]`));
};

const hierarchyToRows = (
  nodes: HierarchyNode[],
  level = 1,
  parentPath = ""
): HierarchyRow[] =>
  nodes.map((node, index) => {
    const key = parentPath ? `${parentPath}.${index + 1}` : `${index + 1}`;
    const path = parentPath ? `${parentPath} > ${node.title}` : node.title;
    return {
      key,
      id: String(node.id),
      title: node.title,
      slug: node.slug || "",
      level,
      path,
      children: node.children?.length ? hierarchyToRows(node.children, level + 1, path) : undefined,
    };
  });

const difficultyColor = (level: DifficultyLevel) => {
  const normalized = level.trim().toLowerCase();
  if (normalized === "advanced") return "volcano";
  if (normalized === "intermediate") return "gold";
  if (normalized === "beginner") return "green";
  return "blue";
};

export default function AITestMeta() {
  const [activeManager, setActiveManager] = useState<ManageKey>("category");

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [topicSaving, setTopicSaving] = useState(false);

  const [difficulties, setDifficulties] = useState<DifficultyItem[]>([]);
  const [loadingDifficulties, setLoadingDifficulties] = useState(false);
  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);
  const [difficultySaving, setDifficultySaving] = useState(false);
  const [editingDifficultyId, setEditingDifficultyId] = useState<string | null>(null);

  const [questionCounts, setQuestionCounts] = useState<QuestionCountItem[]>([]);
  const [loadingQuestionCounts, setLoadingQuestionCounts] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionStyles, setQuestionStyles] = useState<QuestionStyleItem[]>([]);
  const [loadingQuestionStyles, setLoadingQuestionStyles] = useState(false);
  const [questionStyleModalOpen, setQuestionStyleModalOpen] = useState(false);
  const [questionStyleSaving, setQuestionStyleSaving] = useState(false);
  const [editingQuestionStyleId, setEditingQuestionStyleId] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<SubjectItem[]>([
    { id: "subject-pathology", name: "Pathology", description: "Core pathology topics", updatedAt: nowIso() },
    { id: "subject-pharmacology", name: "Pharmacology", description: "Drug-related modules", updatedAt: nowIso() },
  ]);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [hierarchyNodes, setHierarchyNodes] = useState<HierarchyNode[]>([]);
  const [hierarchyModalOpen, setHierarchyModalOpen] = useState(false);
  const [hierarchySaving, setHierarchySaving] = useState(false);
  const [hierarchyJsonText, setHierarchyJsonText] = useState("");

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [examSaving, setExamSaving] = useState(false);
  const [editingExamSlug, setEditingExamSlug] = useState<string | null>(null);

  const [categoryForm] = Form.useForm<CategoryFormValues>();
  const [topicForm] = Form.useForm<TopicFormValues>();
  const [difficultyForm] = Form.useForm<DifficultyFormValues>();
  const [questionForm] = Form.useForm<QuestionCountFormValues>();
  const [questionStyleForm] = Form.useForm<QuestionStyleFormValues>();
  const [subjectForm] = Form.useForm<SubjectFormValues>();
  const [examForm] = Form.useForm<ExamFormValues>();

  const mapCategory = (item: CategoryApiItem): CategoryItem => ({
    id: item._id,
    name: item.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  });

  const categoryNameById = useMemo(() => {
    const byId = new Map<string, string>();
    categories.forEach((category) => byId.set(category.id, category.name));
    return byId;
  }, [categories]);

  const mapTopic = useCallback(
    (item: TopicApiItem): TopicItem => ({
      id: item._id,
      name: item.name,
      description: item.description,
      categoryId: item.category,
      categoryName: categoryNameById.get(item.category) || "Unknown",
      updatedAt: item.updatedAt,
    }),
    [categoryNameById]
  );

  const mapQuestionStyle = useCallback(
    (item: QuestionStyleApiItem): QuestionStyleItem => ({
      id: item._id,
      style: item.style,
      categoryId: item.category,
      updatedAt: item.updatedAt,
    }),
    []
  );

  const mapDifficulty = useCallback(
    (item: DifficultyApiItem): DifficultyItem => ({
      id: item._id,
      level: item.level,
      updatedAt: item.updatedAt,
    }),
    []
  );

  const mapQuestionCount = useCallback(
    (item: QuestionCountApiItem): QuestionCountItem => ({
      id: item._id,
      count: item.count,
      updatedAt: item.updatedAt,
    }),
    []
  );

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const res = await apiClient.get<ListCategoriesResponse>(API_ENDPOINTS.categories.list);
      const items = Array.isArray(res.data?.data) ? res.data.data.map(mapCategory) : [];
      setCategories(items);
    } catch {
      message.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchTopics = useCallback(async () => {
    setLoadingTopics(true);
    try {
      const res = await apiClient.get<ListTopicsResponse>(API_ENDPOINTS.topics.list);
      const items = Array.isArray(res.data?.data) ? res.data.data.map(mapTopic) : [];
      setTopics(items);
    } catch {
      message.error("Failed to load topics");
    } finally {
      setLoadingTopics(false);
    }
  }, [mapTopic]);

  const fetchQuestionStyles = useCallback(async () => {
    setLoadingQuestionStyles(true);
    try {
      const res = await apiClient.get<ListQuestionStylesResponse>(API_ENDPOINTS.questionStyles.list);
      const items = Array.isArray(res.data?.data) ? res.data.data.map(mapQuestionStyle) : [];
      setQuestionStyles(items);
    } catch {
      message.error("Failed to load question styles");
    } finally {
      setLoadingQuestionStyles(false);
    }
  }, [mapQuestionStyle]);

  const fetchDifficulties = useCallback(async () => {
    setLoadingDifficulties(true);
    try {
      const res = await apiClient.get<ListDifficultiesResponse>(API_ENDPOINTS.difficultyLevels.list);
      const items = Array.isArray(res.data?.data) ? res.data.data.map(mapDifficulty) : [];
      setDifficulties(items);
    } catch {
      message.error("Failed to load difficulties");
    } finally {
      setLoadingDifficulties(false);
    }
  }, [mapDifficulty]);

  const fetchQuestionCounts = useCallback(async () => {
    setLoadingQuestionCounts(true);
    try {
      const res = await apiClient.get<ListQuestionCountsResponse>(API_ENDPOINTS.questionCounts.list);
      const items = Array.isArray(res.data?.data) ? res.data.data.map(mapQuestionCount) : [];
      setQuestionCounts(items.sort((a, b) => a.count - b.count));
    } catch {
      message.error("Failed to load question counts");
    } finally {
      setLoadingQuestionCounts(false);
    }
  }, [mapQuestionCount]);

  const fetchExams = useCallback(async () => {
    setLoadingExams(true);
    try {
      const res = await apiClient.get<ListExamsResponse>(API_ENDPOINTS.exams.list);
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setExams(items);
    } catch {
      message.error("Failed to load exams");
    } finally {
      setLoadingExams(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    void fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    void fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    void fetchQuestionStyles();
  }, [fetchQuestionStyles]);

  useEffect(() => {
    void fetchDifficulties();
  }, [fetchDifficulties]);

  useEffect(() => {
    void fetchQuestionCounts();
  }, [fetchQuestionCounts]);

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const res = await apiClient.get<ExamHierarchyResponse>(API_ENDPOINTS.examHierarchy.get);
        const apiTree = res.data?.data?.tree;
        if (Array.isArray(apiTree)) {
          const validated = validateHierarchyNodes(apiTree);
          setHierarchyNodes(validated);
          window.localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(validated));
          return;
        }
      } catch {
        // Fallback to local cache/default when API is unavailable.
      }

      try {
        const raw = window.localStorage.getItem(HIERARCHY_STORAGE_KEY);
        if (!raw) {
          setHierarchyNodes(DEFAULT_GOV_HIERARCHY);
          return;
        }
        const parsed = JSON.parse(raw);
        const validated = validateHierarchyNodes(parsed);
        setHierarchyNodes(validated);
      } catch {
        setHierarchyNodes(DEFAULT_GOV_HIERARCHY);
        message.warning("Hierarchy data was invalid. Loaded default government hierarchy.");
      }
    };

    void loadHierarchy();
  }, []);

  const openCreateCategory = () => {
    setEditingCategoryId(null);
    categoryForm.resetFields();
    setCategoryModalOpen(true);
  };

  const openEditCategory = (row: CategoryItem) => {
    setEditingCategoryId(row.id);
    categoryForm.setFieldsValue({ name: row.name });
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (values: CategoryFormValues) => {
    const normalized = values.name.trim();
    if (!normalized) return;

    setCategorySaving(true);
    try {
      if (editingCategoryId) {
        const res = await apiClient.put<CategoryMutationResponse>(
          API_ENDPOINTS.categories.byId(editingCategoryId),
          { name: normalized }
        );
        const updated = res.data?.data;
        if (updated) {
          const mapped = mapCategory(updated);
          setCategories((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
        } else {
          await fetchCategories();
        }
        message.success(`Category "${normalized}" updated`);
      } else {
        const res = await apiClient.post<CategoryMutationResponse>(API_ENDPOINTS.categories.create, {
          name: normalized,
        });
        const created = res.data?.data;
        if (created) {
          const mapped = mapCategory(created);
          setCategories((prev) => {
            if (prev.some((item) => item.id === mapped.id)) return prev;
            return [mapped, ...prev];
          });
        } else {
          await fetchCategories();
        }
        message.success(`Category "${normalized}" added`);
      }

      setCategoryModalOpen(false);
      categoryForm.resetFields();
      setEditingCategoryId(null);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : `Failed to ${editingCategoryId ? "update" : "add"} category`;

      message.error(apiMessage);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.categories.byId(id));
      setCategories((prev) => prev.filter((item) => item.id !== id));
      setTopics((prev) => prev.filter((item) => item.categoryId !== id));
      setQuestionStyles((prev) => prev.filter((item) => item.categoryId !== id));
      message.success("Category deleted");
    } catch {
      message.error("Failed to delete category");
    }
  };

  const openCreateTopic = () => {
    if (!categories.length) {
      message.warning("Create at least one category first.");
      return;
    }
    topicForm.setFieldsValue({
      categoryId: categories[0].id,
      titles: "",
      description: "",
    });
    setTopicModalOpen(true);
  };

  const handleTopicSubmit = async (values: TopicFormValues) => {
    const parsedTitles = values.titles
      .split(/\r?\n|,/)
      .map((title) => title.trim())
      .filter(Boolean);

    if (!parsedTitles.length) {
      message.error("Please add at least one topic title");
      return;
    }

    setTopicSaving(true);
    try {
      const payload: { categoryId: string; titles: string[]; description?: string } = {
        categoryId: values.categoryId,
        titles: Array.from(new Set(parsedTitles)),
      };

      const normalizedDescription = values.description?.trim();
      if (normalizedDescription) {
        payload.description = normalizedDescription;
      }

      const res = await apiClient.post<TopicMutationResponse>(API_ENDPOINTS.topics.create, payload);
      const createdRaw = res.data?.data;
      const createdList = Array.isArray(createdRaw)
        ? createdRaw
        : createdRaw
        ? [createdRaw]
        : [];

      if (createdList.length) {
        const mapped = createdList.map(mapTopic);
        setTopics((prev) => {
          const byId = new Map(prev.map((item) => [item.id, item]));
          mapped.forEach((item) => byId.set(item.id, item));
          return Array.from(byId.values()).sort(
            (a, b) =>
              new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
          );
        });
      } else {
        await fetchTopics();
      }

      setTopicModalOpen(false);
      topicForm.resetFields();
      message.success(`${payload.titles.length} topic${payload.titles.length > 1 ? "s" : ""} created`);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Failed to create topics";
      message.error(apiMessage);
    } finally {
      setTopicSaving(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.topics.byId(id));
      setTopics((prev) => prev.filter((item) => item.id !== id));
      message.success("Topic deleted");
    } catch {
      message.error("Failed to delete topic");
    }
  };

  const openCreateDifficulty = () => {
    setEditingDifficultyId(null);
    difficultyForm.setFieldsValue({ level: "" });
    setDifficultyModalOpen(true);
  };

  const openEditDifficulty = (row: DifficultyItem) => {
    setEditingDifficultyId(row.id);
    difficultyForm.setFieldsValue({ level: row.level });
    setDifficultyModalOpen(true);
  };

  const handleDifficultySubmit = async (values: DifficultyFormValues) => {
    const normalizedLevel = values.level.trim();
    if (!normalizedLevel) {
      message.error("Please provide a difficulty name");
      return;
    }

    setDifficultySaving(true);
    try {
      if (editingDifficultyId) {
        const res = await apiClient.put<DifficultyMutationResponse>(
          API_ENDPOINTS.difficultyLevels.byId(editingDifficultyId),
          { level: normalizedLevel }
        );
        const updated = res.data?.data;
        if (updated) {
          const mapped = mapDifficulty(updated);
          setDifficulties((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
        } else {
          await fetchDifficulties();
        }
        message.success(`Difficulty "${normalizedLevel}" updated`);
      } else {
        const res = await apiClient.post<DifficultyMutationResponse>(API_ENDPOINTS.difficultyLevels.create, {
          level: normalizedLevel,
        });
        const created = res.data?.data;
        if (created) {
          const mapped = mapDifficulty(created);
          setDifficulties((prev) => {
            if (prev.some((item) => item.id === mapped.id)) return prev;
            return [mapped, ...prev];
          });
        } else {
          await fetchDifficulties();
        }
        message.success(`Difficulty "${normalizedLevel}" added`);
      }

      setDifficultyModalOpen(false);
      difficultyForm.resetFields();
      setEditingDifficultyId(null);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : `Failed to ${editingDifficultyId ? "update" : "add"} difficulty`;
      message.error(apiMessage);
    } finally {
      setDifficultySaving(false);
    }
  };

  const handleDeleteDifficulty = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.difficultyLevels.byId(id));
      setDifficulties((prev) => prev.filter((item) => item.id !== id));
      message.success("Difficulty deleted");
    } catch {
      message.error("Failed to delete difficulty");
    }
  };

  const openCreateQuestion = () => {
    setEditingQuestionId(null);
    questionForm.setFieldsValue({ count: 20 });
    setQuestionModalOpen(true);
  };

  const openEditQuestion = (row: QuestionCountItem) => {
    setEditingQuestionId(row.id);
    questionForm.setFieldsValue({ count: row.count });
    setQuestionModalOpen(true);
  };

  const handleQuestionSubmit = async (values: QuestionCountFormValues) => {
    setQuestionSaving(true);
    try {
      const count = Number(values.count);

      if (editingQuestionId) {
        const res = await apiClient.put<QuestionCountMutationResponse>(
          API_ENDPOINTS.questionCounts.byId(editingQuestionId),
          { count }
        );
        const updated = res.data?.data;
        if (updated) {
          const mapped = mapQuestionCount(updated);
          setQuestionCounts((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
        } else {
          await fetchQuestionCounts();
        }
        message.success(`Question count "${count}" updated`);
      } else {
        const res = await apiClient.post<QuestionCountMutationResponse>(API_ENDPOINTS.questionCounts.create, {
          count,
        });
        const created = res.data?.data;
        if (created) {
          const mapped = mapQuestionCount(created);
          setQuestionCounts((prev) => {
            if (prev.some((item) => item.id === mapped.id)) return prev;
            return [...prev, mapped].sort((a, b) => a.count - b.count);
          });
        } else {
          await fetchQuestionCounts();
        }
        message.success(`Question count "${count}" added`);
      }

      setQuestionModalOpen(false);
      questionForm.resetFields();
      setEditingQuestionId(null);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : `Failed to ${editingQuestionId ? "update" : "add"} question count`;
      message.error(apiMessage);
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.questionCounts.byId(id));
      setQuestionCounts((prev) => prev.filter((item) => item.id !== id));
      message.success("Question count deleted");
    } catch {
      message.error("Failed to delete question count");
    }
  };

  const openCreateQuestionStyle = () => {
    if (!categories.length) {
      message.warning("Create at least one category first.");
      return;
    }
    setEditingQuestionStyleId(null);
    questionStyleForm.setFieldsValue({
      style: "",
      categoryId: categories[0].id,
    });
    setQuestionStyleModalOpen(true);
  };

  const openEditQuestionStyle = (row: QuestionStyleItem) => {
    setEditingQuestionStyleId(row.id);
    questionStyleForm.setFieldsValue({
      style: row.style,
      categoryId: row.categoryId,
    });
    setQuestionStyleModalOpen(true);
  };

  const handleQuestionStyleSubmit = async (values: QuestionStyleFormValues) => {
    const parsedStyles = values.style
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!parsedStyles.length) return;

    setQuestionStyleSaving(true);
    try {
      if (editingQuestionStyleId) {
        const style = parsedStyles[0];
        const res = await apiClient.put<QuestionStyleMutationResponse>(
          API_ENDPOINTS.questionStyles.byId(editingQuestionStyleId),
          { style, categoryId: values.categoryId }
        );
        const updated = res.data?.data;
        if (updated) {
          const mapped = mapQuestionStyle(updated);
          setQuestionStyles((prev) => prev.map((item) => (item.id === mapped.id ? mapped : item)));
        } else {
          await fetchQuestionStyles();
        }
        message.success(`Question style "${style}" updated`);
      } else {
        const res = await apiClient.post<QuestionStyleMutationResponse>(API_ENDPOINTS.questionStyles.create, {
          styles: Array.from(new Set(parsedStyles)),
          categoryId: values.categoryId,
        });
        const createdRaw = res.data?.data;
        const createdList = Array.isArray(createdRaw)
          ? createdRaw
          : createdRaw
          ? [createdRaw]
          : [];
        if (createdList.length) {
          const mappedList = createdList.map(mapQuestionStyle);
          setQuestionStyles((prev) => {
            const byId = new Map(prev.map((item) => [item.id, item]));
            mappedList.forEach((item) => byId.set(item.id, item));
            return Array.from(byId.values()).sort(
              (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
            );
          });
        } else {
          await fetchQuestionStyles();
        }
        message.success(
          `${Array.from(new Set(parsedStyles)).length} question style${parsedStyles.length > 1 ? "s" : ""} added`
        );
      }

      setQuestionStyleModalOpen(false);
      questionStyleForm.resetFields();
      setEditingQuestionStyleId(null);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : `Failed to ${editingQuestionStyleId ? "update" : "add"} question style`;
      message.error(apiMessage);
    } finally {
      setQuestionStyleSaving(false);
    }
  };

  const handleDeleteQuestionStyle = async (id: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.questionStyles.byId(id));
      setQuestionStyles((prev) => prev.filter((item) => item.id !== id));
      message.success("Question style deleted");
    } catch {
      message.error("Failed to delete question style");
    }
  };

  const openCreateSubject = () => {
    setEditingSubjectId(null);
    subjectForm.resetFields();
    setSubjectModalOpen(true);
  };

  const openEditSubject = (row: SubjectItem) => {
    setEditingSubjectId(row.id);
    subjectForm.setFieldsValue({ name: row.name, description: row.description });
    setSubjectModalOpen(true);
  };

  const handleSubjectSubmit = async (values: SubjectFormValues) => {
    const name = values.name.trim();
    if (!name) return;

    setSubjectSaving(true);
    const updatedAt = nowIso();

    setSubjects((prev) => {
      if (editingSubjectId) {
        return prev.map((item) =>
          item.id === editingSubjectId
            ? { ...item, name, description: values.description?.trim() || "", updatedAt }
            : item
        );
      }

      const duplicate = prev.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (duplicate) {
        message.error(`Subject "${name}" already exists`);
        return prev;
      }

      return [
        { id: generateId(), name, description: values.description?.trim() || "", updatedAt },
        ...prev,
      ];
    });

    setSubjectSaving(false);
    setSubjectModalOpen(false);
    subjectForm.resetFields();
    setEditingSubjectId(null);
    message.success(`Subject ${editingSubjectId ? "updated" : "added"}`);
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((item) => item.id !== id));
    message.success("Subject deleted");
  };

  const openCreateExam = () => {
    setEditingExamSlug(null);
    examForm.setFieldsValue({
      name: "",
      slug: "",
      description: "",
      stages: [{ slug: "", name: "", durationMinutes: 60, questionCount: 100, totalMarks: 100 }],
      isActive: true,
      displayOrder: exams.length,
      negativeMarking: { enabled: true, perWrongAnswer: 0.25 },
      totalQuestions: 100,
    });
    setExamModalOpen(true);
  };

  const openEditExam = (row: ExamItem) => {
    setEditingExamSlug(row.slug);
    examForm.setFieldsValue({
      name: row.name,
      slug: row.slug,
      description: row.description || "",
      stages: row.stages.length > 0 ? row.stages : [{ slug: "", name: "", durationMinutes: 60, questionCount: 100, totalNumber: 100 }],
      isActive: row.isActive ?? true,
      displayOrder: row.displayOrder ?? 0,
      negativeMarking: row.negativeMarking || { enabled: true, perWrongAnswer: 0.25 },
      totalQuestions: row.totalQuestions || 100,
    });
    setExamModalOpen(true);
  };

  const handleExamSubmit = async (values: ExamFormValues) => {
    const name = values.name.trim();
    const slug = values.slug.trim().toLowerCase().replace(/\s+/g, "-");
    
    if (!name || !slug) {
      message.error("Please provide exam name and slug");
      return;
    }

    const payload = {
      name,
      slug,
      description: values.description?.trim() || "",
      stages: values.stages?.filter(s => s.name && s.slug) || [],
      isActive: values.isActive ?? true,
      displayOrder: values.displayOrder ?? 0,
      totalQuestions: values.totalQuestions || 100,
    };

    setExamSaving(true);
    try {
      if (editingExamSlug) {
        await apiClient.put<ExamMutationResponse>(API_ENDPOINTS.exams.byId(editingExamSlug), payload);
        message.success(`Exam "${name}" updated`);
      } else {
        await apiClient.post<ExamMutationResponse>(API_ENDPOINTS.exams.create, payload);
        message.success(`Exam "${name}" added`);
      }
      await fetchExams();
      setExamModalOpen(false);
      examForm.resetFields();
      setEditingExamSlug(null);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : `Failed to ${editingExamSlug ? "update" : "add"} exam`;

      message.error(apiMessage);
    } finally {
      setExamSaving(false);
    }
  };

  const handleDeleteExam = async (slug: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.exams.byId(slug));
      setExams((prev) => prev.filter((item) => item.slug !== slug));
      message.success("Exam deleted");
    } catch {
      message.error("Failed to delete exam");
    }
  };

  const openHierarchyModal = () => {
    const source = hierarchyNodes.length ? hierarchyNodes : DEFAULT_GOV_HIERARCHY;
    setHierarchyJsonText(JSON.stringify(source, null, 2));
    setHierarchyModalOpen(true);
  };

  const handleSaveHierarchy = () => {
    setHierarchySaving(true);
    try {
      const parsed = JSON.parse(hierarchyJsonText);
      const validated = validateHierarchyNodes(parsed);
      void (async () => {
        try {
          const res = await apiClient.put<ExamHierarchyResponse>(API_ENDPOINTS.examHierarchy.upsert, {
            name: "Government Exams",
            tree: validated,
          });
          const savedTree = res.data?.data?.tree;
          const nextTree = Array.isArray(savedTree) ? validateHierarchyNodes(savedTree) : validated;
          setHierarchyNodes(nextTree);
          window.localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(nextTree));
          setHierarchyModalOpen(false);
          message.success("Hierarchy saved successfully");
        } catch {
          setHierarchyNodes(validated);
          window.localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(validated));
          setHierarchyModalOpen(false);
          message.warning("Saved locally. API save failed.");
        } finally {
          setHierarchySaving(false);
        }
      })();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Invalid hierarchy JSON";
      message.error(msg);
      setHierarchySaving(false);
    }
  };

  const categoryColumns: ColumnsType<CategoryItem> = [
    {
      title: "Category name",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 210,
      render: (value?: string) => formatDateTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEditCategory(row)}>
            Edit
          </Button>
          <Popconfirm title="Delete category?" onConfirm={() => void handleDeleteCategory(row.id)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const topicColumns: ColumnsType<TopicItem> = [
    {
      title: "Topic title",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      width: 180,
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (value?: string) => value || "-",
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 210,
      render: (value?: string) => formatDateTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, row) => (
        <Popconfirm title="Delete topic?" onConfirm={() => void handleDeleteTopic(row.id)}>
          <Button size="small" danger>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const difficultyColumns: ColumnsType<DifficultyItem> = [
    {
      title: "Difficulty",
      dataIndex: "level",
      key: "level",
      render: (value: DifficultyLevel) => <Tag color={difficultyColor(value)}>{value}</Tag>,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 210,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEditDifficulty(row)}>
            Edit
          </Button>
          <Popconfirm title="Delete difficulty?" onConfirm={() => handleDeleteDifficulty(row.id)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const questionColumns: ColumnsType<QuestionCountItem> = [
    {
      title: "Number of questions",
      dataIndex: "count",
      key: "count",
      width: 180,
      render: (value: number) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 210,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEditQuestion(row)}>
            Edit
          </Button>
          <Popconfirm title="Delete question item?" onConfirm={() => handleDeleteQuestion(row.id)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const questionStyleColumns: ColumnsType<QuestionStyleItem> = [
    {
      title: "Question style",
      dataIndex: "style",
      key: "style",
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 180,
      render: (value: string) => <Tag color="geekblue">{categoryNameById.get(value) || "Unknown"}</Tag>,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 210,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEditQuestionStyle(row)}>
            Edit
          </Button>
          <Popconfirm title="Delete question style?" onConfirm={() => handleDeleteQuestionStyle(row.id)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const subjectColumns: ColumnsType<SubjectItem> = [
    {
      title: "Subject",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (value?: string) => value || "-",
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 210,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEditSubject(row)}>
            Edit
          </Button>
          <Popconfirm title="Delete subject?" onConfirm={() => handleDeleteSubject(row.id)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const examColumns: ColumnsType<ExamItem> = [
    {
      title: "Exam",
      dataIndex: "name",
      key: "name",
      render: (value: string, row) => (
        <Space>
          <Typography.Text strong>{value}</Typography.Text>
          {!row.isActive && <Tag color="red">Inactive</Tag>}
        </Space>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 120,
      render: (value: string) => <Tag color="geekblue">{value}</Tag>,
    },
    {
      title: "Total",
      dataIndex: "totalQuestions",
      key: "totalQuestions",
      width: 80,
      align: "center",
      render: (value?: number) => value || "-",
    },
    {
      title: "Stages",
      dataIndex: "stages",
      key: "stages",
      render: (stages: ExamStageItem[]) => (
        <Space wrap>
          {stages?.map((stage) => (
            <Tag key={stage.slug} color="blue">{stage.name} ({stage.totalMarks || stage.questionCount || 0} marks)</Tag>
          )) || "-"}
        </Space>
      ),
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (value?: string) => formatDateTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEditExam(row)}>
            Edit
          </Button>
          <Popconfirm title="Delete exam?" onConfirm={() => void handleDeleteExam(row.slug)}>
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const hierarchyColumns: ColumnsType<HierarchyRow> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (value: string, row) => (
        <Space size={8}>
          <Tag color="blue">L{row.level}</Tag>
          <Typography.Text strong>{value}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 130,
      render: (value: string) => <Tag color="geekblue">{value}</Tag>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      width: 180,
      render: (value: string) => (value ? <Tag color="purple">{value}</Tag> : "-"),
    },
    {
      title: "Hierarchy Path",
      dataIndex: "path",
      key: "path",
      render: (value: string) => <Typography.Text type="secondary">{value}</Typography.Text>,
    },
  ];

  const totalQuestions = useMemo(
    () => questionCounts.reduce((sum, item) => sum + item.count, 0),
    [questionCounts]
  );

  const managerTitle =
    activeManager === "category"
      ? "Category Manager"
      : activeManager === "topics"
      ? "Topic Manager"
      : activeManager === "questionStyles"
      ? "Question Style Manager"
      : activeManager === "difficulty"
      ? "Difficulty Manager"
      : activeManager === "questions"
      ? "Number of question Manager"
      : activeManager === "subjects"
      ? "Subject Manager"
      : activeManager === "exams"
      ? "Exam Manager"
      : activeManager === "hierarchy"
      ? "Exam Hierarchy Manager"
      : "Stats";

  const managerDescription =
    activeManager === "category"
      ? "Create and maintain AI test categories from API-backed data."
      : activeManager === "topics"
      ? "Create topic titles under a selected category."
      : activeManager === "questionStyles"
      ? "Create styles like MCQ, Output Based, and Problem Solving linked to categories."
      : activeManager === "difficulty"
      ? "Create your own difficulty levels."
      : activeManager === "questions"
      ? "Create and manage question-count presets."
      : activeManager === "subjects"
      ? "Maintain test subjects and short descriptions."
      : activeManager === "exams"
      ? "Create exams with stages like Prelims, Mains, Tier 1, Tier 2, etc."
      : activeManager === "hierarchy"
      ? "Import and manage full exam hierarchy JSON for government exam structures."
      : "Live summary of configured metadata resources.";

  const addButton =
    activeManager === "category" ? (
      <Button type="primary" onClick={openCreateCategory}>
        Add Category
      </Button>
    ) : activeManager === "topics" ? (
      <Button type="primary" onClick={openCreateTopic}>
        Add Topic
      </Button>
    ) : activeManager === "questionStyles" ? (
      <Button type="primary" onClick={openCreateQuestionStyle}>
        Add Question Style
      </Button>
    ) : activeManager === "difficulty" ? (
      <Button type="primary" onClick={openCreateDifficulty}>
        Add Difficulty
      </Button>
    ) : activeManager === "questions" ? (
      <Button type="primary" onClick={openCreateQuestion}>
        Add Number of question
      </Button>
    ) : activeManager === "subjects" ? (
      <Button type="primary" onClick={openCreateSubject}>
        Add Subject
      </Button>
    ) : activeManager === "exams" ? (
      <Button type="primary" onClick={openCreateExam}>
        Add Exam
      </Button>
    ) : activeManager === "hierarchy" ? (
      <Button type="primary" onClick={openHierarchyModal}>
        Import / Edit Hierarchy JSON
      </Button>
    ) : null;

  const handleManagerSelect = (key: ManageKey) => {
    setActiveManager(key);
    if (key === "topics") {
      openCreateTopic();
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>
          <ManagePanel onSelect={handleManagerSelect} />

          <div
            style={{
              flex: 1,
              minWidth: 360,
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              <div>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {managerTitle}
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {managerDescription}
                </Typography.Paragraph>
              </div>
              {addButton}
            </div>

            {activeManager === "category" && (
              <Table
                rowKey="id"
                dataSource={categories}
                columns={categoryColumns}
                loading={loadingCategories}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{ emptyText: "No categories found yet" }}
              />
            )}

            {activeManager === "topics" && (
              <Table
                rowKey="id"
                dataSource={topics}
                columns={topicColumns}
                loading={loadingTopics}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{ emptyText: "No topics found yet" }}
              />
            )}

            {activeManager === "difficulty" && (
              <Table
                rowKey="id"
                dataSource={difficulties}
                columns={difficultyColumns}
                loading={loadingDifficulties}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{ emptyText: "No difficulty levels configured" }}
              />
            )}

            {activeManager === "questionStyles" && (
              <Table
                rowKey="id"
                dataSource={questionStyles}
                columns={questionStyleColumns}
                loading={loadingQuestionStyles}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{ emptyText: "No question styles configured" }}
              />
            )}

            {activeManager === "questions" && (
              <Table
                rowKey="id"
                dataSource={questionCounts}
                columns={questionColumns}
                loading={loadingQuestionCounts}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{ emptyText: "No question-count items configured" }}
              />
            )}

            {activeManager === "subjects" && (
              <Table
                rowKey="id"
                dataSource={subjects}
                columns={subjectColumns}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{ emptyText: "No subjects configured" }}
              />
            )}

            {activeManager === "exams" && (
              <Table
                rowKey="slug"
                dataSource={exams}
                columns={examColumns}
                loading={loadingExams}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                locale={{ emptyText: "No exams configured. Add an exam to get started." }}
              />
            )}

            {activeManager === "hierarchy" && (
              <Table
                rowKey="key"
                dataSource={hierarchyToRows(hierarchyNodes)}
                columns={hierarchyColumns}
                pagination={false}
                expandable={{ defaultExpandAllRows: true }}
                locale={{ emptyText: "No hierarchy configured yet" }}
              />
            )}

            {activeManager === "analytics" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  <Typography.Text type="secondary">Exams</Typography.Text>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{exams.length}</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  <Typography.Text type="secondary">Categories</Typography.Text>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{categories.length}</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  <Typography.Text type="secondary">Difficulties</Typography.Text>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{difficulties.length}</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  <Typography.Text type="secondary">Topics</Typography.Text>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{topics.length}</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  <Typography.Text type="secondary">Question Styles</Typography.Text>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{questionStyles.length}</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  <Typography.Text type="secondary">Subjects</Typography.Text>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{subjects.length}</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  <Typography.Text type="secondary">Hierarchy Roots</Typography.Text>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{hierarchyNodes.length}</div>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
                  <Typography.Text type="secondary">Total Questions</Typography.Text>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{totalQuestions}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        title={editingCategoryId ? "Edit Category" : "Add AI Test Category"}
        open={categoryModalOpen}
        okText={editingCategoryId ? "Update" : "Save category"}
        confirmLoading={categorySaving}
        onOk={() => categoryForm.submit()}
        onCancel={() => setCategoryModalOpen(false)}
      >
        <Form form={categoryForm} layout="vertical" onFinish={handleCategorySubmit}>
          <Form.Item
            name="name"
            label="Category name"
            rules={[{ required: true, message: "Please provide a category name." }]}
          >
            <Input placeholder="e.g. Critical Care Scenarios" maxLength={120} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Add Topic"
        open={topicModalOpen}
        okText="Save topic"
        confirmLoading={topicSaving}
        onOk={() => topicForm.submit()}
        onCancel={() => setTopicModalOpen(false)}
      >
        <Form form={topicForm} layout="vertical" onFinish={handleTopicSubmit}>
          <Form.Item
            name="categoryId"
            label="Select category"
            rules={[{ required: true, message: "Please select a category." }]}
          >
            <Select
              placeholder="Choose category"
              options={categories.map((item) => ({ label: item.name, value: item.id }))}
            />
          </Form.Item>
          <Form.Item
            name="titles"
            label="Topic title(s)"
            rules={[{ required: true, message: "Please provide at least one topic title." }]}
          >
            <Input.TextArea
              rows={4}
              placeholder={"One per line or comma separated\nEvent Loop\nEvent Delegation\nPromise"}
            />
          </Form.Item>
          <Form.Item name="description" label="Description (optional)">
            <Input.TextArea rows={3} placeholder="Applied to all newly created topics in this submission" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingDifficultyId ? "Edit Difficulty" : "Add Difficulty"}
        open={difficultyModalOpen}
        okText={editingDifficultyId ? "Update" : "Save"}
        confirmLoading={difficultySaving}
        onOk={() => difficultyForm.submit()}
        onCancel={() => setDifficultyModalOpen(false)}
      >
        <Form form={difficultyForm} layout="vertical" onFinish={handleDifficultySubmit}>
          <Form.Item
            name="level"
            label="Difficulty"
            rules={[{ required: true, message: "Please provide difficulty name" }]}
          >
            <Input placeholder="e.g. Expert Plus, Case-based, Oral Viva" maxLength={60} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingQuestionStyleId ? "Edit Question Style" : "Add Question Style"}
        open={questionStyleModalOpen}
        okText={editingQuestionStyleId ? "Update" : "Save"}
        confirmLoading={questionStyleSaving}
        onOk={() => questionStyleForm.submit()}
        onCancel={() => setQuestionStyleModalOpen(false)}
      >
        <Form form={questionStyleForm} layout="vertical" onFinish={handleQuestionStyleSubmit}>
          <Form.Item
            name="categoryId"
            label="Select category"
            rules={[{ required: true, message: "Please select a category." }]}
          >
            <Select
              placeholder="Choose category"
              options={categories.map((item) => ({ label: item.name, value: item.id }))}
            />
          </Form.Item>
          <Form.Item
            name="style"
            label="Question style(s)"
            rules={[{ required: true, message: "Please provide question style(s)." }]}
          >
            <Input.TextArea rows={3} placeholder={"Comma/new line separated\nMCQ, IO"} maxLength={240} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingQuestionId ? "Edit Number of question" : "Add Number of question"}
        open={questionModalOpen}
        okText={editingQuestionId ? "Update" : "Save"}
        confirmLoading={questionSaving}
        onOk={() => questionForm.submit()}
        onCancel={() => setQuestionModalOpen(false)}
      >
        <Form form={questionForm} layout="vertical" onFinish={handleQuestionSubmit}>
          <Form.Item
            name="count"
            label="Number of question"
            rules={[{ required: true, message: "Please provide number of question" }]}
          >
            <InputNumber min={1} max={500} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingSubjectId ? "Edit Subject" : "Add Subject"}
        open={subjectModalOpen}
        okText={editingSubjectId ? "Update" : "Save"}
        confirmLoading={subjectSaving}
        onOk={() => subjectForm.submit()}
        onCancel={() => setSubjectModalOpen(false)}
      >
        <Form form={subjectForm} layout="vertical" onFinish={handleSubjectSubmit}>
          <Form.Item name="name" label="Subject name" rules={[{ required: true, message: "Please provide a subject name." }]}>
            <Input placeholder="e.g. Critical Care" maxLength={120} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional short description" maxLength={240} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Import / Edit Exam Hierarchy JSON"
        open={hierarchyModalOpen}
        okText="Save Hierarchy"
        confirmLoading={hierarchySaving}
        onOk={handleSaveHierarchy}
        onCancel={() => setHierarchyModalOpen(false)}
        width={860}
      >
        <Typography.Paragraph type="secondary">
          Paste a JSON array with nested <code>id</code>, <code>title</code>, optional <code>slug</code>, and optional <code>children</code>.
        </Typography.Paragraph>
        <Input.TextArea
          rows={18}
          value={hierarchyJsonText}
          onChange={(e) => setHierarchyJsonText(e.target.value)}
          placeholder='[{"id":1,"title":"Government Exams","children":[...]}]'
        />
      </Modal>

      <Modal
        title={editingExamSlug ? "Edit Exam" : "Add Exam"}
        open={examModalOpen}
        okText={editingExamSlug ? "Update" : "Save"}
        confirmLoading={examSaving}
        onOk={() => examForm.submit()}
        onCancel={() => setExamModalOpen(false)}
        width={700}
      >
        <Form form={examForm} layout="vertical" onFinish={handleExamSubmit}>
          <Form.Item
            name="name"
            label="Exam Name"
            rules={[{ required: true, message: "Please provide exam name" }]}
          >
            <Input placeholder="e.g. SSC CGL" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: "Please provide slug" }]}
            extra="URL-friendly name (lowercase, hyphens only)"
          >
            <Input placeholder="e.g. ssc-cgl" disabled={!!editingExamSlug} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Optional description" maxLength={500} />
          </Form.Item>
          <Form.Item name="isActive" label="Status" valuePropName="checked">
            <Checkbox>Active</Checkbox>
          </Form.Item>
          <Form.Item name="totalQuestions" label="Total Questions" tooltip="Total number of questions for this exam">
            <InputNumber min={1} max={1000} style={{ width: 150 }} />
          </Form.Item>
          <Divider orientation="left">Negative Marking</Divider>
          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.negativeMarking?.enabled !== curr.negativeMarking?.enabled}>
            {({ getFieldValue }) => (
              <Space>
                <Form.Item name={['negativeMarking', 'enabled']} valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Checkbox>Enable Negative Marking</Checkbox>
                </Form.Item>
                {getFieldValue(['negativeMarking', 'enabled']) && (
                  <Form.Item
                    name={['negativeMarking', 'perWrongAnswer']}
                    label="Deduction per wrong answer"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      min={0}
                      max={1}
                      step={0.05}
                      precision={2}
                      placeholder="e.g. 0.25"
                      style={{ width: 120 }}
                    />
                  </Form.Item>
                )}
              </Space>
            )}
          </Form.Item>
          <Divider orientation="left">Stages</Divider>
          <Form.List name="stages">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label="Stage Name"
                      rules={[{ required: true, message: 'Required' }]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="e.g. Prelims" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'slug']}
                      label="Slug"
                      rules={[{ required: true, message: 'Required' }]}
                      style={{ flex: 1, marginBottom: 0 }}
                    >
                      <Input placeholder="e.g. prelims" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'totalMarks']}
                      label="Total Marks"
                      style={{ flex: 0.5, marginBottom: 0 }}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'questionCount']}
                      label="Questions"
                      style={{ flex: 0.5, marginBottom: 0 }}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'durationMinutes']}
                      label="Duration (min)"
                      style={{ flex: 0.5, marginBottom: 0 }}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)}>Remove</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add({ slug: '', name: '', durationMinutes: 60, questionCount: 100, totalMarks: 100 })} block>
                  + Add Stage
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </>
  );
}
