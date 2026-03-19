"use client";

import { useState } from "react";
import { Button, Card, Col, Input, Row, Typography, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";

const { TextArea } = Input;
const { Title, Text } = Typography;

type ImportResponse = {
  data?: {
    imported?: number;
    inserted?: number;
    updated?: number;
  };
};

export default function QuestionImportPage() {
  const [examSlug, setExamSlug] = useState("sbi-clerk");
  const [stageSlug, setStageSlug] = useState("prelims");
  const [domain, setDomain] = useState("Government Exam - SBI Clerk");
  const [provider, setProvider] = useState("openai-import");
  const [jsonText, setJsonText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const parseQuestions = () => {
    const parsed = JSON.parse(jsonText);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.questions)) return parsed.questions;
    throw new Error("JSON must be an array or { questions: [] }");
  };

  const handleImport = async () => {
    try {
      const questions = parseQuestions();
      if (!Array.isArray(questions) || questions.length === 0) {
        message.error("No questions found in JSON.");
        return;
      }

      setIsLoading(true);
      const response = await apiClient.post<ImportResponse>(API_ENDPOINTS.questionBank.importJson, {
        examSlug,
        stageSlug,
        domain,
        provider,
        questions,
      });

      const imported = Number(response.data?.data?.imported || 0);
      const inserted = Number(response.data?.data?.inserted || 0);
      const updated = Number(response.data?.data?.updated || 0);
      message.success(`Imported ${imported} questions (inserted: ${inserted}, updated: ${updated}).`);
    } catch (error: unknown) {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: unknown } } }).response?.data?.error === "string"
          ? ((error as { response?: { data?: { error?: string } } }).response?.data?.error as string)
          : "Import failed. Check JSON format and try again.";
      message.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <Title level={4} className="!mb-1">
          Question Bank JSON Import
        </Title>
        <Text type="secondary">Paste OpenAI JSON output and import directly to question bank.</Text>
      </Card>

      <Card>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Text strong>Exam Slug</Text>
            <Input value={examSlug} onChange={(e) => setExamSlug(e.target.value)} placeholder="sbi-clerk" />
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Stage Slug</Text>
            <Input value={stageSlug} onChange={(e) => setStageSlug(e.target.value)} placeholder="prelims" />
          </Col>
          <Col xs={24} md={8}>
            <Text strong>Provider Tag</Text>
            <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="openai-import" />
          </Col>
          <Col xs={24}>
            <Text strong>Domain</Text>
            <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Government Exam - SBI Clerk" />
          </Col>
        </Row>

        <div className="mt-4">
          <Upload
            accept=".json,application/json"
            showUploadList={false}
            beforeUpload={(file) => {
              const reader = new FileReader();
              reader.onload = () => {
                setJsonText(String(reader.result || ""));
                message.success(`Loaded file: ${file.name}`);
              };
              reader.readAsText(file);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />}>Load JSON File</Button>
          </Upload>
        </div>

        <div className="mt-4">
          <Text strong>Question JSON</Text>
          <TextArea
            rows={16}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Paste JSON array or {"questions":[...]}'
          />
        </div>

        <div className="mt-4">
          <Button type="primary" loading={isLoading} onClick={handleImport}>
            Import to Question Bank
          </Button>
        </div>
      </Card>
    </div>
  );
}
