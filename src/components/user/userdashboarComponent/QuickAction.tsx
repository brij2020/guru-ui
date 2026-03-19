"use client";
import React from "react";
import { Card, Row, Col, Button } from "antd";
import { 
  BookOutlined, 
  PlayCircleOutlined, 
  FileTextOutlined,
  TrophyOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function QuickActions({ dict, lang }: any) {
  const quickActions = [
    {
      title: dict?.quickActionsData?.browseCourses || "Browse Courses",
      icon: <BookOutlined />,
      path: "/user/myCourse",
      color: "#1890ff"
    },
    {
      title: dict?.quickActionsData?.myLearning || "My Learning",
      icon: <PlayCircleOutlined />,
      path: "/user/myCourse",
      color: "#52c41a"
    },
    {
      title: dict?.quickActionsData?.takeTest || "Take Test",
      icon: <FileTextOutlined />,
      path: "/user/myCourse",
      color: "#fa8c16"
    },
    {
      title: dict?.quickActionsData?.certificates || "Certificates",
      icon: <TrophyOutlined />,
      path: "/user/myCourse",
      color: "#722ed1"
    }
  ];

  const router = useRouter();

  return (
    <Card title={dict?.quickActions?.title || "Quick Actions"} style={{ borderRadius: 12 }}>
      <Row gutter={[12, 12]}>
        {quickActions.map((action, index) => (
          <Col span={12} key={index}>
            <Button 
              type="default" 
              style={{ 
                width: "100%", 
                height: 80,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${action.color}20`,
                background: `${action.color}10`
              }}
              onClick={() => router.push(`/${lang}${action.path}`)}
            >
              <div style={{ fontSize: 20, color: action.color, marginBottom: 8 }}>
                {action.icon}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>
                {action.title}
              </div>
            </Button>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
