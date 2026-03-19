"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Typography,
  Statistic,
  Divider,
} from "antd";
import {
  BookOutlined,
  VideoCameraOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
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
import Image from "next/image";
import cardio from "@/../public/images/cardiology.jpg";
import pedya from "@/../public/images/pharma.jpg";
import radiology from "@/../public/images/ECG.jpeg";
import ortho from "@/../public/images/artho.jpg";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const { Title, Paragraph } = Typography;

import type { StaticImageData } from "next/image";

interface Course {
  title: string;
  image: string | StaticImageData;
  desc: string;
  detail: string;
}

export default function UserDashboardOverview({ dict }: { dict: any }) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Dummy data
  const enrolledCourses = 12;
  const lecturesWatched = 45;
  const submissions = 8;

  const testSeriesData = {
    labels: ["Test 1", "Test 2", "Test 3", "Test 4"],
    datasets: [
      {
        label: dict?.score || "Score",
        data: [85, 90, 70, 95],
        backgroundColor: "#1890ff",
      },
    ],
  };

  const activityData = {
    labels: [dict?.quiz || "Quiz", dict?.submission || "Submission", dict?.courses || "Courses"],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverOffset: 4,
      },
    ],
  };

  const recommendedCourses: Course[] = [
    {
      title: "Advanced Cardiology",
      image: cardio,
      desc: "Deep dive into modern cardiology practices.",
      detail:
        "This course covers advanced techniques in cardiology including interventions, imaging, and patient management.",
    },
    {
      title: "Pediatric Surgery",
      image: pedya,
      desc: "Comprehensive surgical care for children.",
      detail:
        "Detailed modules on pediatric surgical conditions, anesthesia, and child post-operative care.",
    },
    {
      title: "Radiology Essentials",
      image: radiology,
      desc: "Fundamentals of diagnostic imaging and scans.",
      detail:
        "Covers X-ray, CT, MRI, and ultrasound basics with case-based examples for diagnostic understanding.",
    },
    {
      title: "Orthopedic Techniques",
      image: ortho,
      desc: "Latest methods in bone and joint treatments.",
      detail:
        "Focus on trauma care, joint replacement techniques, and rehabilitation protocols.",
    },
  ];

  return (
    <div className="flex h-screen font-sans">
      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        {/* <div className="h-16 bg-gray-100 flex items-center px-6 shadow overflow-hidden">
          <div className="scrolling-header font-bold text-lg px-3 py-1 text-white rounded">
            {dict?.welcome || "Welcome To Your Dashboard"} Rufiadah Shafi 🥳
          </div>
        </div> */}

        {/* Content Area */}
        <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          {/* Section 1: Cards */}
          <Row gutter={16} className="mb-8">
            <Col span={8}>
              <Card className="text-center bg-blue-50 shadow">
                <Statistic
                  title={dict?.enrolledCourses || "Enrolled Courses"}
                  value={enrolledCourses}
                  prefix={<BookOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="text-center bg-pink-50 shadow">
                <Statistic
                  title={dict?.lecturesWatched || "Lectures Watched"}
                  value={lecturesWatched}
                  prefix={<VideoCameraOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="text-center bg-green-50 shadow">
                <Statistic
                  title={dict?.submissions || "My Submissions"}
                  value={submissions}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Section 2: Graphs */}
          <Row gutter={16} className="mb-8">
            <Col span={16}>
              <Card className="shadow" title={dict?.testSeries || "Test Series"}>
                <div style={{ height: "300px" }}>
                  <Bar
                    data={testSeriesData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card className="shadow flex flex-col justify-between" title={dict?.activity || "Activity"}>
                <div style={{ height: "250px" }}>
                  <Doughnut
                    data={activityData}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
                <Divider />
                <Paragraph>
                  <strong>{dict?.quiz || "Quiz"}:</strong> 45
                </Paragraph>
                <Paragraph>
                  <strong>{dict?.submission || "Submission"}:</strong> 30
                </Paragraph>
                <Paragraph>
                  <strong>{dict?.courses || "Courses"}:</strong> 25
                </Paragraph>
              </Card>
            </Col>
          </Row>

          {/* Section 3: Recommended Courses */}
          <div>
          <Title level={4} className="mb-4">
            {dict?.recommendedCourses || "Recommended Courses"}
          </Title>
          <div className="flex flex-col gap-4">
            {recommendedCourses.map((course, idx) => (
              <Card key={idx} className="shadow">
                <div className="flex items-center">
                  {/* Left: Image */}
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={128}
                    height={80}
                    className="w-32 h-20 rounded object-cover"
                  />

                  {/* Middle: Title + Description */}
                  <div className="flex-1 ml-4">
                    <h4 className="font-semibold">{course.title}</h4>
                    <p className="text-sm text-gray-600">{course.desc}</p>
                  </div>

                  {/* Right: Button */}
                  <Button
                    type="primary"
                    onClick={() => setSelectedCourse(course)}
                  >
                    {dict?.view || "View"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Modal for Course Details */}
      <Modal
        open={!!selectedCourse}
        title={selectedCourse?.title}
        onCancel={() => setSelectedCourse(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedCourse(null)}>
            {dict?.close || "Close"}
          </Button>,
          <Button key="enroll" type="primary">
            {dict?.enrollNow || "Enroll Now"}
          </Button>,
        ]}
      >
        {selectedCourse && (
          <Image
            src={selectedCourse.image}
            alt={selectedCourse.title}
            className="w-full h-52 object-cover rounded mb-4"
          />
        )}
        <Paragraph>{selectedCourse?.detail}</Paragraph>
      </Modal>
    </div>
  );
}
