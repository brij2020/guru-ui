"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, Row, Col } from "antd";

interface Action {
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  link?: string;
}


export default function QuickActions({dict,lang}:any) {
  const userData=dict.dashboard.admin.userData

  const actions: Action[] = [
  {
    title: userData.createCourse,
    description: userData.addCourse,
    icon: "📚",
    iconBg: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    iconColor: "#fff",
    link: "/admin/courses/new",
  },
  {
    title: userData.createQuiz,
    description: userData.addQuiz,
    icon: "📝",
    iconBg: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    iconColor: "#fff",
    link: "/admin/quizzes/new",
  },
  {
    title: userData.manageUsers,
    description: userData.viewUsers,
    icon: "👥",
    iconBg: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    iconColor: "#fff",
    link: "/admin/users",
  },
  {
    title: userData.viewReport,
    description: userData.analytics,
    icon: "📊",
    iconBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    iconColor: "#fff",
    link: "/admin/reports",
  },
  {
    title: userData.systemSetting,
    description:userData.configure,
    icon: "⚙️",
    iconBg: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
    iconColor: "#fff",
    link: "/admin/settings",
  },
  {
    title: userData.helpCenter,
    description: userData.getSupport,
    icon: "❓",
    iconBg: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)",
    iconColor: "#fff",
    link: "/admin/help",
  },
];
  const router = useRouter();

  return (
    <div style={{ padding: "0 24px 24px 24px" }}>
      <div style={{ 
        marginBottom: 16, 
        padding: "0 8px",
        display: "flex", 
        alignItems: "center" 
      }}>
        <div style={{
          width: 4,
          height: 20,
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
          borderRadius: 4,
          marginRight: 12
        }}></div>
        <h3 style={{ 
          margin: 0, 
          fontSize: 18, 
          fontWeight: 600, 
          color: "#1e293b" 
        }}>
          {userData.quickActions}
        </h3>
      </div>
      
      <Row gutter={[24, 24]}>
        {actions.map((action, idx) => (
          <Col xs={24} sm={12} lg={8} key={idx}>
            <motion.div
              whileHover={{ 
                scale: 1.02, 
                y: -4,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => action.link && router.push(action.link)}
              style={{ cursor: "pointer", height: "100%" }}
            >
              <Card
                hoverable
                style={{
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
                styles={{body:{ 
                  padding: "24px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px"
                }}}
              >
                {/* Background accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: action.iconBg,
                  }}
                />

                {/* Icon Container */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: action.iconBg,
                    color: action.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                    transition: "all 0.3s ease",
                    flexShrink: 0,
                  }}
                  className="action-icon"
                >
                  {action.icon}
                </div>

                {/* Text Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ 
                    margin: 0, 
                    marginBottom: 4,
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: "#1e293b",
                    lineHeight: 1.3
                  }}>
                    {action.title}
                  </h4>
                  <p style={{ 
                    margin: 0,
                    fontSize: 13, 
                    color: "#64748b",
                    lineHeight: 1.4,
                    opacity: 0.8
                  }}>
                    {action.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div
                  style={{
                    opacity: 0,
                    transform: "translateX(-8px)",
                    transition: "all 0.3s ease",
                    color: "#4f46e5",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                  className="hover-arrow"
                >
                  →
                </div>

                {/* Hover Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: action.iconBg,
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                  }}
                  className="hover-overlay"
                />
              </Card>

              <style jsx>{`
                .ant-card:hover .action-icon {
                  transform: scale(1.1);
                }
                .ant-card:hover .hover-arrow {
                  opacity: 1;
                  transform: translateX(0);
                }
                .ant-card:hover .hover-overlay {
                  opacity: 0.03;
                }
              `}</style>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Optional: Quick Stats Row */}
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24}>
          <Card
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              border: "none",
              textAlign: "center",
              padding: "16px",
            }}
            styles={{body: {padding: "12px"}}}
          >
            <p style={{ 
              margin: 0, 
              fontSize: 14, 
              color: "#64748b",
              fontWeight: 500 
            }}>
              💡 <strong>{userData.proTip}:</strong> {userData.useQuick}
            </p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}