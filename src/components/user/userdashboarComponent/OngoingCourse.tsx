"use client";
import React from "react";
import { Card, List, Progress, Button, Tag } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";
import adminImage from '../../../../public/images/admin.jpg';
import cardiologyImage from '../../../../public/images/cardiology.jpg';
import pediatricsImage from '../../../../public/images/artho.jpg';
import Image from "next/image";

export const images = {
  admin: adminImage,
  cardiology: cardiologyImage,
  pediatrics: pediatricsImage,
};

export default function OngoingCourses({ dict, lang }: any) {
  // const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const ongoingCourses = [
    {
      id: 1,
      title: dict?.ongoingCoursesData?.advancedCardiology || "Advanced Cardiology",
      instructor: dict?.ongoingCoursesData?.drSarah || "Dr. Sarah Johnson",
      progress: 65,
      thumbnail: images.admin,
      duration: dict?.ongoingCoursesData?.fourHrThirty || "4h 30m",
      lastAccessed: dict?.ongoingCoursesData?.twoHoursAgo || "2 hours ago",
      nextLesson: dict?.ongoingCoursesData?.heartFailure || "Heart Failure Management",
    },
    {
      id: 2,
      title: dict?.ongoingCoursesData?.emergencyMedicine || "Emergency Medicine",
      instructor: dict?.ongoingCoursesData?.drMike || "Dr. Mike Chen",
      progress: 30,
      thumbnail: images.cardiology,
      duration: dict?.ongoingCoursesData?.sixHrFifteen || "6h 15m",
      lastAccessed: dict?.ongoingCoursesData?.oneDayAgo || "1 day ago",
      nextLesson: dict?.ongoingCoursesData?.traumaAssessment || "Trauma Assessment",
    },
    {
      id: 3,
      title: dict?.ongoingCoursesData?.pediatricCare || "Pediatric Care",
      instructor: dict?.ongoingCoursesData?.drEmily || "Dr. Emily Davis",
      progress: 45,
      thumbnail: images.cardiology,
      duration: dict?.ongoingCoursesData?.threeHrFortyFive || "3h 45m",
      lastAccessed: dict?.ongoingCoursesData?.threeDaysAgo || "3 days ago",
      nextLesson: dict?.ongoingCoursesData?.childDevelopment || "Child Development",
    },
  ];

  return (
    <Card
      title={dict?.ongoingCourses?.title || "Continue Learning"}
      extra={<Button type="link">{dict?.ongoingCourses?.viewAll || "View All"}</Button>}
      style={{ borderRadius: 12 }}
    >
      <List
        dataSource={ongoingCourses}
        renderItem={(course) => (
          <List.Item>
            <div style={{ display: "flex", width: "100%", alignItems: "flex-start" }}>
              <Image
                src={course.thumbnail}
                alt={course.title}
                style={{
                  width: 80,
                  height: 60,
                  borderRadius: 8,
                  objectFit: "cover",
                  marginRight: 16,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{course.title}</div>
                <div style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>
                  {course.instructor} • {course.duration}
                </div>
                <Progress percent={course.progress} size="small" />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#666" }}>
                    {dict?.ongoingCourses?.next || "Next"}: {course.nextLesson}
                  </span>
                  <Tag color="blue" style={{ fontSize: 12 }}>
                    {course.lastAccessed}
                  </Tag>
                </div>
              </div>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                style={{ marginLeft: 12 }}
              >
                {dict?.ongoingCourses?.continue || "Continue"}
              </Button>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}
