'use client';
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Table,
  Tag,
  Space,
  message,
  Modal,
  InputNumber,
  Collapse,
} from "antd";
import { UploadOutlined, DownOutlined, UpOutlined, PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Image from "next/image";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { v4 as uuidv4 } from 'uuid';
import Quill from "@/components/admin/Quill"
import { useRouter } from "next/navigation";

const { Option } = Select;
const { TextArea } = Input;

type UploadValue =
  | UploadFile[]
  | { fileList?: UploadFile[]; file?: UploadFile }
  | null
  | undefined;

type FormValues = {
  courseRole: string;
  specialization: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  banner?: UploadValue;
  video?: UploadValue;
  videoLink?: string;
  author: string;
  expiryDays: number;
};

interface CourseType {
  id: string;
  courseRole: string;
  specialization: string;
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  banner: string | File | null;
  video: File | null;
  videoLink: string;
  author: string;
  publishedDate: string;
  expiryDays: number;
}

export default function Course() {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const router = useRouter();

  // Preloaded 5 dummy courses with rich HTML descriptions
  const [courses, setCourses] = useState<CourseType[]>([
    {
      id: "1",
      courseRole: "Doctor",
      specialization: "Cardiology",
      title: "Heart Health Basics",
      shortDescription: "Learn about cardiology essentials.",
      description: `<h2>Comprehensive Cardiology Course</h2>
        <p>This <strong>comprehensive course</strong> covers all the fundamental aspects of cardiology. You'll learn about:</p>
        <ul>
          <li>Heart anatomy and physiology</li>
          <li>Common cardiovascular diseases</li>
          <li>Diagnostic techniques including ECG and echocardiography</li>
          <li>Modern treatment options and medications</li>
        </ul>
        <p><em>Perfect for medical students and junior doctors</em></p>`,
      price: 99.99,
      banner: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
      video: null,
      videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
      author: "Dr. Ahmed Al Mansoori",
      publishedDate: "2025-09-20",
      expiryDays: 7,
    },
    {
      id: "2",
      courseRole: "Doctor",
      specialization: "Neurology",
      title: "Brain Function & Disorders",
      shortDescription: "Detailed guide to understanding brain functions.",
      description: `<h2>Advanced Neurology Training</h2>
        <p>Explore the <strong>complex world of neurology</strong> with this in-depth course. This program includes:</p>
        <ol>
          <li>Brain structure and neural pathways</li>
          <li>Common neurological disorders (stroke, epilepsy, Parkinson's)</li>
          <li>Advanced diagnostic methods (MRI, CT, EEG)</li>
          <li>Cutting-edge treatment approaches</li>
        </ol>
        <blockquote>Essential for neurologists and neurosurgeons</blockquote>`,
      price: 149.99,
      banner: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
      video: null,
      videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
      author: "Dr. Arjumand Khan",
      publishedDate: "2025-09-18",
      expiryDays: 10,
    },
    {
      id: "3",
      courseRole: "Nurse",
      specialization: "Emergency Care",
      title: "ICU Care Essentials",
      shortDescription: "Practical ICU nursing techniques and patient care.",
      description: `<h2>ICU Nursing Mastery</h2>
        <p>Master the <strong>essential skills</strong> required for ICU nursing. This course covers:</p>
        <ul>
          <li>Critical care protocols and procedures</li>
          <li>Advanced patient monitoring techniques</li>
          <li>Emergency response and crisis management</li>
          <li>Medication administration in critical care</li>
        </ul>
        <p><strong>Learning Outcomes:</strong></p>
        <ul>
          <li>Proficient in ventilator management</li>
          <li>Expert in hemodynamic monitoring</li>
          <li>Skilled in emergency interventions</li>
        </ul>`,
      price: 79.99,
      banner: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
      video: null,
      videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
      author: "Nurse Aisha Ali",
      publishedDate: "2025-09-15",
      expiryDays: 30,
    },
    {
      id: "4",
      courseRole: "Nurse",
      specialization: "Pediatrics",
      title: "Pediatric Nursing",
      shortDescription: "Childcare and pediatric nursing best practices.",
      description: `<h2>Pediatric Nursing Excellence</h2>
        <p>Specialize in <strong>pediatric nursing</strong> with this comprehensive course. Key topics include:</p>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding: 8px; background: #f0f0f0;">Age Group</th>
              <th style="padding: 8px; background: #f0f0f0;">Key Focus Areas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px;">Newborns (0-1 month)</td>
              <td style="padding: 8px;">Feeding, growth monitoring, newborn screening</td>
            </tr>
            <tr>
              <td style="padding: 8px;">Infants (1-12 months)</td>
              <td style="padding: 8px;">Immunization, developmental milestones</td>
            </tr>
            <tr>
              <td style="padding: 8px;">Children (1-12 years)</td>
              <td style="padding: 8px;">Common childhood illnesses, preventive care</td>
            </tr>
          </tbody>
        </table>`,
      price: 89.99,
      banner: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
      video: null,
      videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
      author: "Nurse Fatima Noor",
      publishedDate: "2025-09-12",
      expiryDays: 7,
    },
    {
      id: "5",
      courseRole: "Doctor",
      specialization: "Orthopedics",
      title: "Orthopedic Surgery Insights",
      shortDescription: "Overview of orthopedic surgery and rehabilitation.",
      description: `<h2>Orthopedic Surgery Masterclass</h2>
        <p>Gain <strong>comprehensive insights</strong> into orthopedic surgery procedures and rehabilitation.</p>
        <h3>Course Modules:</h3>
        <ol>
          <li><strong>Module 1:</strong> Bone Anatomy and Physiology</li>
          <li><strong>Module 2:</strong> Fracture Management</li>
          <li><strong>Module 3:</strong> Joint Replacement Techniques</li>
          <li><strong>Module 4:</strong> Post-operative Rehabilitation</li>
        </ol>
        <p><code>Advanced surgical techniques and patient management protocols</code></p>`,
      price: 199.99,
      banner: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800",
      video: null,
      videoLink: "https://youtu.be/nqZyIis6IJs?si=jS5c-O9yT_cCKwfK",
      author: "Dr. Imran Malik",
      publishedDate: "2025-09-10",
      expiryDays: 3,
    },
  ]);

  const specializations: Record<string, string[]> = {
    Doctor: ["Cardiology", "Neurology", "Orthopedics"],
    Nurse: ["Pediatrics", "Emergency Care", "General Nursing"],
  };

  const expiryOptions = [
    { value: 3, label: "3 days" },
    { value: 7, label: "7 days" },
    { value: 10, label: "10 days" },
    { value: 30, label: "30 days" },
  ];

  const role = Form.useWatch("courseRole", form);

  // Video upload validation
  const videoUploadProps: UploadProps = {
    beforeUpload: (file) => {
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      const isVideo = file.type.startsWith('video/');
      if (!isVideo) {
        message.error('You can only upload video files!');
        return Upload.LIST_IGNORE;
      }
      const isLt500M = file.size / 1024 / 1024 < 500;
      if (!isLt500M) {
        message.error('Video must be smaller than 500MB!');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    maxCount: 1,
  };

  useEffect(() => {
    form.setFieldsValue({ specialization: undefined });
  }, [role, form]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const getUploadedFile = (val: UploadValue): File | null => {
    if (!val) return null;
    if (Array.isArray(val)) return val[0]?.originFileObj ?? null;
    if ("fileList" in val && val.fileList) return val.fileList[0]?.originFileObj ?? null;
    if ("file" in val && val.file) return val.file.originFileObj ?? null;
    return null;
  };

  // Toggle row expansion
  const handleExpand = (expanded: boolean, record: CourseType) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
    }
  };

  const columns = [
    {
      title: "Role",
      dataIndex: "courseRole",
      key: "courseRole",
      width: 100
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
      width: 150
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 150
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number) => `AED ${price.toFixed(2)}`,
    },
    {
      title: "Short Description",
      dataIndex: "shortDescription",
      key: "shortDescription",
      ellipsis: true,
      width: 250,
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
      ellipsis: true,
      render: (html: string) => (
        <div
          className="max-h-24 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ),
    },

    {
      title: "Banner",
      dataIndex: "banner",
      key: "banner",
      width: 100,
      render: (banner: string | File | null) =>
        banner ? (
          typeof banner === "string" ? (
            <Image src={banner} alt="banner" width={80} height={48} className="object-cover rounded" />
          ) : (
            <Image src={URL.createObjectURL(banner)} alt="banner" width={80} height={48} className="object-cover rounded" />
          )
        ) : null,
    },
    {
      title: "Video",
      key: "video",
      width: 120,
      render: (_: unknown, record: CourseType) =>
        record.video ? (
          <a href={URL.createObjectURL(record.video)} target="_blank" rel="noreferrer">▶ Video</a>
        ) : record.videoLink ? (
          <a href={record.videoLink} target="_blank" rel="noreferrer">▶ Video Link</a>
        ) : null,
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      width: 150
    },
    {
      title: "Published",
      dataIndex: "publishedDate",
      key: "publishedDate",
      width: 120
    },
    {
      title: "Expiry",
      dataIndex: "expiryDays",
      key: "expiryDays",
      width: 100,
      render: (days: number) => <Tag color="blue">{days} days</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: unknown, record: CourseType, index: number) => (
        <Space>
          <Button size="small" onClick={() => router.push(`/en/admin/courses/${record.id}`)}>View</Button>
          <Button size="small" type="primary" onClick={() => openEditModal(index)}>Edit</Button>
          <Button size="small" danger onClick={() => handleDelete(index)}>Delete</Button>
        </Space>
      ),
    },
  ];

  // Expanded row renderer for Quill content
  const expandedRowRender = (record: CourseType) => {
    return (
      <div style={{ margin: 0, padding: 16, background: '#fafafa' }}>
        <h4 style={{ marginBottom: 12 }}>Course Description</h4>
        <div
          dangerouslySetInnerHTML={{ __html: record.description }}
          style={{
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            padding: 16,
            background: 'white'
          }}
        />
      </div>
    );
  };

  const onFinish = (values: FormValues) => {
    const bannerFile = getUploadedFile(values.banner);
    const videoFile = getUploadedFile(values.video);

    const newCourse: CourseType = {
      id: uuidv4(),
      courseRole: values.courseRole,
      specialization: values.specialization,
      title: values.title,
      shortDescription: values.shortDescription,
      description: description || values.description,
      price: values.price,
      banner: bannerFile || null,
      video: videoFile || null,
      videoLink: values.videoLink || "",
      author: values.author,
      publishedDate: dayjs().format("YYYY-MM-DD"),
      expiryDays: values.expiryDays,
    };

    setCourses((prev) => [newCourse, ...prev]);
    message.success("Course created successfully!");
    form.resetFields();
    setDescription('');
    setShowForm(false);
  };

  const handleView = (course: CourseType) => {
    Modal.info({
      title: "Course Details",
      width: 800,
      content: (
        <div style={{ lineHeight: 1.6 }}>
          <p><b>Role:</b> {course.courseRole}</p>
          <p><b>Specialization:</b> {course.specialization}</p>
          <p><b>Title:</b> {course.title}</p>
          <p><b>Price:</b> AED {course.price.toFixed(2)}</p>
          <p><b>Short Description:</b> {course.shortDescription}</p>
          <p><b>Description:</b></p>
          <div
            dangerouslySetInnerHTML={{ __html: course.description }}
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              padding: 16,
              background: '#fafafa',
              marginTop: 8
            }}
          />
          <p style={{ marginTop: 16 }}><b>Author:</b> {course.author}</p>
          <p><b>Published:</b> {course.publishedDate}</p>
          <p><b>Expiry:</b> {course.expiryDays} days</p>
          {course.banner && typeof course.banner === "string" && (
            <Image src={course.banner} alt="banner" width={800} height={450} style={{ marginTop: 8 }} className="max-w-full object-cover rounded" />
          )}
        </div>
      ),
    });
  };

  const openEditModal = (index: number) => {
    const c = courses[index];
    setEditingIndex(index);
    setEditDescription(c.description);
    editForm.setFieldsValue({
      courseRole: c.courseRole,
      specialization: c.specialization,
      title: c.title,
      price: c.price,
      author: c.author,
      videoLink: c.videoLink,
      expiryDays: c.expiryDays,
      shortDescription: c.shortDescription,
      description: c.description,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (values: FormValues) => {
    if (editingIndex === null) return;
    const bannerFile = getUploadedFile(values.banner);
    const videoFile = getUploadedFile(values.video);

    setCourses((prev) => {
      const copy = [...prev];
      copy[editingIndex] = {
        ...copy[editingIndex],
        courseRole: values.courseRole,
        specialization: values.specialization,
        title: values.title,
        shortDescription: values.shortDescription,
        description: editDescription || values.description,
        price: values.price,
        banner: bannerFile ?? copy[editingIndex].banner,
        video: videoFile ?? copy[editingIndex].video,
        videoLink: values.videoLink ?? copy[editingIndex].videoLink,
        author: values.author,
        expiryDays: values.expiryDays,
      };
      return copy;
    });

    message.success("Course updated");
    setIsEditModalOpen(false);
    setEditingIndex(null);
    setEditDescription('');
    editForm.resetFields();
  };

  const handleDelete = (index: number) => {
    Modal.confirm({
      title: "Delete course?",
      onOk: () => {
        setCourses((prev) => prev.filter((_, i) => i !== index));
        message.success("Course deleted");
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>{showForm ? "Create Course" : "Courses List"}</h2>
        <Button type="primary"icon={showForm ? <ArrowLeftOutlined/> : <PlusOutlined />} style={{ background: "#1e293b" }} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Back to List" : "Create Course"}
        </Button>
      </div>

      {showForm && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item label="Course For" name="courseRole" rules={[{ required: true }]}>
              <Select placeholder="Select Role">
                <Option value="Doctor">Doctor</Option>
                <Option value="Nurse">Nurse</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Specialization" name="specialization" rules={[{ required: true }]}>
              <Select placeholder="Select Specialization" disabled={!role}>
                {role && specializations[role].map((s) => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Course Title" name="title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              label="Course Price (AED)"
              name="price"
              rules={[{ required: true, message: 'Please enter course price' }]}
            >
              <InputNumber<number>
                min={0}
                max={10000}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
                placeholder="0.00"
                formatter={(value) => `AED ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => (value ? Number(value.replace(/AED\s?|(,*)/g, '')) : 0)}
              />
            </Form.Item>

            <Form.Item label="Author" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Form.Item name="prefix" noStyle initialValue="Dr.">
                  <Select style={{ width: 80 }}>
                    <Select.Option value="Dr.">Dr.</Select.Option>
                    <Select.Option value="Mr.">Mr.</Select.Option>
                    {/* <Select.Option value="Mrs.">Mrs.</Select.Option> */}
                    <Select.Option value="Ms.">Ms.</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="author"
                  rules={[{ required: true, message: 'Please enter author name' }]}
                  noStyle
                  style={{ flex: 1 }}
                >
                  <Input placeholder="Enter author name" />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item label="Expiry Days" name="expiryDays" rules={[{ required: true }]}>
              <Select placeholder="Select expiry">
                {expiryOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Upload Banner" name="banner" valuePropName="fileList" getValueFromEvent={(e) => e && e.fileList}>
              <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                <Button icon={<UploadOutlined />}>Upload Banner</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Upload Video"
              name="video"
              valuePropName="fileList"
              getValueFromEvent={(e) => e && e.fileList}
              extra="Only video files allowed (max 500MB)"
            >
              <Upload {...videoUploadProps}>
                <Button icon={<UploadOutlined />}>Upload Video</Button>
              </Upload>
            </Form.Item>

            <Form.Item label="Or Video Link" name="videoLink">
              <Input placeholder="https://youtube.com/..." />
            </Form.Item>
          </div>

          <Form.Item
            label="Short Description"
            name="shortDescription"
            rules={[{ required: true, message: 'Please enter short description' }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter a brief summary of the course (this will be shown in the course list)..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Quill value={description} onChange={setDescription} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ background: "#1e293b" }}>Create Course</Button>
          </Form.Item>
        </Form>
      )}

      <Table
        dataSource={courses}
        columns={columns}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpand: handleExpand,
          expandIcon: ({ expanded, onExpand, record }) =>
            expanded ? (
              <UpOutlined onClick={e => onExpand(record, e)} />
            ) : (
              <DownOutlined onClick={e => onExpand(record, e)} />
            ),
        }}
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                style={{
                  background: "#1e293b", // dark slate gray
                  color: "#ffffff",      // white text
                  fontWeight: 600,
                  padding: "12px",
                  textTransform: "uppercase",
                  fontSize: 13,
                  border: "8px",        // remove border
                }}
              />
            )
          }
        }}
      />



      {/* Edit Modal */}
      <Modal
        title="Edit Course"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingIndex(null);
          setEditDescription('');
          editForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Form.Item label="Course Role" name="courseRole" rules={[{ required: true }]}>
              <Select placeholder="Select Role">
                <Option value="Doctor">Doctor</Option>
                <Option value="Nurse">Nurse</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Specialization" name="specialization" rules={[{ required: true }]}>
              <Select placeholder="Select Specialization">
                {Object.values(specializations).flat().map((s) => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Title" name="title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item
              label="Course Price (AED)"
              name="price"
              rules={[{ required: true, message: 'Please enter course price' }]}
            >
              <InputNumber<number>
                min={0}
                max={10000}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
                placeholder="0.00"
                formatter={(value) =>
                  `AED ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(value) => (value ? Number(value.replace(/AED\s?|(,*)/g, '')) : 0)}
              />
            </Form.Item>

            {/* <Form.Item label="Author" name="author" rules={[{ required: true }]}>
              <Input />
            </Form.Item> */}

            <Form.Item label="Author" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Form.Item name="prefix" noStyle initialValue="Dr.">
                  <Select style={{ width: 80 }}>
                    <Select.Option value="Dr.">Dr.</Select.Option>
                    <Select.Option value="Mr.">Mr.</Select.Option>
                    {/* <Select.Option value="Mrs.">Mrs.</Select.Option> */}
                    <Select.Option value="Ms.">Ms.</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="author"
                  rules={[{ required: true, message: 'Please enter author name' }]}
                  noStyle
                  style={{ flex: 1 }}
                >
                  <Input placeholder="Enter author name" />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item label="Expiry Days" name="expiryDays" rules={[{ required: true }]}>
              <Select placeholder="Select expiry">
                {expiryOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Upload Banner" name="banner" valuePropName="fileList" getValueFromEvent={(e) => e && e.fileList}>
              <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                <Button icon={<UploadOutlined />}>Upload Banner</Button>
              </Upload>
            </Form.Item>

            <Form.Item
              label="Upload Video"
              name="video"
              valuePropName="fileList"
              getValueFromEvent={(e) => e && e.fileList}
              extra="Only video files allowed (max 500MB)"
            >
              <Upload {...videoUploadProps}>
                <Button icon={<UploadOutlined />}>Upload Video</Button>
              </Upload>
            </Form.Item>

            <Form.Item label="Video Link" name="videoLink">
              <Input placeholder="https://youtube.com/..." />
            </Form.Item>
          </div>

          <Form.Item
            label="Short Description"
            name="shortDescription"
            rules={[{ required: true, message: 'Please enter short description' }]}
          >
            <TextArea
              rows={3}
              placeholder="Enter a brief summary of the course..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Quill value={editDescription} onChange={setEditDescription} />
          </Form.Item>

          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => {
                setIsEditModalOpen(false);
                setEditDescription('');
                editForm.resetFields();
              }}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}