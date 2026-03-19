"use client";
import React from "react";
import { Card, List, Button, Rate, Tag } from "antd";
import ethicsImg from '../../../../public/images/ECG.jpeg'
import surgery from '../../../../public/images/OIP.jpeg'
import digitalHealth from '../../../../public/images/ECG.jpeg'

export default function RecommendedCourses({ dict, lang }: any) {
  const recommendedCourses = [
    {
      id: 1,
      title: dict?.recommendedCoursesData?.medicalEthics || "Medical Ethics in Practice",
      instructor: dict?.recommendedCoursesData?.drRobert || "Dr. Robert Wilson",
      rating: 4.8,
      students: 1247,
      duration: dict?.recommendedCoursesData?.twoHrFifteen || "2h 15m",
      level: dict?.recommendedCoursesData?.intermediate || "Intermediate",
      category: dict?.recommendedCoursesData?.ethics || "Ethics",
      thumbnail: ethicsImg.src,
    },
    {
      id: 2,
      title: dict?.recommendedCoursesData?.advancedSurgery || "Advanced Surgical Techniques",
      instructor: dict?.recommendedCoursesData?.drLisa || "Dr. Lisa Park",
      rating: 4.9,
      students: 892,
      duration: dict?.recommendedCoursesData?.fiveHrThirty || "5h 30m",
      level: dict?.recommendedCoursesData?.advanced || "Advanced",
      category: dict?.recommendedCoursesData?.surgery || "Surgery",
      thumbnail: surgery.src,
    },
    {
      id: 3,
      title: dict?.recommendedCoursesData?.digitalHealth || "Digital Health Innovations",
      instructor: dict?.recommendedCoursesData?.drJames || "Dr. James Kumar",
      rating: 4.6,
      students: 1563,
      duration: dict?.recommendedCoursesData?.threeHrFortyFive || "3h 45m",
      level: dict?.recommendedCoursesData?.beginner || "Beginner",
      category: dict?.recommendedCoursesData?.technology || "Technology",
      thumbnail: digitalHealth.src,
    },
  ];

  return (
    <Card
      title={dict?.recommendedCourses?.title || "Recommended for You"}
      style={{ borderRadius: 12 }}
    >
      <List
        dataSource={recommendedCourses}
        renderItem={(course) => (
          <List.Item>
            <div style={{ display: "flex", width: "100%" }}>
              <img
                src={course.thumbnail}
                alt={course.title}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  objectFit: "cover",
                  marginRight: 12,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  {course.title}
                </div>
                <div style={{ color: "#666", fontSize: 12, marginBottom: 4 }}>
                  {course.instructor}
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                  <Rate disabled defaultValue={course.rating} style={{ fontSize: 14 }} />
                  <span style={{ marginLeft: 8, fontSize: 12 }}>({course.rating})</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Tag color="blue" style={{ fontSize: 10 }}>
                    {course.level}
                  </Tag>
                  <Tag color="green" style={{ fontSize: 10 }}>
                    {course.category}
                  </Tag>
                </div>
              </div>
              <Button type="primary" size="small" style={{ alignSelf: "center" }}>
                {dict?.recommendedCourses?.enroll || "Enroll"}
              </Button>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}
