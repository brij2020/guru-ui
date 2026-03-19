"use client";
import React from "react";
import { Card, Row, Col } from "antd";
import { BookOutlined, FileTextOutlined, UserOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Stats data
export default function StatsCards({dict,lang}:any) {

const card=dict.dashboard.admin.stats
const stats = [
  {
    title: card.totalCourses,
    value: 24,
    icon: <BookOutlined />,
    color: "#4f46e5",
    bg: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    path: "/admin/courses",
  },
  {
    title: card.totalTests,
    value: 18,
    icon: <FileTextOutlined />,
    color: "#ef4444",
    bg: "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
    path: "/admin/tests",
  },
  {
    title: card.activeUsers,
    value: 356,
    icon: <UserOutlined />,
    color: "#10b981",
    bg: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    path: "/admin/users",
  },
  {
    title: card.completionRate,
    value: "92%",
    icon: <CheckCircleOutlined />,
    color: "#f59e0b",
    bg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    path: "/admin/courses",
  },
];

// Single stat card
function StatCard({ stat,lang }: { stat: typeof stats[0];lang:any }) {
   const handleClick = () => {
      router.push(`/${lang}${stat.path}`); // ✅ Keep current language in URL
    };

  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={handleClick}
      style={{ cursor: "pointer", height: "100%" }}
    >
      <Card
        hoverable
        style={{
          borderRadius: 20,
          padding: "20px",
          border: "none",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
        styles={{body:{padding: 0, height: "100%" }}}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: stat.bg,
          }}
        />
        
        <div style={{ display: "flex", alignItems: "center", padding: "16px 8px" }}>
          <div
            style={{
              fontSize: 24,
              padding: 16,
              borderRadius: 16,
              background: stat.bg,
              color: "white",
              marginRight: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              transition: "all 0.3s ease",
            }}
            className="stat-icon"
          >
            {stat.icon}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: 28, 
              fontWeight: 700, 
              color: "#1e293b",
              lineHeight: 1.2,
              marginBottom: 4
            }}>
              {stat.value}
            </div>
            <div style={{ 
              color: "#64748b", 
              fontSize: 14, 
              fontWeight: 500,
              letterSpacing: "0.5px"
            }}>
              {stat.title}
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: stat.bg,
            opacity: 0,
            transition: "opacity 0.3s ease",
            borderRadius: 20,
          }}
          className="hover-overlay"
        />
      </Card>
      
      <style jsx>{`
        .stat-card:hover .stat-icon {
          transform: scale(1.1);
        }
        .stat-card:hover .hover-overlay {
          opacity: 0.05;
        }
      `}</style>
    </motion.div>
  );
}

// Main stats cards component

  return (
    <div style={{ padding: "24px 24px 0 24px" }}>
      <Row gutter={[24, 24]}>
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <StatCard stat={stat} lang={lang} />
          </Col>
        ))}
      </Row>
    </div>
  );
}