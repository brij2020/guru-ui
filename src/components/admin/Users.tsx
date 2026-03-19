"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Table,
  Space,
  Tag,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface User {
  id: string;
  name: string;
  role: "Doctor" | "Nurse";
  specialization: string;
  register: string;
  subscription: "Free" | "Monthly" | "Yearly" | "Premium";
  certificate: boolean;
  hospital: string;
}

const SPECIALIZATIONS = {
  Doctor: ["Cardiology", "Orthopedics", "Neurology", "Pediatrics", "Dermatology", "General Medicine"],
  Nurse: ["Pediatric Care", "Emergency Care", "Surgical Assistance", "Intensive Care", "Geriatric Care", "Maternity Care"],
};

const DEMO_ROWS: User[] = [
  {
    id: "d-1001",
    name: "Dr. Ahmed Al Mansoori",
    role: "Doctor",
    specialization: "Cardiology",
    register: "REG-2025-001",
    subscription: "Premium",
    certificate: true,
    hospital: "City General Hospital",
  },
  {
    id: "n-2001",
    name: "Nurse Mariam Al Suwaidi",
    role: "Nurse",
    specialization: "Pediatric Care",
    register: "NUR-2025-010",
    subscription: "Monthly",
    certificate: false,
    hospital: "City General Hospital",
  },
  {
    id: "d-1002",
    name: "Dr. Fatima Khan",
    role: "Doctor",
    specialization: "Neurology",
    register: "REG-2025-002",
    subscription: "Yearly",
    certificate: true,
    hospital: "Royal Health Center",
  },
  {
    id: "n-2002",
    name: "Nurse Aisha Ali",
    role: "Nurse",
    specialization: "Emergency Care",
    register: "NUR-2025-011",
    subscription: "Free",
    certificate: true,
    hospital: "Royal Health Center",
  },
  {
    id: "d-1003",
    name: "Dr. Imran Malik",
    role: "Doctor",
    specialization: "Orthopedics",
    register: "REG-2025-003",
    subscription: "Monthly",
    certificate: false,
    hospital: "City General Hospital",
  },
  {
    id: "n-2003",
    name: "Nurse Fatima Noor",
    role: "Nurse",
    specialization: "Maternity Care",
    register: "NUR-2025-012",
    subscription: "Premium",
    certificate: true,
    hospital: "Healthcare Hospital",
  },
  {
    id: "d-1004",
    name: "Dr. Arjumand Khan",
    role: "Doctor",
    specialization: "Dermatology",
    register: "REG-2025-004",
    subscription: "Premium",
    certificate: true,
    hospital: "Healthcare Hospital",
  },
  {
    id: "n-2004",
    name: "Nurse Zainab Al Farsi",
    role: "Nurse",
    specialization: "Surgical Assistance",
    register: "NUR-2025-013",
    subscription: "Yearly",
    certificate: false,
    hospital: "Royal Health Center",
  },
  {
    id: "d-1005",
    name: "Dr. Omar Qureshi",
    role: "Doctor",
    specialization: "General Medicine",
    register: "REG-2025-005",
    subscription: "Free",
    certificate: false,
    hospital: "City General Hospital",
  },
  {
    id: "n-2005",
    name: "Nurse Layla Hassan",
    role: "Nurse",
    specialization: "Intensive Care",
    register: "NUR-2025-014",
    subscription: "Monthly",
    certificate: true,
    hospital: "Healthcare Hospital",
  },
];

// Define form values type
interface UserFormValues {
  name: string;
  role: "Doctor" | "Nurse";
  specialization: string;
  register: string;
  subscription: "Free" | "Monthly" | "Yearly" | "Premium";
  certificate: boolean;
  hospital: string;
}

export default function Users() {
  const [rows, setRows] = useState<User[]>(DEMO_ROWS);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const role = Form.useWatch("role", form) as "Doctor" | "Nurse" | undefined;

  const openForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue(user);
    } else {
      form.resetFields();
      setEditingUser(null);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    form.resetFields();
    setEditingUser(null);
    setShowForm(false);
  };

  const onFinish = (values: UserFormValues) => {
    if (editingUser) {
      setRows((prev) =>
        prev.map((row) => (row.id === editingUser.id ? { ...editingUser, ...values } : row))
      );
    } else {
      const newUser: User = { id: Date.now().toString(), ...values };
      setRows((prev) => [newUser, ...prev]);
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete user?",
      onOk: () => {
        setRows((prev) => prev.filter((r) => r.id !== id));
      },
    });
  };

  const columns: ColumnsType<User> = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Specialization", dataIndex: "specialization", key: "specialization" },
    { title: "User Registered", dataIndex: "register", key: "register" },
    { title: "Subscription", dataIndex: "subscription", key: "subscription" },
    {
      title: "Certificate",
      dataIndex: "certificate",
      key: "certificate",
      render: (val) => <Tag color={val ? "green" : "red"}>{val ? "Yes" : "No"}</Tag>,
    },
    { title: "Hospital", dataIndex: "hospital", key: "hospital" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openForm(record)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>{showForm ? (editingUser ? "Edit User" : "Register User") : "Users List"}</h2>
        {!showForm && (
          <Button type="primary" style={{ background: "#7b1fa2" }} onClick={() => openForm()}>➕ Register User</Button>
        )}
      </div>

      {showForm && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="role" label="Role" rules={[{ required: true }]}>
              <Select onChange={() => form.setFieldsValue({ specialization: "" })}>
                <Option value="Doctor">Doctor</Option>
                <Option value="Nurse">Nurse</Option>
              </Select>
            </Form.Item>

            <Form.Item name="specialization" label="Specialization" rules={[{ required: true }]}>
              <Select disabled={!role}>
                {role && SPECIALIZATIONS[role].map((s: string) => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="register" label="User Registered" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="subscription" label="Subscription" initialValue="Free">
              <Select>
                <Option value="Free">Free</Option>
                <Option value="Monthly">Monthly</Option>
                <Option value="Yearly">Yearly</Option>
                <Option value="Premium">Premium</Option>
              </Select>
            </Form.Item>

            <Form.Item name="certificate" valuePropName="checked">
              <Checkbox>Has Certificate</Checkbox>
            </Form.Item>

            <Form.Item name="hospital" label="Hospital" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>

          <Form.Item style={{ marginTop: 16 }}>
            <Space>
              <Button type="primary" htmlType="submit">{editingUser ? "Save Changes" : "Register User"}</Button>
              <Button onClick={closeForm}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      )}

      {!showForm && <Table columns={columns} dataSource={rows} rowKey="id" scroll={{ x: 'max-content' }} />}
    </div>
  );
}