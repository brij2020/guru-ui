'use client';

import React, { useState } from 'react';
import { Card, Table, Button, Tag, Space, Typography, Row, Col, message, Modal } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Certificate } from '../../../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const { Title, Text } = Typography;

// Mock data - replace with actual API call
const mockCertificates: Certificate[] = [
  {
    id: '1',
    courseName: 'Heart Anatomy',
    courseId: 'HEART001',
    completionDate: '2024-01-15',
    issuedDate: '2024-01-16',
    certificateId: 'CERT-HEART-001',
    instructor: 'Md. Salman',
    duration: '8 weeks',
    grade: 'A+',
    score: 98
  },
  {
    id: '2',
    courseName: 'Cardiac Pharmacology',
    courseId: 'CP002',
    completionDate: '2024-01-10',
    issuedDate: '2024-01-11',
    certificateId: 'CERT-CP-002',
    instructor: 'Massod Ali',
    duration: '6 weeks',
    grade: 'A',
    score: 95
  },
  {
    id: '3',
    courseName: 'ECG Basics',
    courseId: 'ECG003',
    completionDate: '2024-02-05',
    issuedDate: '2024-02-06',
    certificateId: 'CERT-ECG-003',
    instructor: 'Dr. monira',
    duration: '4 weeks',
    grade: 'A',
    score: 92
  },
  {
    id: '4',
    courseName: 'Advanced Cardiology',
    courseId: 'AC004',
    completionDate: '2024-03-12',
    issuedDate: '2024-03-13',
    certificateId: 'CERT-AC-004',
    instructor: 'Dr. Fahim',
    duration: '10 weeks',
    grade: 'A+',
    score: 99
  }
];

interface UserCertificateProps {
  lang: 'en' | 'ar';
}

// Certificate Modal Component
const CertificateModal: React.FC<{
  certificate: Certificate | null;
  visible: boolean;
  onClose: () => void;
  onDownload: (certificate: Certificate) => void;
}> = ({ certificate, visible, onClose, onDownload }) => {
  const certificateRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!certificate) return;
    
    const input = certificateRef.current;
    if (!input) return;

    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${certificate.courseName}_Certificate.pdf`);
    });
    
    onDownload(certificate);
  };

  if (!certificate) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200 }}
      centered
    >
      <div className="flex flex-col items-center p-8 bg-gray-100 font-sans">
        <div 
          ref={certificateRef}
          className="relative w-[900px] h-[650px] bg-purple-50 border-8 border-purple-800 p-10 text-center font-serif shadow-lg overflow-hidden"
        >
          {/* Decorative wave backgrounds */}
          <div className="absolute left-0 right-0 h-48 bg-purple-200 -top-12 rounded-b-[50%] z-0"></div>
          <div className="absolute left-0 right-0 h-48 bg-purple-200 -bottom-12 rounded-t-[50%] z-0"></div>

          {/* Top Logo - you can replace with your actual logo */}
            <img
                src="/branding/test-guru-seo-logo.svg"
                alt="Test Guru Logo"
                className="absolute top-12 left-10 w-40 h-auto z-10 rounded-xl"
            />

          {/* Header */}
          <div className="relative z-10">
            <h3 className="text-lg mb-1 text-gray-800">Pharmaceutical Licensing Authority</h3>
            <h2 className="text-2xl font-bold mb-8 text-purple-800">Course Completion Certificate</h2>
          </div>

          {/* Body */}
          <div className="relative z-10">
            <p className="text-lg my-4 text-gray-700">This is to certify that</p>
            <h1 className="text-4xl font-bold my-5 text-gray-900">Dr. Rufiadah Shafi</h1>
            <p className="text-lg my-4 text-gray-700">
              has successfully completed the course
            </p>
            <h3 className="text-2xl font-bold my-4 text-purple-800">{certificate.courseName}</h3>
            <p className="text-lg my-4 text-gray-700">
              under the guidance of <strong>{certificate.instructor}</strong>
            </p>
            
            <div className="flex justify-center gap-8 my-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Grade</p>
                <p className="text-xl font-bold text-purple-800">{certificate.grade}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-xl font-bold text-purple-800">{certificate.score}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-xl font-bold text-purple-800">{certificate.duration}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-12 text-gray-700">
            <p className="text-base">
              Completed on {new Date(certificate.completionDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} <br />
              Certificate ID: <strong>{certificate.certificateId}</strong>
            </p>

            <div className="mt-8 text-center">
              <hr className="border-t-2 border-purple-800 w-48 mx-auto mb-2" />
              <p className="font-bold">Dr. Fatima Ansari</p>
              <span className="text-sm text-gray-600">Chairperson, Board of Examination</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-5">
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            size="large"
          >
            Download Certificate
          </Button>
          <Button 
            onClick={onClose}
            size="large"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const UserCertificate: React.FC<UserCertificateProps> = ({ lang }) => {
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [loading, setLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    setLoading(true);
    message.info(`Downloading certificate: ${certificate.certificateId}`);
    
    // Simulate API call for download
    setTimeout(() => {
      setLoading(false);
      message.success(`Certificate ${certificate.certificateId} downloaded successfully!`);
    }, 1500);
  };

  const handleModalDownload = (certificate: Certificate) => {
    
    message.success(`Certificate ${certificate.certificateId} downloaded successfully!`);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCertificate(null);
  };

  const columns: ColumnsType<Certificate> = [
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (text: string, record: Certificate) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.courseId}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Instructor',
      dataIndex: 'instructor',
      key: 'instructor',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Completion Date',
      dataIndex: 'completionDate',
      key: 'completionDate',
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text>{new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Duration: {mockCertificates.find(c => c.completionDate === date)?.duration}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Grade/Score',
      key: 'grade',
      render: (_, record) => (
        <Space>
          {record.grade && (
            <Tag color="blue" style={{ margin: 0 }}>
              {record.grade}
            </Tag>
          )}
          {record.score && (
            <Text strong>{record.score}%</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Certificate ID',
      dataIndex: 'certificateId',
      key: 'certificateId',
      render: (text: string) => (
        <Tag color="green" style={{ margin: 0 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeOutlined />}
            onClick={() => handleViewCertificate(record)}
            size="small"
          >
            View Certificate
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadCertificate(record)}
            loading={loading}
            size="small"
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card style={{border:"none"}}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  My Certificates
                </Title>
                <Text type="secondary">
                  View and download your course completion certificates
                </Text>
              </div>
              
              <Card>
                <Table 
                  columns={columns}
                  dataSource={certificates}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} of ${total} certificates`,
                  }}
                  scroll={{ x: 1000 }}
                />
              </Card>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCertificate}
        visible={modalVisible}
        onClose={handleCloseModal}
        onDownload={handleModalDownload}
      />
    </>
  );
};

export default UserCertificate;
