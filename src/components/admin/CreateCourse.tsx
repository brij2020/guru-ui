"use client";
import React, { useEffect } from "react";
import { Form, Input, Button, Select, Upload, Card, Row, Col} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { UploadFile } from "antd/es/upload/interface";


const { Option } = Select;
const { TextArea } = Input;

const expiryOptions = [
  { value: 3, label: "3 days" },
  { value: 7, label: "7 days" },
  { value: 10, label: "10 days" },
  { value: 30, label: "30 days" },
];

type UploadValue =
  | UploadFile[]
  | { fileList?: UploadFile[]; file?: UploadFile }
  | null
  | undefined;

interface FormValues {
  courseRole: string;
  specialization: string;
  title: string;
  description: string;
  banner?: UploadValue;
  video?: UploadValue;
  videoLink?: string;
  author: string;
  expiryDays: number;
}


const specializations: Record<string, string[]> = {
  Doctor: ["Cardiology", "Neurology", "Orthopedics"],
  Nurse: ["Pediatrics", "Emergency Care", "General Nursing"],
};

export default function CreateCourse() {
  const [form] = Form.useForm();
  const router = useRouter();

  const role = Form.useWatch("courseRole", form);

  useEffect(() => {
    form.setFieldsValue({ specialization: undefined });
  }, [role, form]);

  const onFinish = (values: FormValues) => {
    console.log("New course created:", values);
    // ✅ Save logic here (API call or local state)
    router.push("/admin/courses"); // redirect after submit
  };

  return (
    <div style={{ padding: 32, background: "#f9fafb", minHeight: "100vh" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "#111827" }}>
          📘 Create New Course
        </h1>
        <Button onClick={() => router.push("/admin/courses")}>⬅ Back to Courses</Button>
      </div>

      {/* Card Wrapper for the Form */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Course Role"
                name="courseRole"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select Role">
                  <Option value="Doctor">Doctor</Option>
                  <Option value="Nurse">Nurse</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Specialization"
                name="specialization"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select Specialization" disabled={!role}>
                  {role &&
                    specializations[role].map((s) => (
                      <Option key={s} value={s}>
                        {s}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter course title" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Author"
                name="author"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter course author" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Upload Banner"
                name="banner"
                valuePropName="fileList"
                getValueFromEvent={(e) => e && e.fileList}
              >
                <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                  <Button icon={<UploadOutlined />}>Upload Banner</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Upload Video"
                name="video"
                valuePropName="fileList"
                getValueFromEvent={(e) => e && e.fileList}
              >
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />}>Upload Video</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Or Video Link" name="videoLink">
                <Input placeholder="Paste YouTube/Vimeo link" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Expiry Days"
                name="expiryDays"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select expiry">
                  {expiryOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true }]}
              >
                <TextArea rows={4} placeholder="Write course description..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: "right", marginTop: 16 }}>
            <Button onClick={() => router.push("/admin/courses")} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: "#7b1fa2" }}
            >
              Create Course
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
