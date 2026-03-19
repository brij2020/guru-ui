"use client";
import React from "react";
import { Card, Row, Col } from "antd";

// Charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Charts({ dict, lang }: { dict: any; lang: any }) {
  // Bar Chart Data - Weekly Learning Activity
  const weeklyActivityData = {
    labels: dict?.charts?.weekDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: dict?.charts?.lecturesWatched || "Lectures Watched",
        data: [3, 5, 2, 6, 4, 2, 1],
        backgroundColor: "#1890ff",
        borderRadius: 4,
      },
      {
        label: dict?.charts?.testsCompleted || "Tests Completed",
        data: [1, 2, 1, 3, 2, 1, 0],
        backgroundColor: "#52c41a",
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Pie Chart Data - Course Status
  const courseStatusData = {
    labels:
      dict?.charts?.courseStatusLabels || [
        "Completed",
        "In Progress",
        "Not Started",
        "Behind Schedule",
      ],
    datasets: [
      {
        data: [3, 6, 2, 1],
        backgroundColor: ["#52c41a", "#1890ff", "#faad14", "#ff4d4f"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Charts Section */}
      <Row gutter={[24, 24]}>
        {/* Bar Chart */}
        <Col xs={24} lg={16}>
          <Card
            title={dict?.charts?.weeklyLearningActivity || "Weekly Learning Activity"}
            style={{ borderRadius: 12 }}
            styles={{ body: { height: "300px", padding: "16px" } }}
          >
            <Bar
              data={weeklyActivityData}
              options={barChartOptions}
              style={{ height: "100%", width: "100%" }}
            />
          </Card>
        </Col>

        {/* Pie Chart */}
        <Col xs={24} lg={8}>
          <Card
            title={dict?.charts?.courseProgress || "Course Progress"}
            style={{ borderRadius: 12 }}
            styles={{ body: { height: "300px", padding: "16px" } }}
          >
            <Doughnut
              data={courseStatusData}
              options={pieChartOptions}
              style={{ height: "100%", width: "100%" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
