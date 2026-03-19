"use client";

import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
  AreaChart,
} from "recharts";

// Mock data
const enrollmentData = [
  { course: "CPR Training", students: 120, target: 100, completion: 85 },
  { course: "First Aid", students: 80, target: 90, completion: 78 },
  { course: "Emergency Care", students: 65, target: 75, completion: 92 },
  { course: "Trauma Care", students: 40, target: 60, completion: 65 },
  { course: "Pediatric Care", students: 95, target: 80, completion: 88 },
  { course: "ICU Procedures", students: 55, target: 70, completion: 72 },
];

const certificateData = [
  { month: "Jan", certificates: 20, courses: 15 },
  { month: "Feb", certificates: 35, courses: 22 },
  { month: "Mar", certificates: 50, courses: 30 },
  { month: "Apr", certificates: 40, courses: 25 },
  { month: "May", certificates: 60, courses: 35 },
  { month: "Jun", certificates: 75, courses: 45 },
  { month: "Jul", certificates: 65, courses: 40 },
  { month: "Aug", certificates: 80, courses: 50 },
];

// Define types for tooltip payload
interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  color: string;
  payload?: Record<string,unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export default function Charts({dict,lang}:any) {
    const cardData=dict.dashboard.admin.cards

  const COLORS = {
    primary: "#4f46e5",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    gradient: {
      primaryStart: "#4f46e5",
      primaryEnd: "#6366f1",
      successStart: "#10b981",
      successEnd: "#34d399",
      warningStart: "#f59e0b",
      warningEnd: "#fbbf24"
    }
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          padding: "16px",
          borderRadius: 12,
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          fontSize: 14,
          fontWeight: 500,
        }}>
          <p style={{
            margin: "0 0 12px 0",
            color: "#1e293b",
            fontWeight: 600,
            fontSize: 15
          }}>
            {label}
          </p>
          {payload.map((entry: TooltipPayloadItem, index: number) => (
            <div key={index} style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 8,
              color: entry.color
            }}>
              <div style={{
                width: 12,
                height: 12,
                background: entry.color,
                borderRadius: 2,
                marginRight: 8
              }}></div>
              <span style={{ fontWeight: 600, minWidth: 80 }}>{entry.dataKey}:</span>
              <span style={{ fontWeight: 700, marginLeft: 8 }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate totals
  const totalEnrollments = enrollmentData.reduce((sum, item) => sum + item.students, 0);
  const totalCertificates = certificateData.reduce((sum, item) => sum + item.certificates, 0);

  return (
    <div style={{ padding: "0 24px 24px 24px" }}>
      {/* Statistics Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={cardData.totalEnrollments}
              value={totalEnrollments}
              valueStyle={{ color: COLORS.primary, fontSize: 28, fontWeight: 700 }}
              prefix="👥"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={cardData.certificatesIssued}
              value={totalCertificates}
              valueStyle={{ color: COLORS.success, fontSize: 28, fontWeight: 700 }}
              prefix="🎓"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={cardData.avgCompletion}
              value={Math.round(enrollmentData.reduce((sum, item) => sum + item.completion, 0) / enrollmentData.length)}
              valueStyle={{ color: COLORS.warning, fontSize: 28, fontWeight: 700 }}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              borderRadius: 16,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Statistic
              title={cardData.activeCourses}
              value={enrollmentData.length}
              valueStyle={{ color: COLORS.error, fontSize: 28, fontWeight: 700 }}
              prefix="📚"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Course Enrollments (Composed Chart) */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1e293b",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  padding: "20px 24px 16px",
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 20,
                    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    borderRadius: 4,
                    marginRight: 12,
                  }}
                ></div>
                📊 {cardData.coursePerformanceOverview}
              </div>
            }
            styles={{
              body: {
                padding: "16px",
              },
            }}
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={enrollmentData}
                margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
              >
                <defs>
                  <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="barGradient3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="barGradient4" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#a5b4fc" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="barGradient5" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c7d2fe" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#c7d2fe" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="barGradient6" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e0e7ff" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#e0e7ff" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="course"
                  stroke="#64748b"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: 10,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />
                <Bar
                  dataKey="students"
                  fill="url(#barGradient1)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>


        {/* Certificates Trend (Area Chart) */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1e293b",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  padding: "20px 24px 16px",
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 20,
                    background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                    borderRadius: 4,
                    marginRight: 12,
                  }}
                ></div>
                📈 {cardData.certificationTrends}
              </div>
            }
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
            styles={{
              body: { padding: "16px" },
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={certificateData}
                margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
              >
                <defs>
                  <linearGradient id="certificatesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="coursesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingBottom: 10,
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="certificates"
                  stroke="#10b981"
                  fill="url(#certificatesGradient)"
                  strokeWidth={3}
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="courses"
                  stroke="#f59e0b"
                  fill="url(#coursesGradient)"
                  strokeWidth={2}
                  stackId="2"
                />
                <Line
                  type="monotone"
                  dataKey="certificates"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

      </Row>
    </div>
  );
}