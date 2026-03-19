"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { API_ENDPOINTS } from "@/lib/apiConfig";

const { Title, Text } = Typography;

interface SignupDictionary {
  signup: {
    createAccount: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    signUp: string;
    alreadyHaveAccount: string;
    login: string;
    requiredFirstName: string;
    requiredLastName: string;
    requiredEmail: string;
    validEmail: string;
    requiredPassword: string;
    requiredConfirmPassword: string;
    passwordMismatch: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    passwordPlaceholder: string;
    confirmPasswordPlaceholder: string;
    successMessage: string;
  };
}

interface SignupProps {
  dict: SignupDictionary;
  lang: string;
}

interface SignupFormValues {
  firstName: string;
  lastName: string;
  emailId: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  data?: {
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken?: string;
    refreshToken?: string;
  };
}

export default function SignupPage({ dict, lang }: SignupProps) {
  const [form] = Form.useForm<SignupFormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const signupDict = dict.signup;

  const handleFinish = async (values: SignupFormValues) => {
    setLoading(true);

    try {
      const name = `${values.firstName} ${values.lastName}`.trim();
      const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.auth.register, {
        name,
        email: values.emailId.trim().toLowerCase(),
        password: values.password,
      });

      const data = response.data?.data;
      if (!data?.user) {
        messageApi.error("Registration failed");
        return;
      }

      messageApi.success(signupDict.successMessage || "Signup successful!");
      form.resetFields();

      setTimeout(() => {
        router.push(`/${lang}/auth/login`);
      }, 800);
    } catch (error: unknown) {
      const apiMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Registration failed";

      messageApi.error(apiMessage || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background:
            "radial-gradient(circle at top right, #0ea5e9 0%, rgba(14,165,233,0) 35%), radial-gradient(circle at bottom left, #22c55e 0%, rgba(34,197,94,0) 35%), linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 560,
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 30px 60px rgba(2, 6, 23, 0.35)",
          }}
          styles={{ body: { padding: 32 } }}
        >
          <Title level={2} style={{ marginBottom: 4, textAlign: "center" }}>
            {signupDict.createAccount}
          </Title>
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
            Create your account to start learning
          </Text>

          <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Form.Item
                label={signupDict.firstName}
                name="firstName"
                rules={[{ required: true, message: signupDict.requiredFirstName }]}
              >
                <Input prefix={<UserOutlined />} placeholder={signupDict.firstNamePlaceholder} size="large" />
              </Form.Item>

              <Form.Item
                label={signupDict.lastName}
                name="lastName"
                rules={[{ required: true, message: signupDict.requiredLastName }]}
              >
                <Input prefix={<UserOutlined />} placeholder={signupDict.lastNamePlaceholder} size="large" />
              </Form.Item>
            </div>

            <Form.Item
              label={signupDict.email}
              name="emailId"
              rules={[
                { required: true, message: signupDict.requiredEmail },
                { type: "email", message: signupDict.validEmail },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="name@example.com" size="large" />
            </Form.Item>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Form.Item
                label={signupDict.password}
                name="password"
                rules={[
                  { required: true, message: signupDict.requiredPassword },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters",
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: "Use uppercase, lowercase and a number",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  size="large"
                  placeholder={signupDict.passwordPlaceholder}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label={signupDict.confirmPassword}
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: signupDict.requiredConfirmPassword },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(signupDict.passwordMismatch));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  size="large"
                  placeholder={signupDict.confirmPasswordPlaceholder}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
            </div>

            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              {loading ? "Creating account..." : signupDict.signUp}
            </Button>
          </Form>

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <Text type="secondary">{signupDict.alreadyHaveAccount} </Text>
            <Link href={`/${lang}/auth/login`}>{signupDict.login}</Link>
          </div>
        </Card>
      </div>
    </>
  );
}
