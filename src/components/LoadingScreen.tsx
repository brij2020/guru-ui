"use client";

import React from 'react';
import { Row, Col, Typography, Progress, Card } from 'antd';
import { CodeOutlined, RocketOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LoadingScreenProps {
  testTitle: string;
  domain: string;
  progress: number;
  currentStep: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  testTitle, 
  domain, 
  progress, 
  currentStep 
}) => {
  const steps = [
    { key: 'initializing', icon: <RocketOutlined />, text: 'Initializing Test Environment' },
    { key: 'loading_questions', icon: <CodeOutlined />, text: 'Loading Questions' },
    { key: 'setting_timer', icon: <ThunderboltOutlined />, text: 'Setting Up Timer' },
    { key: 'ready', icon: <CheckCircleOutlined />, text: 'Ready to Start' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          maxWidth: 600,
          width: '100%',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'pulse 2s infinite'
          }}>
            <RocketOutlined style={{ fontSize: 32, color: 'white' }} />
          </div>
          <Title level={2} style={{ marginBottom: 8, color: '#333' }}>
            Preparing Your Test
          </Title>
          <Text style={{ fontSize: 16, color: '#666' }}>
            {testTitle} • {domain}
          </Text>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong>Loading...</Text>
            <Text strong>{progress}%</Text>
          </div>
          <Progress 
            percent={progress} 
            strokeColor={{
              '0%': '#667eea',
              '100%': '#764ba2',
            }}
            showInfo={false}
            style={{ marginBottom: 8 }}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {currentStep}
          </Text>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: 30 }}>
          {steps.map((step, index) => (
            <div
              key={step.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                marginBottom: 8,
                borderRadius: '8px',
                background: currentStep === step.text ? '#f0f5ff' : 'transparent',
                border: currentStep === step.text ? '1px solid #1890ff' : '1px solid transparent',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: progress >= (index + 1) * 25 ? '#52c41a' : '#d9d9d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
                color: 'white',
                fontSize: 12
              }}>
                {progress >= (index + 1) * 25 ? <CheckCircleOutlined /> : index + 1}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {step.icon}
                <Text style={{ marginLeft: 8, fontSize: 14 }}>{step.text}</Text>
              </div>
              {currentStep === step.text && (
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#1890ff',
                  animation: 'pulse 1.5s infinite'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Tips */}
        <div style={{
          background: '#f6ffed',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #b7eb8f'
        }}>
          <Text strong style={{ color: '#389e0d', display: 'block', marginBottom: 8 }}>
            💡 Quick Tips
          </Text>
          <ul style={{ margin: 0, paddingLeft: 16, color: '#666', fontSize: 12 }}>
            <li>Read each question carefully</li>
            <li>Manage your time wisely</li>
            <li>Review your answers before submitting</li>
          </ul>
        </div>

        {/* CSS Animation */}
        <style jsx global>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .loading-step {
            animation: fadeIn 0.5s ease-in;
          }
        `}</style>
      </Card>
    </div>
  );
};

export default LoadingScreen;