"use client";
import React from "react";
import { Card, List, Button, Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

export default function UpcomingTests({ dict, lang }: any) {
  const upcomingTests = [
    {
      id: 1,
      title: dict?.upcomingTestsData?.cardiologyExam || "Cardiology Final Exam",
      course: dict?.upcomingTestsData?.advancedCardiology || "Advanced Cardiology",
      dueDate: dict?.upcomingTestsData?.jan15 || "2024-01-15",
      duration: dict?.upcomingTestsData?.sixtyMinutes || "60 minutes",
      questions: 50,
      status: dict?.upcomingTestsData?.upcoming || "upcoming",
      priority: "high",
    },
    {
      id: 2,
      title: dict?.upcomingTestsData?.patientSafety || "Patient Safety Assessment",
      course: dict?.upcomingTestsData?.healthProtocols || "Healthcare Protocols",
      dueDate: dict?.upcomingTestsData?.jan18 || "2024-01-18",
      duration: dict?.upcomingTestsData?.fortyFiveMinutes || "45 minutes",
      questions: 30,
      status: dict?.upcomingTestsData?.available || "available",
      priority: "medium",
    },
    {
      id: 3,
      title: dict?.upcomingTestsData?.ethicsQuiz || "Medical Ethics Quiz",
      course: dict?.upcomingTestsData?.profEthics || "Professional Ethics",
      dueDate: dict?.upcomingTestsData?.jan20 || "2024-01-20",
      duration: dict?.upcomingTestsData?.thirtyMinutes || "30 minutes",
      questions: 20,
      status: dict?.upcomingTestsData?.upcoming || "upcoming",
      priority: "low",
    },
  ];

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    const colors = {
      high: "red",
      medium: "orange",
      low: "blue",
    };
    return colors[priority] || "blue";
  };

  return (
    <Card
      title={dict?.upcomingTests?.title || "Upcoming Tests"}
      style={{ borderRadius: 12 }}
    >
      <List
        dataSource={upcomingTests}
        renderItem={(test) => (
          <List.Item
            actions={[
              <Button type="primary" size="small" key="start">
                {dict?.upcomingTests?.startTest || "Start Test"}
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <ClockCircleOutlined
                  style={{ fontSize: 20, color: "#1890ff" }}
                />
              }
              title={
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {test.title}
                  <Tag
                    color={getPriorityColor(
                      test.priority as "high" | "medium" | "low"
                    )}
                    style={{ marginLeft: 8, fontSize: 10 }}
                  >
                    {dict?.upcomingTests?.[test.priority] ||
                      test.priority.charAt(0).toUpperCase() +
                        test.priority.slice(1)}
                  </Tag>
                </div>
              }
              description={
                <div>
                  <div style={{ fontSize: 12 }}>{test.course}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    {dict?.upcomingTests?.due || "Due"}: {test.dueDate} •{" "}
                    {test.duration} • {test.questions}{" "}
                    {dict?.upcomingTests?.questions || "questions"}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
}
