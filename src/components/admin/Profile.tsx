"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Divider,
  Space,
  Statistic,
  Tag,
  Progress,
  List,
  Badge,
} from "antd";
import {
  LogoutOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  BookOutlined,
  BarChartOutlined,
  CalendarOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
} from "@ant-design/icons";
import adminImg from "../../../public/images/admin.jpg";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import en from "../../../dictionaries/en.json"
import ar from "../../../dictionaries/ar.json"


const { Title, Text } = Typography;

// Define interfaces for our data types
interface ActivityItem {
  action: string;
  time: string;
  type: "success" | "info" | "warning";
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
  profileImage: StaticImageData;
  bio: string;
  department: string;
  location: string;
  permissions: string[];
  activity: ActivityItem[];
}

interface StatData {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
  change: string;
}

interface QuickAction {
  icon: string;
  title: string;
  description: string;
}

function AdminProfile({dict,lang}:any) {
  const router = useRouter();
  // const { lang } = useParams();
  const [user, setUser] = useState<User | null>(null);
  // const dict:any = lang === "ar" ? ar : en;
  const profile=dict.dashboard.admin.profile;


  useEffect(() => {
    const adminUser: User = {
      firstName: profile.firstName ??"Mohammed",
      lastName:profile.lastName ?? "Al Rashid",
      email: "mohammed.alrashid@admin.com",
      role: profile.role ?? "Senior Administrator",
      phone: "+971-55-1234567",
      createdAt: "2023-05-12T10:00:00Z",
      lastLogin: "2024-12-19T08:30:00Z",
      profileImage: adminImg,
      bio: profile.bio || "System administrator with 5+ years of experience managing e-learning platforms. Specialized in user management, content moderation, and platform optimization.",
      department: profile.department || "Platform Operations",
      location: profile.location || "Dubai, UAE",
      permissions: [
        profile.permissions.fullAccess || "Full Access",
        profile.permissions.userManagement || "User Management",
        profile.permissions.contentModeration || "Content Moderation",
        profile.permissions.analytics || "Analytics"
      ],
      activity: [
        { action: profile.activity.courseApproved || "Course Approved", time: "2 hours ago", type: "success" },
        { action: profile.activity.userRegistered || "User Registered", time: "5 hours ago", type: "info" },
        { action: profile.activity.reportResolved || "Report Resolved", time: "1 day ago", type: "success" },
        { action: profile.activity.systemUpdated || "System Updated", time: "2 days ago", type: "warning" },
      ]
    };

    setUser(adminUser);
  }, [dict]);

  const handleLogout = () => {
    localStorage.removeItem("current_user");
    localStorage.removeItem("role");
    router.push(`/${lang}/auth/login`);
  };

  if (!user) return null;

  const statsData: StatData[] = [
    { icon: <TeamOutlined />, title: profile.stats.totalUsers || "Total Users", value: 1247, color: "#4f46e5", change: "+12%" },
    { icon: <BookOutlined />, title: profile.stats.activeCourses || "Active Courses", value: 89, color: "#10b981", change: "+5%" },
    { icon: <SafetyCertificateOutlined />, title: profile.stats.certificates || "Certificates", value: 856, color: "#f59e0b", change: "+23%" },
    { icon: <BarChartOutlined />, title: profile.stats.testsConducted || "Tests Conducted", value: 2341, color: "#ef4444", change: "+8%" },
  ];

  const quickActions: QuickAction[] = [
    { icon: "👥", title: profile.quickActions.manageUsers || "Manage Users", description: profile.quickActions.manageUsersDesc || "User accounts & permissions" },
    { icon: "📊", title: profile.quickActions.viewAnalytics || "View Analytics", description: profile.quickActions.viewAnalyticsDesc || "Platform performance" },
    { icon: "⚙️", title: profile.quickActions.settings || "Settings", description: profile.quickActions.settingsDesc || "System configuration" },
    { icon: "📋", title: profile.quickActions.reports || "Reports", description: profile.quickActions.reportsDesc || "Generate reports" },
  ];

  return (
    <div style={{ padding: "24px", background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", minHeight: "100vh" }}>
      <Row gutter={[24, 24]}>
        {/* Left Column - Profile & Stats */}
        <Col xs={24} lg={8}>
          {/* Profile Card */}
          <Card
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              marginBottom: 24,
            }}
            styles={{ body: { padding: 24 } }}
          >
            <div style={{ textAlign: "center", position: "relative" }}>
              {/* Status Badge */}
              <Badge
                dot
                color="#10b981"
                offset={[-5, 65]}
                size="default"
              >
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Image
                    src={user.profileImage}
                    alt={profile.profileImageAlt || "Profile"}
                    width={150}
                    height={150}
                    style={{
                      borderRadius: "50%",
                      objectFit: "cover",
                       width: 150,
                       height: 150,
                      border: "4px solid #ffffff",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
              </Badge>

              <Title level={3} style={{ marginTop: 16, marginBottom: 4, color: "#1e293b" }}>
                {user.firstName} {user.lastName}
              </Title>

              <Tag
                color="#4f46e5"
                style={{
                  borderRadius: 16,
                  padding: "4px 16px",
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                  color: "white",
                  border: "none",
                }}
              >
                {user.role}
              </Tag>

              <div style={{ marginTop: 12 }}>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  <GlobalOutlined style={{ marginRight: 6 }} />
                  {user.department} • {user.location}
                </Text>
              </div>

              <Divider style={{ margin: "20px 0" }} />

              {/* Quick Stats */}
              <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={12}>
                  <Statistic
                    title={profile.memberSince || "Member Since"}
                    value={new Date(user.createdAt).getFullYear()}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ fontSize: 18, color: "#4f46e5" }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={profile.lastLogin || "Last Login"}
                    value="Today"
                    valueStyle={{ fontSize: 18, color: "#10b981" }}
                  />
                </Col>
              </Row>

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  block
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    border: "none",
                    borderRadius: 12,
                    height: 40,
                    fontWeight: 600,
                  }}
                >
                  {profile.editProfile || "Edit Profile"}
                </Button>
                <Button
                  icon={<LogoutOutlined />}
                  block
                  danger
                  onClick={handleLogout}
                  style={{
                    borderRadius: 12,
                    height: 40,
                    fontWeight: 600,
                  }}
                >
                  {profile.logout || "Logout"}
                </Button>
              </Space>
            </div>
          </Card>

          {/* Permissions Card */}
          <Card
            title={
              <span style={{ color: "#1e293b", fontWeight: 600 }}>
                <SecurityScanOutlined style={{ marginRight: 8 }} />
                {profile.permissionsTitle}
              </span>
            }
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              {user.permissions.map((permission: string, index: number) => (
                <Tag
                  key={index}
                  color={index === 0 ? "blue" : index === 1 ? "green" : index === 2 ? "orange" : "purple"}
                  style={{
                    borderRadius: 12,
                    padding: "4px 12px",
                    margin: "2px 0",
                    border: "none",
                    fontWeight: 500,
                  }}
                >
                  {permission}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Right Column - Details & Analytics */}
        <Col xs={24} lg={16}>
          {/* Stats Overview */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {statsData.map((stat, index) => (
              <Col xs={24} sm={12} key={index}>
                <Card
                  style={{
                    borderRadius: 16,
                    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  styles={{ body: { padding: 20 } }}
                >
                  <Statistic
                    title={
                      <span style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>
                        {stat.icon} {stat.title}
                      </span>
                    }
                    value={stat.value}
                    valueStyle={{
                      color: stat.color,
                      fontSize: 28,
                      fontWeight: 700,
                    }}
                    suffix={<span style={{ fontSize: 12, color: "#10b981", fontWeight: 600 }}>{stat.change}</span>}
                  />
                  <Progress
                    percent={Math.min(stat.value / 50, 100)}
                    showInfo={false}
                    strokeColor={stat.color}
                    trailColor="#f1f5f9"
                    size="small"
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              {/* Account Information */}
              <Card
                title={
                  <span style={{ color: "#1e293b", fontWeight: 600 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    {profile.accountInformation.accountInformation}
                  </span>
                }
                style={{
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  height: "100%",
                }}
              >
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
                    <MailOutlined style={{ marginRight: 12, color: '#4f46e5', fontSize: 16 }} />
                    <div>
                      <Text strong style={{ display: 'block' }}> {profile.accountInformation.email}</Text>
                      <Text type="secondary">{user.email}</Text>
                    </div>
                  </div>

                  <Divider style={{ margin: '1px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
                    <PhoneOutlined style={{ marginRight: 12, color: '#10b981', fontSize: 16 }} />
                    <div>
                      <Text strong style={{ display: 'block' }}>{profile.accountInformation.phone}</Text>
                      <Text type="secondary">{user.phone}</Text>
                    </div>
                  </div>

                  <Divider style={{ margin: '1px 0' }} />

                  <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
                    <SettingOutlined style={{ marginRight: 12, color: '#f59e0b', fontSize: 16 }} />
                    <div>
                      <Text strong style={{ display: 'block' }}>{profile.accountInformation.department}</Text>
                      <Text type="secondary">{user.department}</Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              {/* Quick Actions */}
              <Card
                title={
                  <span style={{ color: "#1e293b", fontWeight: 600 }}>
                    ⚡{profile.quickActionsTitle}
                  </span>
                }
                style={{
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  height: "100%",
                }}
              >
                <Row gutter={[12, 12]}>
                  {quickActions.map((action, index) => (
                    <Col span={12} key={index}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          textAlign: "center",
                          padding: "12px 8px",
                          height: "100%",
                        }}
                        styles={{ body: { padding: 8 } }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 8 }}>{action.icon}</div>
                        <Text strong style={{ display: 'block', fontSize: 12 }}>{action.title}</Text>
                        <Text type="secondary" style={{ fontSize: 10 }}>{action.description}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity */}
          <Card
            title={
              <span style={{ color: "#1e293b", fontWeight: 600 }}>
                📋 {profile.recentActivity}
              </span>
            }
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              border: "none",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              marginTop: 24,
            }}
          >
            <List
              dataSource={user.activity}
              renderItem={(item: ActivityItem) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: item.type === 'success' ? '#10b981' :
                          item.type === 'warning' ? '#f59e0b' : '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 14,
                      }}>
                        {item.type === 'success' ? '✓' : item.type === 'warning' ? '⚡' : '👤'}
                      </div>
                    }
                    title={item.action}
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.time}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminProfile;