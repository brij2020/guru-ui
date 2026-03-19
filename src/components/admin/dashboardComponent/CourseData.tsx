"use client";

import React from "react";
import { Card, Row, Col } from "antd";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Course {
  id: string;
  title: string;
  specialization: string;
  courseRole: string;
}

// Define proper types for the tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload?: Record<string,unknown>;
  }>;
  label?: string;
}
export default function CoursesCharts({ dict, lang }: any) {
  const chartsText = dict.dashboard.admin.charts;
  // console.log(chartsText,"sdfghjkjhgfd")
// Mock Data
const courses: Course[] = [
  { id: "1", title: "ENT Basics", specialization: "ENT", courseRole: "Doctor" },
  { id: "2", title: "Orthopedic Care", specialization: "Orthopedic", courseRole: "Doctor" },
  { id: "3", title: "Cardiology Advanced", specialization: "Cardiology", courseRole: "Doctor" },
  { id: "4", title: "Neurology Overview", specialization: "Neurology", courseRole: "Doctor" },
  { id: "5", title: "Dermatology Cases", specialization: "Dermatology", courseRole: "Doctor" },
  { id: "6", title: "ENT Advanced", specialization: "ENT", courseRole: "Doctor" },
  { id: "7", title: "Orthopedic Surgery", specialization: "Orthopedic", courseRole: "Doctor" },
  { id: "8", title: "Cardiology Emergencies", specialization: "Cardiology", courseRole: "Doctor" },
  { id: "9", title: "ICU Procedures", specialization: "ICU", courseRole: "Nurse" },
  { id: "10", title: "General Nursing", specialization: "General", courseRole: "Nurse" },
  { id: "11", title: "Pediatric Nursing", specialization: "Pediatric", courseRole: "Nurse" },
  { id: "12", title: "ICU Advanced", specialization: "ICU", courseRole: "Nurse" },
  { id: "13", title: "General Nursing Skills", specialization: "General", courseRole: "Nurse" },
  { id: "14", title: "Pediatric Care", specialization: "Pediatric", courseRole: "Nurse" },
  { id: "15", title: "Emergency Nursing", specialization: "ICU", courseRole: "Nurse" },
];

  // Aggregate data for bar chart (courses per specialization)
  const specializationMap: Record<string, number> = {};
  courses.forEach((c) => {
    specializationMap[c.specialization] = (specializationMap[c.specialization] || 0) + 1;
  });
  const barData = Object.keys(specializationMap).map((key) => ({
    specialization: key,
    courses: specializationMap[key],
  }));

  // Aggregate data for pie chart (courses per role)
  const roleMap: Record<string, number> = {};
  courses.forEach((c) => {
    roleMap[c.courseRole] = (roleMap[c.courseRole] || 0) + 1;
  });
  const pieData = Object.keys(roleMap).map((key) => ({
    name: key,
    value: roleMap[key],
  }));

  // Color scheme matching the stats cards
  const COLORS = {
    bar: "url(#barGradient)",
    pie: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
    gradient: {
      start: "#4f46e5",
      end: "#6366f1"
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
          <p style={{ margin: "4px 0 0 0", color: COLORS.pie[0] }}>
            {chartsText.coursesLabel}:{" "} <span style={{ fontWeight: 700 }}>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Row gutter={[24, 24]} style={{ padding: "0 24px 24px 24px" }}>
      {/* Bar Chart: Courses per Specialization */}
      <Col xs={24} md={12}>
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
                  background: COLORS.gradient.start,
                  borderRadius: 4,
                  marginRight: 12,
                }}
              ></div>
              📊 {chartsText.coursesBySpecialization}
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
            <BarChart
              data={barData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={COLORS.gradient.start}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="100%"
                    stopColor={COLORS.gradient.end}
                    stopOpacity={0.9}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
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
              <Bar
                dataKey="courses"
                fill={COLORS.bar}
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Col>


      {/* Pie Chart: Courses per Role */}
      <Col xs={24} md={12}>
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
                  background: COLORS.pie[1],
                  borderRadius: 4,
                  marginRight: 12,
                }}
              ></div>
              👥 {chartsText.coursesByRole}
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
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent as number) * 100).toFixed(0)}%)`
                }
                labelLine={false}
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
              <Tooltip
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.95)",
                  borderRadius: 12,
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  border: "none",
                  backdropFilter: "blur(10px)",
                  fontSize: 14,
                  fontWeight: 500,
                }}
                formatter={(value: number, name: string) => [value, `${name} Courses`]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  paddingTop: 20,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>
    </Row>
  );
}