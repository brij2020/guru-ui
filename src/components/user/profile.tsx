"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  Typography,
  Row,
  Col,
  message,
  Space,
  Tabs,
  Modal,
  Tag,
  Progress,
  Avatar,
  Divider,
  Badge,
  Upload,
  Select,
  Form,
  Switch,
} from "antd";
import {
  EditOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  FileTextOutlined,
  BookOutlined,
  CalendarOutlined,
  MailOutlined,
  UserOutlined,
  CameraOutlined,
  LockOutlined,
  BellOutlined,
  DownloadOutlined,
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
  LineElement,
  PointElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, LineElement, PointElement);

export default function UserProfile({ dict, lang }: any) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    const userData = {
      id: 1,
      firstName: dict?.profile?.firstName || "Ahmed",
      lastName: dict?.profile?.lastName || "Al Mansouri",
      email: "ahmed.mansouri@dha.gov.ae",
      phone: "+971 50 123 4567",
      specialization: dict?.profile?.specialization || "Cardiology",
      licenseNumber: "DHA-MED-2023-12345",
      hospital: dict?.profile?.hospital || "Dubai Hospital",
      experience: dict?.profile?.experience || "8 years",
      profileImage: null,
      license: null,
      createdAt: new Date("2020-05-15").toISOString(),
      bio: dict?.profile?.bio || "Senior Cardiologist with 8 years of experience in interventional cardiology. Specialized in cardiac catheterization and heart failure management. Passionate about medical education and continuous professional development.",
      stats: {
        enrolledCourses: 12,
        lecturesWatched: 45,
        submissions: 8,
        completionRate: 78,
        hoursLearned: 36,
        certificates: 4,
        testsCompleted: 15,
        averageScore: 87,
      },
      subscription: {
        plan: dict?.subscription?.professional || "Professional",
        status: "active",
        renewsOn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        features: [
          dict?.subscription?.features?.allCourses || "All Courses",
          dict?.subscription?.features?.certificates || "Certificates",
          dict?.subscription?.features?.prioritySupport || "Priority Support",
          dict?.subscription?.features?.advancedContent || "Advanced Content"
        ]
      },
      preferences: {
        emailNotifications: true,
        courseReminders: true,
        newsletter: false,
        language: "en",
        timezone: "Asia/Dubai"
      }
    };

    setUser(userData);
    setDraft(userData);
    setAvatarPreview(userData.profileImage);
    setLicensePreview(userData.license);
  }, [dict]);

  const saveUserToStorage = (u: any) => {
    console.log("Saving user:", u);
    message.success(dict?.messages?.profileUpdated || "Profile updated successfully!");
  };

  const handleStartEdit = () => {
    setDraft(user);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft(user);
  };

  const handleChange = (field: string, value: any) => {
    setDraft({ ...draft, [field]: value });
  };

  const handleSave = async () => {
    setUser(draft);
    saveUserToStorage(draft);
    setEditing(false);
  };

  const handleBioSave = (newBio: string) => {
    const updated = { ...user, bio: newBio };
    setUser(updated);
    saveUserToStorage(updated);
    setBioModalOpen(false);
  };

  const handleAvatarUpload = (info: any) => {
    if (info.file.status === 'done') {
      const imageUrl = URL.createObjectURL(info.file.originFileObj);
      setAvatarPreview(imageUrl);
      setDraft({ ...draft, profileImage: imageUrl });
      message.success(dict?.messages?.avatarUploaded || 'Avatar uploaded successfully');
    }
  };

  const handleLicenseUpload = (info: any) => {
    if (info.file.status === 'done') {
      const imageUrl = URL.createObjectURL(info.file.originFileObj);
      setLicensePreview(imageUrl);
      setDraft({ ...draft, license: imageUrl });
      message.success(dict?.messages?.licenseUploaded || 'License uploaded successfully');
    }
  };

  // Chart data for insights
  const weeklyProgressData = {
    labels: dict?.charts?.weekDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: dict?.charts?.learningHours || "Learning Hours",
        data: [2, 3, 1.5, 4, 2.5, 1, 0],
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const performanceData = {
    labels: dict?.charts?.specialties || ["Cardiology", "Emergency", "Pediatrics", "Surgery", "Radiology"],
    datasets: [
      {
        label: dict?.charts?.testScores || "Test Scores (%)",
        data: [92, 85, 78, 88, 82],
        backgroundColor: [
          "rgba(24, 144, 255, 0.8)",
          "rgba(82, 196, 26, 0.8)",
          "rgba(250, 173, 20, 0.8)",
          "rgba(114, 46, 209, 0.8)",
          "rgba(245, 34, 45, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>{dict?.loading || "Loading profile..."}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">{dict?.title || "My Profile"}</h1>
          <p className="text-gray-600">{dict?.subtitle || "Manage your professional profile and track progress"}</p>
        </div>
        <Space>
          <Button onClick={() => router.push(`/user/dashboard`)}>
            {dict?.buttons?.backToDashboard || "Back to Dashboard"}
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card
            className="shadow-xl rounded-2xl overflow-hidden border-0"
            styles={{body:{padding: 0}}}
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-8 text-center text-white">
              <Badge
                count={<CameraOutlined className="text-white bg-blue-500 rounded-full p-1" />}
                offset={[-10, 80]}
              >
                <Avatar
                  src={avatarPreview}
                  size={100}
                  icon={!avatarPreview && <UserOutlined />}
                  className="border-4 border-white shadow-lg bg-gradient-to-r from-purple-600 to-blue-600"
                />
              </Badge>
              <h2 className="text-2xl font-bold text-white mt-4 mb-2">
                {dict?.profile?.doctorTitle || "Dr."} {user.firstName} {user.lastName}
              </h2>
              <Tag className="bg-blue-500 text-white border-0 rounded-full px-4 py-1 font-semibold text-sm">
                {user.specialization}
              </Tag>
              <div className="flex items-center justify-center mt-4 text-blue-100">
                <CalendarOutlined className="mr-2" />
                {dict?.profile?.memberSince || "Member since"}: {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{user.stats?.enrolledCourses}</div>
                  <div className="text-gray-600 text-sm">{dict?.stats?.courses || "Courses"}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">{user.stats?.certificates}</div>
                  <div className="text-gray-600 text-sm">{dict?.stats?.certificates || "Certificates"}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">{user.stats?.averageScore}%</div>
                  <div className="text-gray-600 text-sm">{dict?.stats?.avgScore || "Avg Score"}</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{dict?.stats?.overallProgress || "Overall Progress"}</span>
                  <span>{user.stats?.completionRate}%</span>
                </div>
                <Progress
                  percent={user.stats?.completionRate || 0}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="primary"
                  block
                  onClick={() => router.push(`/user/myCourse`)}
                  icon={<BookOutlined />}
                  className="h-12"
                >
                  {dict?.buttons?.myCourses || "My Courses"}
                </Button>
                <Button
                  block
                  onClick={handleStartEdit}
                  icon={<EditOutlined />}
                  className="h-12"
                >
                  {dict?.buttons?.editProfile || "Edit Profile"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Medical License Card */}
          {/* <Card
            title={
              <span className="flex items-center text-lg font-semibold">
                <SafetyCertificateOutlined className="text-green-500 mr-2" />
                {dict?.license?.title || "Medical License"}
              </span>
            }
            className="shadow-lg rounded-2xl border-0"
          >
            {licensePreview ? (
              <div className="text-center">
                <img
                  src={licensePreview}
                  alt="license"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="font-semibold mb-2">{dict?.license?.licenseNo || "License No"}: {user.licenseNumber}</div>
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => message.info(dict?.messages?.downloadingLicense || "Downloading license...")}
                  className="text-blue-600"
                >
                  {dict?.buttons?.downloadLicense || "Download License"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <SafetyCertificateOutlined className="text-5xl text-gray-300 mb-4" />
                <div className="text-gray-500 mb-4">{dict?.license?.noLicense || "No license uploaded"}</div>
                <Button
                  type="dashed"
                  onClick={() => setActiveTab("1")}
                  className="mt-2"
                >
                  {dict?.buttons?.uploadLicense || "Upload License"}
                </Button>
              </div>
            )}
          </Card> */}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Subscription Card */}
          <Card
            title={
              <span className="flex items-center text-lg font-semibold">
                <CrownOutlined className="text-yellow-500 mr-2" />
                {dict?.subscription?.title || "Subscription Plan"}
              </span>
            }
            className="shadow-lg rounded-2xl border-0"
            extra={
              <Tag color={user.subscription?.status === 'active' ? 'green' : 'red'}>
                {user.subscription?.status?.toUpperCase()}
              </Tag>
            }
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{user.subscription?.plan}</h3>
              <p className="text-gray-500">
                {dict?.subscription?.renewsOn || "Renews on"} {new Date(user.subscription?.renewsOn).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {user.subscription?.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center">
                  <CheckCircleOutlined className="text-green-500 mr-3" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              type="primary"
              block
              onClick={() => setActiveTab("5")}
              className="h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 border-0 text-black font-semibold hover:from-yellow-500 hover:to-yellow-600"
            >
              {dict?.buttons?.manageSubscription || "Manage Subscription"}
            </Button>
          </Card>

          {/* Main Tabs Card */}
          <Card className="shadow-lg rounded-2xl border-0">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "1",
                  label: (
                    <span className="flex items-center">
                      <UserOutlined className="mr-2" />
                      {dict?.tabs?.accountInfo || "Account Info"}
                    </span>
                  ),
                  children: (
                    <div className="py-4">
                      {!editing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-gray-600 text-sm mb-1">{dict?.form?.fullName || "Full Name"}</label>
                              <p className="text-sm">{dict?.profile?.doctorTitle || "Dr."} {user.firstName} {user.lastName}</p>
                            </div>
                            <div>
                              <label className="block text-gray-600 text-sm mb-1">{dict?.form?.specialization || "Specialization"}</label>
                              <p className="text-sm">{user.specialization}</p>
                            </div>
                            <div>
                              <label className="block text-gray-600 text-sm mb-1">{dict?.form?.hospital || "Hospital"}</label>
                              <p className="text-sm">{user.hospital}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-gray-600 text-sm mb-1">{dict?.form?.email || "Email"}</label>
                              <div className="flex items-center">
                                <MailOutlined className="text-blue-500 mr-2" />
                                <p className="text-sm">{user.email}</p>
                              </div>
                            </div>
                            <div>
                              <label className="block text-gray-600 text-sm mb-1">{dict?.form?.phone || "Phone"}</label>
                              <p className="text-sm">{user.phone}</p>
                            </div>
                            <div>
                              <label className="block text-gray-600 text-sm mb-1">{dict?.form?.experience || "Experience"}</label>
                              <p className="text-sm">{user.experience}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">{dict?.form?.firstName || "First Name"}</label>
                              <Input
                                value={draft.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                prefix={<UserOutlined />}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">{dict?.form?.lastName || "Last Name"}</label>
                              <Input
                                value={draft.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">{dict?.form?.specialization || "Specialization"}</label>
                              <Select
                                value={draft.specialization}
                                onChange={(value) => handleChange('specialization', value)}
                                className="w-full"
                              > 
                                <Option value="Cardiology">{dict?.specializations?.cardiology || "Cardiology"}</Option>
                                <Option value="Emergency Medicine">{dict?.specializations?.emergency || "Emergency Medicine"}</Option>
                                <Option value="Pediatrics">{dict?.specializations?.pediatrics || "Pediatrics"}</Option>
                                <Option value="Surgery">{dict?.specializations?.surgery || "Surgery"}</Option>
                                <Option value="Radiology">{dict?.specializations?.radiology || "Radiology"}</Option>
                                <Option value="General Practice">{dict?.specializations?.general || "General Practice"}</Option>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">{dict?.form?.hospital || "Hospital"}</label>
                              <Input
                                value={draft.hospital}
                                onChange={(e) => handleChange('hospital', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">{dict?.form?.email || "Email"}</label>
                              <Input
                                value={draft.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                prefix={<MailOutlined />}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">{dict?.form?.phone || "Phone"}</label>
                              <Input
                                value={draft.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">{dict?.form?.profileImage || "Profile Image"}</label>
                              <Upload
                                accept="image/*"
                                showUploadList={false}
                                customRequest={({ file, onSuccess }) => {
                                  setTimeout(() => {
                                    onSuccess?.("ok");
                                  }, 0);
                                }}
                                onChange={handleAvatarUpload}
                              >
                                <Button icon={<CameraOutlined />}>{dict?.buttons?.uploadAvatar || "Upload Avatar"}</Button>
                              </Upload>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">{dict?.form?.medicalLicense || "Medical License"}</label>
                              <Upload
                                accept="image/*,.pdf"
                                showUploadList={false}
                                customRequest={({ file, onSuccess }) => {
                                  setTimeout(() => {
                                    onSuccess?.("ok");
                                  }, 0);
                                }}
                                onChange={handleLicenseUpload}
                              >
                                <Button icon={<FileTextOutlined />}>{dict?.buttons?.uploadLicense || "Upload License"}</Button>
                              </Upload>
                            </div>
                          </div>

                          <div className="flex space-x-3 pt-4">
                            <Button type="primary" onClick={handleSave}>{dict?.buttons?.saveChanges || "Save Changes"}</Button>
                            <Button onClick={handleCancel}>{dict?.buttons?.cancel || "Cancel"}</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <span className="flex items-center">
                      <LockOutlined className="mr-2" />
                      {dict?.tabs?.security || "Security"}
                    </span>
                  ),
                  children: <ChangePassword user={user} onSave={(updated: any) => { setUser(updated); saveUserToStorage(updated); }} dict={dict} />,
                },
                {
                  key: "3",
                  label: (
                    <span className="flex items-center">
                      <EditOutlined className="mr-2" />
                      {dict?.tabs?.about || "About"}
                    </span>
                  ),
                  children: (
                    <div className="py-4">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold mb-3">{dict?.about?.professionalBio || "Professional Bio"}</h4>
                          <p className="text-gray-700 leading-relaxed">
                            {user.bio || dict?.about?.bioPlaceholder || "Add a professional bio about yourself, your medical background, and professional interests."}
                          </p>
                        </div>
                        <Button
                          icon={<EditOutlined />}
                          size="small"
                          onClick={() => setBioModalOpen(true)}
                        >
                          {dict?.buttons?.editBio || "Edit Bio"}
                        </Button>
                      </div>

                      <Divider />

                      <h4 className="text-lg font-semibold mb-4">{dict?.about?.professionalDetails || "Professional Details"}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">{dict?.form?.licenseNumber || "License Number"}</label>
                          <p>{user.licenseNumber}</p>
                        </div>
                        <div>
                          <label className="block text-gray-600 text-sm mb-1">{dict?.form?.yearsExperience || "Years of Experience"}</label>
                          <p>{user.experience}</p>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "4",
                  label: (
                    <span className="flex items-center">
                      <TrophyOutlined className="mr-2" />
                      {dict?.tabs?.insights || "Insights"}
                    </span>
                  ),
                  children: (
                    <div className="py-4">
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <Card className="text-center bg-blue-50 border-0 shadow-sm">
                          <div className="text-2xl font-bold text-blue-600">{user.stats?.enrolledCourses}</div>
                          <div className="text-gray-600">{dict?.stats?.enrolledCourses || "Enrolled Courses"}</div>
                        </Card>
                        <Card className="text-center bg-green-50 border-0 shadow-sm">
                          <div className="text-2xl font-bold text-green-600">{user.stats?.lecturesWatched}</div>
                          <div className="text-gray-600">{dict?.stats?.lecturesWatched || "Lectures Watched"}</div>
                        </Card>
                        <Card className="text-center bg-orange-50 border-0 shadow-sm">
                          <div className="text-2xl font-bold text-orange-600">{user.stats?.certificates}</div>
                          <div className="text-gray-600">{dict?.stats?.certificatesEarned || "Certificates Earned"}</div>
                        </Card>
                      </div>

                      <Divider />

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <Card title={dict?.charts?.weeklyProgress || "Weekly Learning Progress"} className="h-80">
                          <Line data={weeklyProgressData} options={chartOptions} />
                        </Card>
                        <Card title={dict?.charts?.specialtyPerformance || "Specialty Performance"} className="h-80">
                          <Doughnut data={performanceData} options={chartOptions} />
                        </Card>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "5",
                  label: (
                    <span className="flex items-center">
                      <CrownOutlined className="mr-2" />
                      {dict?.tabs?.subscription || "Subscription"}
                    </span>
                  ),
                  children: (
                    <div className="py-4">
                      <h4 className="text-xl font-semibold mb-2">{dict?.subscription?.currentPlan || "Current Plan"}: {user.subscription?.plan}</h4>
                      <p className="text-gray-600 mb-6">{dict?.subscription?.activeStatus || "Your subscription is active and will renew automatically"}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border border-gray-300">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-semibold">{dict?.subscription?.basic || "Basic Plan"}</h5>
                            <span className="text-gray-600">$0/{dict?.subscription?.month || "month"}</span>
                          </div>
                          <ul className="space-y-2 mb-6">
                            <li>• {dict?.subscription?.features?.basic1 || "Access to basic courses"}</li>
                            <li>• {dict?.subscription?.features?.basic2 || "Community support"}</li>
                            <li>• {dict?.subscription?.features?.basic3 || "Limited certificates"}</li>
                          </ul>
                          <Button type="default" block disabled>
                            {dict?.subscription?.currentPlan || "Current Plan"}
                          </Button>
                        </Card>
                        <Card className="border-2 border-blue-500 relative">
                          <div className="absolute -top-3 right-4 bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
                            {dict?.subscription?.recommended || "RECOMMENDED"}
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-semibold">{dict?.subscription?.professional || "Professional Plan"}</h5>
                            <span className="text-gray-600">$29/{dict?.subscription?.month || "month"}</span>
                          </div>
                          <ul className="space-y-2 mb-6">
                            <li>• {dict?.subscription?.features?.pro1 || "All courses unlocked"}</li>
                            <li>• {dict?.subscription?.features?.pro2 || "Professional certificates"}</li>
                            <li>• {dict?.subscription?.features?.pro3 || "Priority support"}</li>
                            <li>• {dict?.subscription?.features?.pro4 || "Advanced content"}</li>
                          </ul>
                          <Button type="primary" block>
                            {dict?.buttons?.upgradeNow || "Upgrade Now"}
                          </Button>
                        </Card>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "6",
                  label: (
                    <span className="flex items-center">
                      <BellOutlined className="mr-2" />
                      {dict?.tabs?.notifications || "Notifications"}
                    </span>
                  ),
                  children: (
                    <div className="py-4">
                      <h4 className="text-xl font-semibold mb-6">{dict?.notifications?.title || "Notification Preferences"}</h4>
                      <Form layout="vertical" className="space-y-4">
                        <Form.Item label={dict?.notifications?.email || "Email Notifications"}>
                          <Switch
                            checked={user.preferences?.emailNotifications}
                            onChange={(checked) => handleChange('preferences', { ...user.preferences, emailNotifications: checked })}
                          />
                        </Form.Item>
                        <Form.Item label={dict?.notifications?.courseReminders || "Course Reminders"}>
                          <Switch
                            checked={user.preferences?.courseReminders}
                            onChange={(checked) => handleChange('preferences', { ...user.preferences, courseReminders: checked })}
                          />
                        </Form.Item>
                        <Form.Item label={dict?.notifications?.newsletter || "Newsletter"}>
                          <Switch
                            checked={user.preferences?.newsletter}
                            onChange={(checked) => handleChange('preferences', { ...user.preferences, newsletter: checked })}
                          />
                        </Form.Item>
                        <Form.Item label={dict?.notifications?.language || "Language"}>
                          <Select
                            value={user.preferences?.language}
                            onChange={(value) => handleChange('preferences', { ...user.preferences, language: value })}
                            className="w-48"
                          >
                            <Option value="en">English</Option>
                            <Option value="ar">العربية</Option>
                          </Select>
                        </Form.Item>
                        <Button type="primary" onClick={() => message.success(dict?.messages?.preferencesSaved || "Preferences saved!")}>
                          {dict?.buttons?.savePreferences || "Save Preferences"}
                        </Button>
                      </Form>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>

      {/* Bio Edit Modal */}
      <Modal
        title={dict?.modals?.editBio || "Edit Professional Bio"}
        open={bioModalOpen}
        onCancel={() => setBioModalOpen(false)}
        onOk={() => handleBioSave(draft?.bio || "")}
        okText={dict?.buttons?.saveBio || "Save Bio"}
        cancelText={dict?.buttons?.cancel || "Cancel"}
        width={600}
      >
        <TextArea
          rows={6}
          value={draft?.bio}
          onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          placeholder={dict?.modals?.bioPlaceholder || "Share your medical background, specialization, professional interests, and any achievements..."}
          className="mt-4"
        />
      </Modal>
    </div>
  );
}

// Password Change Component
function ChangePassword({ user, onSave, dict }: any) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleChange = () => {
    if (!user) return message.error(dict?.errors?.noUser || "No user found");
    if (oldPass !== user.password) return message.error(dict?.errors?.incorrectPassword || "Current password is incorrect");
    if (newPass.length < 6) return message.error(dict?.errors?.passwordLength || "New password must be at least 6 characters");
    if (newPass !== confirm) return message.error(dict?.errors?.passwordMismatch || "New passwords do not match");

    const updatedUser = { ...user, password: newPass };
    onSave(updatedUser);
    message.success(dict?.messages?.passwordUpdated || "Password updated successfully!");
    setOldPass("");
    setNewPass("");
    setConfirm("");
  };

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">{dict?.form?.currentPassword || "Current Password"}</label>
          <Input.Password
            placeholder={dict?.placeholders?.currentPassword || "Enter current password"}
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{dict?.form?.newPassword || "New Password"}</label>
          <Input.Password
            placeholder={dict?.placeholders?.newPassword || "Enter new password"}
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">{dict?.form?.confirmPassword || "Confirm New Password"}</label>
          <Input.Password
            placeholder={dict?.placeholders?.confirmPassword || "Confirm new password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>
      <Button type="primary" onClick={handleChange}>{dict?.buttons?.updatePassword || "Update Password"}</Button>
    </div>
  );
}