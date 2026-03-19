"use client";
import React from "react";
import { Card, Timeline } from "antd";
import { 
  PlayCircleOutlined, 
  CheckCircleOutlined, 
  FileTextOutlined,
  TrophyOutlined 
} from "@ant-design/icons";

export default function RecentActivity({ dict, lang }: any) {
  const activities = [
    {
      type: "video",
      action: dict?.recentActivityData?.watched || "Watched",
      title: dict?.recentActivityData?.cardiacLecture || "Cardiac Arrhythmias Lecture",
      course: dict?.recentActivityData?.advancedCardiology || "Advanced Cardiology",
      time: dict?.recentActivityData?.twoHoursAgo || "2 hours ago",
      icon: <PlayCircleOutlined style={{ color: "#1890ff" }} />,
      color: "blue"
    },
    {
      type: "test",
      action: dict?.recentActivityData?.completed || "Completed",
      title: dict?.recentActivityData?.emergencyQuiz || "Emergency Medicine Quiz",
      course: dict?.recentActivityData?.emergencyProcedures || "Emergency Procedures",
      time: dict?.recentActivityData?.oneDayAgo || "1 day ago",
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      color: "green"
    },
    {
      type: "certificate",
      action: dict?.recentActivityData?.earned || "Earned",
      title: dict?.recentActivityData?.blsCertificate || "Basic Life Support Certificate",
      course: dict?.recentActivityData?.blsTraining || "BLS Training",
      time: dict?.recentActivityData?.twoDaysAgo || "2 days ago",
      icon: <TrophyOutlined style={{ color: "#faad14" }} />,
      color: "orange"
    },
    {
      type: "material",
      action: dict?.recentActivityData?.downloaded || "Downloaded",
      title: dict?.recentActivityData?.guidelinesPdf || "Clinical Guidelines PDF",
      course: dict?.recentActivityData?.medicalProtocols || "Medical Protocols",
      time: dict?.recentActivityData?.threeDaysAgo || "3 days ago",
      icon: <FileTextOutlined style={{ color: "#722ed1" }} />,
      color: "purple"
    }
  ];

  const timelineItems = activities.map((activity, index) => ({
    key: index,
    color: activity.color,
    dot: activity.icon,
    children: (
      <div>
        <div style={{ fontWeight: 500 }}>
          {activity.action}: {activity.title}
        </div>
        <div style={{ color: "#666", fontSize: 12 }}>
          {activity.course}
        </div>
        <div style={{ color: "#999", fontSize: 11 }}>
          {activity.time}
        </div>
      </div>
    ),
  }));

  return (
    <Card 
      title={dict?.recentActivity?.title || "Recent Activity"} 
      style={{ borderRadius: 12 }}
    >
      <Timeline items={timelineItems} />
    </Card>
  );
}
