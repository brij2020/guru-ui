"use client";

import React from "react";
import { Card, Table, Tag, Progress, Avatar, Badge } from "antd";

interface UserProgress {
  key: string;
  name: string;
  course: string;
  score: number;
  certificate: "Issued" | "Pending";
  avatar?: string;
  specialization: string;
}

const data: UserProgress[] = [
  { key: "1", name: "Ali Khan", course: "CPR Training", score: 85, certificate: "Issued", specialization: "Doctor" },
  { key: "2", name: "Maria Ahmed", course: "First Aid", score: 65, certificate: "Pending", specialization: "Nurse" },
  { key: "3", name: "Dr. Ahmed", course: "Emergency Care", score: 92, certificate: "Issued", specialization: "Doctor" },
  { key: "4", name: "Sara Ali", course: "Trauma Care", score: 50, certificate: "Pending", specialization: "Nurse" },
  { key: "5", name: "John Smith", course: "Pediatric Care", score: 78, certificate: "Issued", specialization: "Doctor" },
  { key: "6", name: "Emily Johnson", course: "ICU Procedures", score: 88, certificate: "Issued", specialization: "Nurse" },
];

const getAvatarColor = (name: string) => {
  const colors = ["#4f46e5", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

export default function ProgressTable({dict,lang}:any) {
  const progressData=dict.dashboard.admin.progressTable
  const data: UserProgress[] = progressData.userProgressData.users.map(
  (u: any, index: number) => ({
    key: String(index + 1),
    name: u.name,
    course: u.course,
    specialization: u.specialization,
    score: u.score,
    certificate: u.certificate,
  })
);
  const columns = [
    {
      title: `👤${progressData.title.user}`,
      dataIndex: "name",
      key: "name",
      render: (text: string, record: UserProgress) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Badge 
            dot 
            color={record.specialization === "Doctor" ? "#4f46e5" : "#10b981"}
            offset={[-5, 5]}
          >
            <Avatar
              style={{ 
                background: getAvatarColor(record.name),
                fontWeight: 600,
                boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
              }}
              size="large"
            >
              {getInitials(record.name)}
            </Avatar>
          </Badge>
          <div>
            <div style={{ fontWeight: 600, color: "#1e293b" }}>{text}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {record.specialization}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: `📚 ${progressData.title.course}`,
      dataIndex: "course",
      key: "course",
      render: (text: string) => (
        <span style={{ fontWeight: 500, color: "#374151" }}>{text}</span>
      ),
    },
    {
      title: `📊  ${progressData.title.progress}`,
      dataIndex: "score",
      key: "score",
      render: (score: number) => (
        <div style={{ minWidth: 120 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>{score}%</span>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 600, 
              color: score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444",
              background: score >= 70 ? "rgba(16, 185, 129, 0.1)" : score >= 50 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
              padding: "2px 8px",
              borderRadius: 12
            }}>
              {score >= 70 ? "Excellent" : score >= 50 ? "Good" : "Needs Improvement"}
            </span>
          </div>
          <Progress
            percent={score}
            size="small"
            strokeColor={{
              "0%": score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444",
              "100%": score >= 70 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171",
            }}
            trailColor="rgba(0,0,0,0.05)"
            showInfo={false}
            strokeLinecap="round"
          />
        </div>
      ),
    },
    {
      title: `🎓 ${progressData.title.status}`,
      dataIndex: "certificate",
      key: "certificate",
      render: (status: "Issued" | "Pending") => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tag
            style={{
              borderRadius: 16,
              padding: "4px 16px",
              fontWeight: 600,
              fontSize: 12,
              border: "none",
              background: status === "Issued" 
                ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                : "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            {status}
          </Tag>
          {status === "Issued" && (
            <div style={{
              width: 8,
              height: 8,
              background: "#10b981",
              borderRadius: "50%",
              animation: "pulse 2s infinite"
            }}></div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 24px 24px 24px" }}>
      <Card
        title={
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            fontSize: 18, 
            fontWeight: 600,
            color: "#1e293b"
          }}>
            <div style={{
              width: 4,
              height: 24,
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              borderRadius: 4,
              marginRight: 12
            }}></div>
            📋 {progressData.UserProgressTracking}
          </div>
        }
        style={{
          borderRadius: 20,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "none",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
        styles={{header:{
         borderBottom: "1px solid rgba(0,0,0,0.05)", 
          padding: "20px 24px 16px", 
        },
        body:{
          padding: 0
        }   
        }}
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: 6,
            showSizeChanger: false,
            style: {
              padding: "16px 24px",
              margin: 0
            }
          }}
          bordered={false}
          // rowClassName={(record, index) => "progress-table-row"}
          style={{ 
            color: "#1e293b",
            border: "none",
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <style jsx global>{`
        .progress-table-row {
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }
        
        .progress-table-row:hover {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.03) 0%, rgba(99, 102, 241, 0.03) 100%) !important;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .progress-table-row td {
          border-bottom: 1px solid rgba(0,0,0,0.03) !important;
          padding: 16px 24px !important;
        }
        
        .progress-table-row:hover td {
          border-bottom-color: transparent !important;
        }
        
        .ant-table-thead > tr > th {
          background: rgba(248, 250, 252, 0.8) !important;
          color: #1e293b !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          padding: 16px 24px !important;
          border-bottom: 2px solid rgba(79, 70, 229, 0.1) !important;
        }
        
        .ant-table-tbody > tr > td {
          background: transparent !important;
          color: #1e293b !important;
        }
        
        .ant-pagination-item {
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
        }
        
        .ant-pagination-item-active {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
          border-color: #4f46e5 !important;
        }
        
        .ant-pagination-item-active a {
          color: white !important;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}