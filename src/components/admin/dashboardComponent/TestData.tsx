"use client";

import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface Quiz {
  testType: "Objective" | "Subjective";
  testFor: string; // Doctor / Nurse
  specialization: string;
}

// Mock data
const quizzes: Quiz[] = [
  { testType: "Objective", testFor: "Doctor", specialization: "ENT" },
  { testType: "Objective", testFor: "Doctor", specialization: "Cardiology" },
  { testType: "Subjective", testFor: "Doctor", specialization: "Orthopedic" },
  { testType: "Objective", testFor: "Nurse", specialization: "ICU" },
  { testType: "Subjective", testFor: "Nurse", specialization: "General" },
  { testType: "Objective", testFor: "Nurse", specialization: "Pediatric" },
  { testType: "Objective", testFor: "Doctor", specialization: "ENT" },
  { testType: "Subjective", testFor: "Doctor", specialization: "Cardiology" },
  { testType: "Objective", testFor: "Nurse", specialization: "ICU" },
  { testType: "Subjective", testFor: "Doctor", specialization: "Neurology" },
  { testType: "Objective", testFor: "Nurse", specialization: "Emergency" },
  { testType: "Subjective", testFor: "Nurse", specialization: "Pediatric" },
];

// Define types for tooltip
interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export default function TestAnalytics({dict,lang}:any) {
  // Group bar chart data
  const barMap: Record<string, { Objective: number; Subjective: number }> = {};
  quizzes.forEach((q) => {
    if (!barMap[q.specialization]) barMap[q.specialization] = { Objective: 0, Subjective: 0 };
    barMap[q.specialization][q.testType] += 1;
  });

  const barData = Object.keys(barMap).map((key) => ({
    specialization: key,
    Objective: barMap[key].Objective,
    Subjective: barMap[key].Subjective,
  }));

  // Donut chart data
  const roleMap: Record<string, number> = {};
  quizzes.forEach((q) => {
    roleMap[q.testFor] = (roleMap[q.testFor] || 0) + 1;
  });

  const pieData = Object.keys(roleMap).map((key) => ({
    name: key,
    value: roleMap[key],
  }));

  // Line chart data for trend analysis
  const monthlyData = [
    { month: "Jan", Objective: 12, Subjective: 8 },
    { month: "Feb", Objective: 18, Subjective: 10 },
    { month: "Mar", Objective: 15, Subjective: 12 },
    { month: "Apr", Objective: 22, Subjective: 15 },
    { month: "May", Objective: 25, Subjective: 18 },
    { month: "Jun", Objective: 30, Subjective: 20 },
  ];

  const COLORS = {
    objective: "url(#objectiveGradient)",
    subjective: "url(#subjectiveGradient)",
    pie: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"],
    gradient: {
      objectiveStart: "#4f46e5",
      objectiveEnd: "#6366f1",
      subjectiveStart: "#10b981",
      subjectiveEnd: "#34d399"
    }
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          padding: "12px 16px",
          borderRadius: 12,
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          fontSize: 14,
          fontWeight: 500,
        }}>
          <p style={{ margin: 0, color: "#1e293b", fontWeight: 600 }}>{label}</p>
          {payload.map((entry: TooltipPayloadItem, index: number) => (
            <p key={index} style={{
              margin: "4px 0 0 0",
              color: entry.color,
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{
                width: 8,
                height: 8,
                background: entry.color,
                borderRadius: "50%",
                marginRight: 8
              }}></span>
              {entry.dataKey}: <span style={{ fontWeight: 700, marginLeft: 4 }}>{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Statistics
  const totalTests = quizzes.length;
  const objectiveTests = quizzes.filter(q => q.testType === "Objective").length;
  const subjectiveTests = quizzes.filter(q => q.testType === "Subjective").length;

  const test=dict.dashboard.admin.tests

  return (
    <div style={{ padding: "0 24px 24px 24px" }}>
      {/* Statistics Row */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
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
              title={test.stats.totalTests}
              value={totalTests}
              valueStyle={{ color: "#4f46e5", fontSize: 32, fontWeight: 700 }}
              suffix="tests"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
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
              title={test.stats.objectiveTests}
              value={objectiveTests}
              valueStyle={{ color: "#10b981", fontSize: 32, fontWeight: 700 }}
              suffix="tests"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
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
              title={test.stats.subjectiveTests}
              value={subjectiveTests}
              valueStyle={{ color: "#f59e0b", fontSize: 32, fontWeight: 700 }}
              suffix="tests"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Grouped Bar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{
                display: "flex",
                alignItems: "center",
                fontSize: 16,
                fontWeight: 600,
                color: "#1e293b"
              }}>
                <div style={{
                  width: 4,
                  height: 20,
                  background: COLORS.gradient.objectiveStart,
                  borderRadius: 4,
                  marginRight: 12
                }}></div>
                📊 {test.charts.testsBySpecialization}
              </div>
            }
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
            styles={{
              header: {
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                padding: "20px 24px 16px",
                fontSize: 16,
                fontWeight: 600
              },
              body: { padding: "16px" }
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="objectiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.gradient.objectiveStart} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={COLORS.gradient.objectiveEnd} stopOpacity={0.9} />
                  </linearGradient>
                  <linearGradient id="subjectiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.gradient.subjectiveStart} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={COLORS.gradient.subjectiveEnd} stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="specialization"
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
                    paddingTop: 10,
                    fontSize: 12,
                    fontWeight: 500
                  }}
                />
                <Bar
                  dataKey="Objective"
                  fill={COLORS.objective}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="Subjective"
                  fill={COLORS.subjective}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Donut Chart with Trend Line */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{
                display: "flex",
                alignItems: "center",
                fontSize: 16,
                fontWeight: 600,
                color: "#1e293b"
              }}>
                <div style={{
                  width: 4,
                  height: 20,
                  background: COLORS.pie[0],
                  borderRadius: 4,
                  marginRight: 12
                }}></div>
                👥 {test.charts.testDistribution}
              </div>
            }
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              height: "100%",
            }}
            styles={{
              header: {
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                padding: "20px 24px 16px",
                fontSize: 16,
                fontWeight: 600
              },
              body: { padding: "16px" }
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      label={({ value }) => String(value)}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.pie[index % COLORS.pie.length]}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{test.charts.byRole}</div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="Objective"
                      stackId="1"
                      stroke="#4f46e5"
                      fill="url(#objectiveGradient)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="Subjective"
                      stackId="1"
                      stroke="#10b981"
                      fill="url(#subjectiveGradient)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div style={{ textAlign: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{test.charts.monthlyTrend}</div>
                </div>
              </Col>
            </Row>

            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16 }}>
              {pieData.map((entry, index) => (
                <div key={entry.name} style={{ display: "flex", alignItems: "center", fontSize: 12 }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    background: COLORS.pie[index % COLORS.pie.length],
                    borderRadius: 2,
                    marginRight: 6
                  }}></div>
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}