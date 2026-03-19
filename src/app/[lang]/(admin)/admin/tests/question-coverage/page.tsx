"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, Col, InputNumber, Progress, Row, Select, Table, Tag, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import { GOV_EXAMS } from "@/lib/mockTestBuilder";

const { Title, Text } = Typography;

type DifficultyRow = {
  difficulty: string;
  target: number;
  availableAll: number;
  availableApproved: number;
  gapAll: number;
  gapApproved: number;
};

type SectionDifficultyRow = {
  sectionKey: string;
  sectionLabel: string;
  difficulty: string;
  target: number;
  availableAll: number;
  availableApproved: number;
  gapAll: number;
  gapApproved: number;
};

type SummaryData = {
  totalTarget: number;
  totalAvailableAll: number;
  totalAvailableApproved: number;
  completionAllPct: number;
  completionApprovedPct: number;
  approvedOnlyServing: boolean;
};

export default function QuestionCoveragePage() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang || "en";
  const [examSlug, setExamSlug] = useState("ssc-cgl");
  const [stageSlug, setStageSlug] = useState("tier-1");
  const [isLoading, setIsLoading] = useState(false);
  const [hasBlueprint, setHasBlueprint] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [byDifficulty, setByDifficulty] = useState<DifficultyRow[]>([]);
  const [sectionDifficulty, setSectionDifficulty] = useState<SectionDifficultyRow[]>([]);
  const [isGeneratingJobs, setIsGeneratingJobs] = useState(false);
  const [targetMultiplier, setTargetMultiplier] = useState(1);
  const [gapBasis, setGapBasis] = useState<"approved" | "all">("approved");

  const buildReviewHref = (sectionKey?: string) => {
    const base = `/${lang}/admin/tests/question-review?scope=global&reviewStatus=draft&examSlug=${encodeURIComponent(examSlug)}&stageSlug=${encodeURIComponent(stageSlug)}`;
    const normalizedSection = String(sectionKey || "").trim().toLowerCase();
    if (!normalizedSection || normalizedSection === "unmapped" || normalizedSection === "mixed") {
      return base;
    }
    return `${base}&search=${encodeURIComponent(sectionKey || "")}`;
  };

  const stageOptions = useMemo(() => {
    const exam = GOV_EXAMS.find((item) => item.slug === examSlug);
    return (exam?.stages || []).map((stage) => ({ label: `${stage.name} (${stage.slug})`, value: stage.slug }));
  }, [examSlug]);

  const loadCoverage = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(API_ENDPOINTS.questionBank.coverage, {
        params: { examSlug, stageSlug },
      });
      const payload = response.data?.data;
      setHasBlueprint(Boolean(payload?.hasBlueprint));
      setMessageText(String(payload?.message || ""));
      setSummary(payload?.summary || null);
      setByDifficulty(Array.isArray(payload?.byDifficulty) ? payload.byDifficulty : []);
      setSectionDifficulty(Array.isArray(payload?.sectionDifficulty) ? payload.sectionDifficulty : []);
    } catch {
      message.error("Unable to load coverage snapshot.");
    } finally {
      setIsLoading(false);
    }
  };

  const buildGapJobPayload = (row: SectionDifficultyRow) => {
    const rowTarget = Number(row.target || 0);
    const plannedTarget = Math.max(0, Math.round(rowTarget * targetMultiplier));
    const available = gapBasis === "approved" ? Number(row.availableApproved || 0) : Number(row.availableAll || 0);
    const totalQuestions = Math.max(1, plannedTarget - available);
    return {
      provider: "openai",
      totalQuestions,
      batchSize: Math.min(50, Math.max(5, totalQuestions)),
      maxRetries: 2,
      payload: {
        testId: `gap-${examSlug}-${stageSlug}-${row.sectionKey}-${row.difficulty}`,
        testTitle: `${examSlug} ${stageSlug} gap fill - ${row.sectionLabel} (${row.difficulty}) x${targetMultiplier}`,
        domain: `Government Exam - ${examSlug}`,
        attemptMode: "exam",
        difficulty: row.difficulty,
        topics: [row.sectionLabel, row.sectionKey, "gap-fill"],
        questionStyles: ["Single Correct MCQ", "Statement Based MCQ"],
        examSlug,
        stageSlug,
        promptContext: `Generate ${totalQuestions} realistic ${examSlug} ${stageSlug} questions for section ${row.sectionLabel} at ${row.difficulty} level. Gap basis=${gapBasis}. Avoid duplicates and keep exam-like distractors.`,
      },
    };
  };

  const createGapJob = async (row: SectionDifficultyRow) => {
    const rowTarget = Number(row.target || 0);
    const plannedTarget = Math.max(0, Math.round(rowTarget * targetMultiplier));
    const available = gapBasis === "approved" ? Number(row.availableApproved || 0) : Number(row.availableAll || 0);
    const gap = Math.max(0, plannedTarget - available);
    if (gap <= 0) {
      message.info(`No ${gapBasis} gap for this bucket at x${targetMultiplier} target.`);
      return;
    }
    try {
      await apiClient.post(API_ENDPOINTS.aiGenerationJobs.create, buildGapJobPayload(row));
      message.success(`Job created for ${row.sectionLabel} (${row.difficulty}) gap ${gap}.`);
    } catch {
      message.error("Failed to create generation job.");
    }
  };

  const createAllGapJobs = async () => {
    const gapRows = sectionDifficulty.filter((row) => {
      const rowTarget = Number(row.target || 0);
      const plannedTarget = Math.max(0, Math.round(rowTarget * targetMultiplier));
      const available = gapBasis === "approved" ? Number(row.availableApproved || 0) : Number(row.availableAll || 0);
      return plannedTarget - available > 0;
    });
    if (gapRows.length === 0) {
      message.info(`No ${gapBasis} gaps found for x${targetMultiplier} target.`);
      return;
    }
    setIsGeneratingJobs(true);
    let successCount = 0;
    let failCount = 0;
    for (const row of gapRows) {
      try {
        await apiClient.post(API_ENDPOINTS.aiGenerationJobs.create, buildGapJobPayload(row));
        successCount += 1;
      } catch {
        failCount += 1;
      }
    }
    setIsGeneratingJobs(false);
    if (failCount === 0) {
      message.success(`Created ${successCount} gap-fill jobs.`);
    } else {
      message.warning(`Created ${successCount} jobs, ${failCount} failed.`);
    }
  };

  const difficultyColumns: ColumnsType<DifficultyRow> = [
    { title: "Difficulty", dataIndex: "difficulty", width: 120, render: (v) => <Tag>{v}</Tag> },
    { title: "Base Target", dataIndex: "target", width: 100 },
    {
      title: "Planned Target",
      key: "plannedTarget",
      width: 130,
      render: (_, row) => Math.max(0, Math.round(Number(row.target || 0) * targetMultiplier)),
    },
    { title: "Available (All)", dataIndex: "availableAll", width: 140 },
    { title: "Available (Approved)", dataIndex: "availableApproved", width: 170 },
    {
      title: "Gap (Selected Basis)",
      key: "gapSelected",
      width: 160,
      render: (_, row) => {
        const plannedTarget = Math.max(0, Math.round(Number(row.target || 0) * targetMultiplier));
        const available = gapBasis === "approved" ? Number(row.availableApproved || 0) : Number(row.availableAll || 0);
        const gap = Math.max(0, plannedTarget - available);
        return <Text type={gap > 0 ? "danger" : undefined}>{gap}</Text>;
      },
    },
  ];

  const sectionColumns: ColumnsType<SectionDifficultyRow> = [
    { title: "Section", dataIndex: "sectionLabel", width: 230 },
    { title: "Difficulty", dataIndex: "difficulty", width: 120, render: (v) => <Tag>{v}</Tag> },
    { title: "Base", dataIndex: "target", width: 80 },
    {
      title: "Planned",
      key: "plannedTarget",
      width: 90,
      render: (_, row) => Math.max(0, Math.round(Number(row.target || 0) * targetMultiplier)),
    },
    { title: "All", dataIndex: "availableAll", width: 90 },
    { title: "Approved", dataIndex: "availableApproved", width: 110 },
    {
      title: "Gap",
      key: "gapSelected",
      width: 90,
      render: (_, row) => {
        const plannedTarget = Math.max(0, Math.round(Number(row.target || 0) * targetMultiplier));
        const available = gapBasis === "approved" ? Number(row.availableApproved || 0) : Number(row.availableAll || 0);
        const gap = Math.max(0, plannedTarget - available);
        return <Text type={gap > 0 ? "danger" : undefined}>{gap}</Text>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_, row) => (
        <div className="flex gap-2">
          <Link
            href={buildReviewHref(row.sectionKey)}
          >
            <Button size="small">Review Drafts</Button>
          </Link>
          <Button
            size="small"
            type="primary"
            ghost
            disabled={
              Math.max(
                0,
                Math.round(Number(row.target || 0) * targetMultiplier) -
                  (gapBasis === "approved" ? Number(row.availableApproved || 0) : Number(row.availableAll || 0))
              ) <= 0
            }
            onClick={() => createGapJob(row)}
          >
            Generate Gap
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      <Card>
        <Title level={4} className="!mb-1">
          Question Coverage
        </Title>
        <Text type="secondary">Track target vs available inventory by exam/stage using your blueprint.</Text>
      </Card>

      <Card loading={isLoading}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Text strong>Exam</Text>
            <Select
              className="!mt-1 w-full"
              value={examSlug}
              onChange={(value) => {
                setExamSlug(value);
                const firstStage = GOV_EXAMS.find((exam) => exam.slug === value)?.stages[0];
                if (firstStage) setStageSlug(firstStage.slug);
              }}
              options={GOV_EXAMS.map((exam) => ({ value: exam.slug, label: `${exam.name} (${exam.slug})` }))}
            />
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Stage</Text>
            <Select className="!mt-1 w-full" value={stageSlug} onChange={setStageSlug} options={stageOptions} />
          </Col>
          <Col xs={24} md={8} className="flex items-end">
            <Button type="primary" icon={<ReloadOutlined />} onClick={loadCoverage} loading={isLoading}>
              Load Coverage
            </Button>
          </Col>
        </Row>
        <Row gutter={[12, 12]} className="mt-2">
          <Col xs={24} md={8}>
            <Text strong>Target Multiplier</Text>
            <InputNumber
              className="!mt-1 w-full"
              min={0.5}
              max={20}
              step={0.5}
              value={targetMultiplier}
              onChange={(value) => setTargetMultiplier(Number(value || 1))}
            />
            <Text type="secondary" className="text-xs">
              x1 = blueprint target, x3 = 3 full-paper inventory buffer.
            </Text>
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Gap Basis</Text>
            <Select
              className="!mt-1 w-full"
              value={gapBasis}
              onChange={(value) => setGapBasis(value)}
              options={[
                { value: "approved", label: "Approved only (recommended)" },
                { value: "all", label: "All inventory (draft + approved)" },
              ]}
            />
          </Col>
          <Col xs={24} md={8} className="flex items-end">
            <Link href={`/${lang}/admin/tests/paper-blueprints`}>
              <Button>Set Persistent Target in Blueprint</Button>
            </Link>
          </Col>
        </Row>
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            <Link href={buildReviewHref()}>
              <Button>Open Draft Review Queue</Button>
            </Link>
            <Button type="primary" ghost onClick={createAllGapJobs} loading={isGeneratingJobs}>
              Generate Missing Buckets
            </Button>
          </div>
        </div>

        {!hasBlueprint && messageText && (
          <Alert className="mt-4" showIcon type="warning" message="Blueprint Missing" description={messageText} />
        )}

        {summary && (
          <Row gutter={[12, 12]} className="mt-4">
            <Col xs={24} md={8}>
              <Card size="small">
                <Text type="secondary">Target Questions</Text>
                <Title level={3} className="!mb-0 !mt-1">
                  {summary.totalTarget}
                </Title>
                <Text type="secondary" className="text-xs">
                  Planned: {Math.max(0, Math.round(Number(summary.totalTarget || 0) * targetMultiplier))}
                </Text>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Text type="secondary">Coverage (All)</Text>
                <Title level={3} className="!mb-1 !mt-1">
                  {summary.totalAvailableAll}
                </Title>
                <Progress percent={summary.completionAllPct} size="small" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Text type="secondary">Coverage (Approved)</Text>
                <Title level={3} className="!mb-1 !mt-1">
                  {summary.totalAvailableApproved}
                </Title>
                <Progress percent={summary.completionApprovedPct} size="small" status={summary.completionApprovedPct >= 100 ? "success" : "active"} />
              </Card>
            </Col>
          </Row>
        )}

        <div className="mt-4">
          <Title level={5}>Difficulty Coverage</Title>
          <Table rowKey={(row) => row.difficulty} columns={difficultyColumns} dataSource={byDifficulty} pagination={false} size="small" />
        </div>

        <div className="mt-4">
          <Title level={5}>Section x Difficulty Coverage</Title>
          <Table
            rowKey={(row) => `${row.sectionKey}-${row.difficulty}`}
            columns={sectionColumns}
            dataSource={sectionDifficulty}
            pagination={{ pageSize: 12 }}
            size="small"
          />
        </div>
      </Card>
    </div>
  );
}
