"use client";

import React, { useState, useRef } from "react";
import { Card, Row, Col, Typography, Button, Tag, Tabs } from "antd";
import {
  SmileOutlined,
  WomanOutlined,
  UserOutlined,
  SkinOutlined,
  SoundOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  CodeOutlined,
  PlayCircleOutlined,
  // LeftOutlined,
  // RightOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Carousel } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { allTests, Test } from "@/utils/testData";
import hero from "@/../../public/images/OIP.jpeg";

// ========== Data ==========
const { Title, Paragraph } = Typography;

const domainIcons: Record<string, React.ReactNode> = {
  Dentist: <SmileOutlined/>,
  Gynecologist: <WomanOutlined/>,
  "General Physician": <UserOutlined/>,
  Dermatologist: <SkinOutlined/>,
  "ENT Specialist": <SoundOutlined/>,
  Homoeopath: <ExperimentOutlined/>,
  Ayurveda: <MedicineBoxOutlined/>,
  Programming: <CodeOutlined/>,
  Nurse: <UserOutlined/>,
};

const domainColors: Record<string, string> = {
  Dentist: "#e6f7ff",
  Gynecologist: "#fff0f6",
  "General Physician": "#f6ffed",
  Dermatologist: "#fffbe6",
  "ENT Specialist": "#f9f0ff",
  Homoeopath: "#f0f5ff",
  Ayurveda: "#f6ffed",
  Programming: "#f0f5ff",
  Nurse: "#fff0f6",
};

const trending = [
  "Dentist",
  "Gynecologist",
  "General Physician",
  "Dermatologist",
  "ENT Specialist",
  "Homoeopath",
  "Ayurveda",
  "Programming",
];

// ========== Component ==========
export default function TestsPage() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("doctors");
  const carouselRef = useRef<any>(null);
  const router = useRouter();

  // Filter tests based on active tab
  const getFilteredTests = () => {
    if (activeTab === "doctors") {
      return allTests.filter(
        (test) => test.domain !== "Programming" && test.domain !== "Nurse"
      );
    } else if (activeTab === "programming") {
      return allTests.filter((test) => test.domain === "Programming");
    } else {
      return allTests.filter((test) => test.domain === "Nurse");
    }
  };

  const testData = getFilteredTests();

  const filteredTests = selectedDomain
    ? testData.filter((test) => test.domain === selectedDomain)
    : testData;

  const handleStartTest = (test: Test) => {
    // Store complete test data including questions
    sessionStorage.setItem("currentTest", JSON.stringify(test));
    sessionStorage.removeItem("testResults");
    sessionStorage.removeItem("userAnswers");
    sessionStorage.removeItem("testDifficulty");
    router.push("/tests/difficulty");
  };

  return (
    <div style={{ padding: "40px 80px" }}>
      {/* Hero Section */}
      <Row gutter={32} align="middle" style={{ marginBottom: 60 }}>
        <Col xs={24} md={12} style={{marginTop:"-90px"}}>
          <Title style={{ fontSize: 60, fontWeight: 700 }}>Unlock Perfection</Title>
          <Paragraph style={{ fontSize: 18, color: "#555" }}>
            Solve real-world medical problems & practice tests to get ready for
            your dream healthcare job!
          </Paragraph>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: "center" }}>
          <Image
            src={hero}
            alt="Medical Hero"
            width={330}
            height={200}
            style={{ borderRadius: "10px", marginLeft: "100px" }}
          />
        </Col>
      </Row>

      {/* Trending Domains */}
      <Title level={3} style={{ marginBottom: 30 }}>
        Trending Domains
      </Title>
      <Row
        gutter={[12, 12]}
        style={{
          marginBottom: 50,
          flexWrap: "nowrap",
          overflowX: "auto",
        }}
      >
        {trending.map((item) => (
          <Col key={item}>
            <Tag
              onClick={() => setSelectedDomain(item)}
              color={selectedDomain === item ? "blue" : undefined}
              style={{
                fontSize: 15,
                padding: "12px 12px",
                cursor: "pointer",
                borderRadius: 30,
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: domainColors[item],
              }}
            >
              {domainIcons[item]} {item}
            </Tag>
          </Col>
        ))}
      </Row>

      {/* Mock Tests Section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title
          level={3}
          style={{ margin: 0, fontSize: "40px", fontWeight: "700" }}
        >
          AI-Powered Mock Tests
        </Title>
        {/* <div>
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            onClick={() => carouselRef.current?.prev()}
            style={{ marginRight: 10 }}
          />
          <Button
            shape="circle"
            icon={<RightOutlined />}
            onClick={() => carouselRef.current?.next()}
          />
        </div> */}
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setSelectedDomain(null);
        }}
        items={[
          {
            key: "doctors",
            label: (
              <span
                style={{
                  fontSize: 18,
                  fontWeight: activeTab === "doctors" ? 600 : 400,
                }}
              >
                <UserOutlined /> Doctors & Specialists
              </span>
            ),
          },
          {
            key: "programming",
            label: (
              <span
                style={{
                  fontSize: 18,
                  fontWeight: activeTab === "programming" ? 600 : 400,
                }}
              >
                <CodeOutlined /> Programming
              </span>
            ),
          },
          {
            key: "nursing",
            label: (
              <span
                style={{
                  fontSize: 18,
                  fontWeight: activeTab === "nursing" ? 600 : 400,
                }}
              >
                <UserOutlined /> Nursing
              </span>
            ),
          },
        ]}
        style={{ marginBottom: 30 }}
      />

      {/* Carousel with 4 cards per row */}
      <div className="test-grid-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
          {filteredTests.map((test) => (
            <Card
              key={test.id}
              hoverable
              className="w-full h-full flex flex-col min-h-[480px]"
              cover={
                <div
                  style={{
                    height: 200,
                    background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 60,
                  }}
                >
                  {domainIcons[test.domain]}
                </div>
              }
              actions={[
                <Button
                  key="start-test"
                  type="primary"
                  onClick={() => handleStartTest(test)}
                  icon={<PlayCircleOutlined />}
                  className="w-full flex items-center justify-center gap-2"
                >
                  Start Test
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div className="text-lg font-semibold mb-2 line-clamp-1">
                    {test.title}
                  </div>
                }
                description={
                  <div className="flex flex-col min-h-[150px]">
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {test.desc}
                    </p>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileTextOutlined />
                        <span>{test.totalQuestions} questions</span>
                        <span className="text-gray-300">•</span>
                        <ClockCircleOutlined />
                        <span>{test.duration} mins</span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set(test.questions.map((q) => q.type)))
                          .slice(0, 3)
                          .map((type) => (
                            <Tag
                              key={type}
                              className="text-xs px-2 py-1 rounded-full m-0"
                            >
                              {type}
                            </Tag>
                          ))}
                        {test.questions.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{test.questions.length - 3} more
                          </span>
                        )}
                      </div>

                      <div>
                        <Tag
                          color={
                            test.questions.some((q) => q.difficulty === "hard")
                              ? "red"
                              : test.questions.some(
                                  (q) => q.difficulty === "medium"
                                )
                              ? "orange"
                              : "green"
                          }
                          className="rounded-full px-3 py-1 font-medium"
                        >
                          {test.questions.some((q) => q.difficulty === "hard")
                            ? "Advanced"
                            : test.questions.some(
                                (q) => q.difficulty === "medium"
                              )
                            ? "Intermediate"
                            : "Beginner"}
                        </Tag>
                      </div>
                    </div>
                  </div>
                }
              />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
