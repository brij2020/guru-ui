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
  AreaChart,
  Area,
  Line,
} from "recharts";

// Define interfaces for our data types
interface ActivityDataItem {
  date: string;
  enrolled: number;
  testAttempt: number;
  certificate: number;
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

const activityData: ActivityDataItem[] = [
  { date: "Mon", enrolled: 5, testAttempt: 3, certificate: 2 },
  { date: "Tue", enrolled: 8, testAttempt: 4, certificate: 3 },
  { date: "Wed", enrolled: 6, testAttempt: 2, certificate: 1 },
  { date: "Thu", enrolled: 10, testAttempt: 6, certificate: 5 },
  { date: "Fri", enrolled: 4, testAttempt: 1, certificate: 2 },
  { date: "Sat", enrolled: 7, testAttempt: 3, certificate: 4 },
  { date: "Sun", enrolled: 3, testAttempt: 2, certificate: 1 },
];

export default function RecentActivity({dict,lang}:any) {
  const RecentActivity=dict.dashboard.admin.RecentActivity
  const COLORS = {
    enrolled: "url(#enrolledGradient)",
    testAttempt: "url(#testAttemptGradient)",
    certificate: "url(#certificateGradient)",
    gradient: {
      enrolledStart: "#4f46e5",
      enrolledEnd: "#6366f1",
      testStart: "#f59e0b",
      testEnd: "#fbbf24",
      certificateStart: "#10b981",
      certificateEnd: "#34d399"
    }
  };

  // Calculate totals
  const totalEnrolled = activityData.reduce((sum, day) => sum + day.enrolled, 0);
  const totalTests = activityData.reduce((sum, day) => sum + day.testAttempt, 0);
  const totalCertificates = activityData.reduce((sum, day) => sum + day.certificate, 0);

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
              <span style={{ fontWeight: 600, minWidth: 100 }}>
                {entry.dataKey === 'enrolled' ? 'Enrolled' :
                  entry.dataKey === 'testAttempt' ? 'Test Attempts' : 'Certificates'}:
              </span>
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
            styles={{body: {padding: "20px"} }}
          >
            <Statistic
              title={RecentActivity.totalEnrolled}
              value={totalEnrolled}
              valueStyle={{ color: COLORS.gradient.enrolledStart, fontSize: 28, fontWeight: 700 }}
              prefix="👥"
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
            styles={{body: {padding: "20px"} }}
          >
            <Statistic
              title={RecentActivity.testAttempts}
              value={totalTests}
              valueStyle={{ color: COLORS.gradient.testStart, fontSize: 28, fontWeight: 700 }}
              prefix="📝"
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
            styles={{body: {padding: "20px"} }}
          >
            <Statistic
              title={RecentActivity.certificates}
              value={totalCertificates}
              valueStyle={{ color: COLORS.gradient.certificateStart, fontSize: 28, fontWeight: 700 }}
              prefix="🎓"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Stacked Bar Chart */}
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
                📊 {RecentActivity.weeklyActivityBreakdown}
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
              body:{
                padding: "16px"
              }
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="enrolledGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.gradient.enrolledStart} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={COLORS.gradient.enrolledStart} stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="testAttemptGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.gradient.testStart} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={COLORS.gradient.testStart} stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="certificateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.gradient.certificateStart} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={COLORS.gradient.certificateStart} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
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
                  dataKey="enrolled"
                  stackId="a"
                  fill={COLORS.enrolled}
                  radius={[4, 4, 0, 0]}
                  name="Enrolled"
                />
                <Bar
                  dataKey="testAttempt"
                  stackId="a"
                  fill={COLORS.testAttempt}
                  radius={[4, 4, 0, 0]}
                  name="Test Attempts"
                />
                <Bar
                  dataKey="certificate"
                  stackId="a"
                  fill={COLORS.certificate}
                  radius={[4, 4, 0, 0]}
                  name="Certificates"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Trend Overview */}
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
                  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  borderRadius: 4,
                  marginRight: 12
                }}></div>
                📈 {RecentActivity.activityTrends}
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
              <AreaChart data={activityData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey={(data: ActivityDataItem) => data.enrolled + data.testAttempt + data.certificate}
                  stroke="#8b5cf6"
                  fill="url(#totalGradient)"
                  strokeWidth={2}
                  name="Total Activity"
                />
                <Line
                  type="monotone"
                  dataKey="enrolled"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ fill: "#4f46e5", r: 3 }}
                  name="Enrolled"
                />
                <Line
                  type="monotone"
                  dataKey="certificate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 3 }}
                  name="Certificates"
                />
              </AreaChart>
            </ResponsiveContainer>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <p style={{
                margin: 0,
                fontSize: 13,
                color: "#64748b",
                fontWeight: 500
              }}>
                Total Weekly Activity: <strong>{totalEnrolled + totalTests + totalCertificates}</strong> events
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}