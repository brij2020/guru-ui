"use client";

import React from "react";
import { Card, Row, Col } from "antd";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface ActionTrend {
  day: string;
  courses: number;
  quizzes: number;
  users: number;
}

interface Props {
  trends?: ActionTrend[];
}

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

// Sample trend data
const sampleTrends: ActionTrend[] = [
  { day: "Mon", courses: 2, quizzes: 1, users: 5 },
  { day: "Tue", courses: 3, quizzes: 2, users: 8 },
  { day: "Wed", courses: 4, quizzes: 3, users: 10 },
  { day: "Thu", courses: 5, quizzes: 2, users: 7 },
  { day: "Fri", courses: 6, quizzes: 4, users: 12 },
  { day: "Sat", courses: 3, quizzes: 1, users: 6 },
  { day: "Sun", courses: 2, quizzes: 2, users: 4 },
];

export default function QuickActionsTrend({dict,lang, trends = sampleTrends}:any) {
  const reportData=dict.dashboard.admin.reportData
  const COLORS = {
    courses: "url(#coursesGradient)",
    quizzes: "url(#quizzesGradient)",
    users: "url(#usersGradient)",
    gradient: {
      coursesStart: "#4f46e5",
      coursesEnd: "#6366f1",
      quizzesStart: "#ef4444",
      quizzesEnd: "#f87171",
      usersStart: "#10b981",
      usersEnd: "#34d399"
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

  return (
    <div style={{ padding: "0 24px 24px 24px" }}>
      <Row gutter={[24, 24]}>
        {/* Main Area Chart */}
        <Col xs={24} lg={16}>
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
                  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  borderRadius: 4,
                  marginRight: 12
                }}></div>
                📈 {reportData.weeklyActivity}
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
              body: {
                padding: "16px"
              }

            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={trends}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="coursesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.gradient.coursesStart} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.gradient.coursesStart} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="quizzesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.gradient.quizzesStart} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.gradient.quizzesStart} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.gradient.usersStart} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.gradient.usersStart} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
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
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{
                    paddingBottom: 10,
                    fontSize: 12,
                    fontWeight: 500
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="courses"
                  stroke={COLORS.gradient.coursesStart}
                  fill="url(#coursesGradient)"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="quizzes"
                  stroke={COLORS.gradient.quizzesStart}
                  fill="url(#quizzesGradient)"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={COLORS.gradient.usersStart}
                  fill="url(#usersGradient)"
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Peak Activity Chart */}
        <Col xs={24} lg={8}>
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
                  background: "#f59e0b",
                  borderRadius: 4,
                  marginRight: 12
                }}></div>
                🚀 {reportData.peakActivity}
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
              body:
                { padding: "16px" }
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={trends.map((day:any) => ({
                  day: day.day,
                  total: day.courses + day.quizzes + day.users
                }))}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
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
                <Tooltip
                  formatter={(value) => [`${value} activities`, 'Total']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar
                  dataKey="total"
                  fill="url(#peakGradient)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <p style={{
                margin: 0,
                fontSize: 13,
                color: "#64748b",
              }}>
                {reportData.showstotalActivities}
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}