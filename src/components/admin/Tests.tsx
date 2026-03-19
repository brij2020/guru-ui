// app/quiz/page.tsx
"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Radio,
  Card,
  Typography,
  Table,
} from "antd";

const { Option } = Select;
const { Title, Text } = Typography;

interface Question {
  text: string;
  options: string[];
  correct: number | null;
}

interface QuizType {
  testType: string;
  testFor: string;
  specialization: string;
  totalQuestions: string;
  marking: string;
  questions: Question[];
}

// Define form values type (excluding questions which are managed separately)
interface QuizFormValues {
  testType: string;
  testFor: string;
  specialization: string;
  totalQuestions: string;
  marking: string;
}

const specializations: Record<string, string[]> = {
  Doctor: ["Cardiology", "Neurology", "Orthopedics"],
  Nurse: ["Pediatrics", "Emergency Care", "General Nursing"],
};

// Dummy quizzes
const dummyQuizzes: QuizType[] = [
  {
    testType: "Objective",
    testFor: "Doctor",
    specialization: "Cardiology",
    totalQuestions: "10",
    marking: "1",
    questions: [
      {
        text: "What is the normal heart rate?",
        options: ["60-100 bpm", "100-120 bpm", "40-60 bpm", "80-110 bpm"],
        correct: 0,
      },
      {
        text: "Which artery supplies the heart?",
        options: ["Coronary", "Carotid", "Pulmonary", "Aorta"],
        correct: 0,
      },
    ],
  },
  {
    testType: "Objective",
    testFor: "Doctor",
    specialization: "Neurology",
    totalQuestions: "5",
    marking: "1",
    questions: [
      {
        text: "Which nerve controls facial expression?",
        options: ["Facial nerve", "Vagus nerve", "Optic nerve", "Trigeminal nerve"],
        correct: 0,
      },
      {
        text: "What is the normal CSF pressure?",
        options: ["10-20 cm H2O", "5-10 cm H2O", "20-30 cm H2O", "0-5 cm H2O"],
        correct: 0,
      },
    ],
  },
  {
    testType: "Subjective",
    testFor: "Nurse",
    specialization: "Pediatrics",
    totalQuestions: "5",
    marking: "1",
    questions: [
      {
        text: "Which vaccine is given at birth?",
        options: ["BCG", "Polio", "Hep B", "MMR"],
        correct: 0,
      },
      {
        text: "What is the normal respiratory rate for a newborn?",
        options: ["30-60", "20-40", "40-80", "50-70"],
        correct: 0,
      },
    ],
  },
  {
    testType: "Objective",
    testFor: "Nurse",
    specialization: "Emergency Care",
    totalQuestions: "8",
    marking: "1/3",
    questions: [
      {
        text: "What is the first step in CPR?",
        options: [
          "Check responsiveness",
          "Call for help",
          "Open airway",
          "Start compressions",
        ],
        correct: 0,
      },
      {
        text: "Which fluid is used for resuscitation?",
        options: ["Normal saline", "Glucose 5%", "Ringer lactate", "Plasma"],
        correct: 0,
      },
    ],
  },
  {
    testType: "Objective",
    testFor: "Doctor",
    specialization: "Orthopedics",
    totalQuestions: "7",
    marking: "1/4",
    questions: [
      {
        text: "Which bone is commonly fractured in children?",
        options: ["Clavicle", "Femur", "Radius", "Tibia"],
        correct: 0,
      },
      {
        text: "Which joint is affected in osteoarthritis?",
        options: ["Knee", "Shoulder", "Elbow", "Wrist"],
        correct: 0,
      },
    ],
  },
];

export default function Tests() {
  const [form] = Form.useForm();
  const [showForm, setShowForm] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", "", "", ""], correct: null },
  ]);
  const [quizzes, setQuizzes] = useState<QuizType[]>(dummyQuizzes);

  const addQuestion = () => {
    setQuestions([...questions, { text: "", options: ["", "", "", ""], correct: null }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updated = [...questions];
      updated.splice(index, 1);
      setQuestions(updated);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (qIndex: number, value: number) => {
    const updated = [...questions];
    updated[qIndex].correct = value;
    setQuestions(updated);
  };

  const onFinish = (values: QuizFormValues) => {
    const newQuiz: QuizType = { ...values, questions };
    setQuizzes([newQuiz, ...quizzes]); // prepend to list
    setQuestions([{ text: "", options: ["", "", "", ""], correct: null }]);
    form.resetFields();
    setShowForm(false); // go back to list after submit
  };

  // Table columns
  const columns = [
    { title: "Test Type", dataIndex: "testType", key: "testType" },
    { title: "Test For", dataIndex: "testFor", key: "testFor" },
    { title: "Specialization", dataIndex: "specialization", key: "specialization" },
    { title: "Total Questions", dataIndex: "totalQuestions", key: "totalQuestions" },
    { title: "Marking", dataIndex: "marking", key: "marking" },
    {
      title: "Questions",
      dataIndex: "questions",
      key: "questions",
      render: (qs: Question[]) => (
        <div className="space-y-2">
          {qs.map((q, idx) => (
            <div key={idx}>
              <Text strong>{`Q${idx + 1}: `}</Text>
              {q.text}
              <div className="ml-4 mt-1 grid grid-cols-2 gap-2">
                {q.options.map((opt, oIdx) => (
                  <Text
                    key={oIdx}
                    className={q.correct === oIdx ? "text-green-600 font-semibold" : ""}
                  >
                    {String.fromCharCode(65 + oIdx)}. {opt} {q.correct === oIdx && "✓"}
                  </Text>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header with toggle button */}
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>{showForm ? "Create Test" : "Tests List"}</Title>
        <Button
          type="primary"
          style={{ background: "#7b1fa2" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "⬅ Back to List" : "➕ Create Test"}
        </Button>
      </div>

      {/* Create Test Form */}
      {showForm && (
        <Card className="mb-8 shadow-lg rounded-lg">
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Test Type"
                name="testType"
                rules={[{ required: true, message: "Select Test Type" }]}
              >
                <Select placeholder="Select Test Type">
                  <Option value="Objective">Objective</Option>
                  <Option value="Subjective">Subjective</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Test For"
                name="testFor"
                rules={[{ required: true, message: "Select Test For" }]}
              >
                <Select placeholder="Select Test For">
                  <Option value="Doctor">Doctor</Option>
                  <Option value="Nurse">Nurse</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Specialization"
                shouldUpdate={(prev, curr) => prev.testFor !== curr.testFor}
              >
                {({ getFieldValue }) => {
                  const testFor = getFieldValue("testFor");
                  return (
                    <Form.Item
                      name="specialization"
                      rules={[{ required: true, message: "Select Specialization" }]}
                      noStyle
                    >
                      <Select placeholder="Select Specialization" disabled={!testFor}>
                        {testFor &&
                          specializations[testFor]?.map((spec: string) => (
                            <Option key={spec} value={spec}>{spec}</Option>
                          ))}
                      </Select>
                    </Form.Item>
                  );
                }}
              </Form.Item>

              <Form.Item
                label="Total Questions"
                name="totalQuestions"
                rules={[{ required: true, message: "Select Total Questions" }]}
              >
                <Select placeholder="Select Total Questions">
                  {[10, 30, 50, 100].map((num) => (
                    <Option key={num} value={num.toString()}>{num}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Marking Scheme"
                name="marking"
                rules={[{ required: true, message: "Select Marking" }]}
              >
                <Select placeholder="Select Marking">
                  <Option value="1">+1 for correct</Option>
                  <Option value="1/3">+1, -1/3 for incorrect</Option>
                  <Option value="1/4">+1, -1/4 for incorrect</Option>
                </Select>
              </Form.Item>
            </div>

            {/* Questions Section */}
            <div className="mt-6">
              <Title level={5}>Questions</Title>
              {questions.map((q, qIndex) => (
                <Card
                  key={qIndex}
                  className="mb-4 bg-gray-100"
                  type="inner"
                  title={`Question ${qIndex + 1}`}
                  extra={questions.length > 1 && (
                    <Button danger onClick={() => removeQuestion(qIndex)}>Remove</Button>
                  )}
                >
                  <Input
                    placeholder="Enter question text"
                    value={q.text}
                    onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                    className="mb-4"
                  />

                  <Radio.Group
                    value={q.correct}
                    onChange={(e) => handleCorrectChange(qIndex, e.target.value)}
                    className="w-full mb-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => (
                        <Radio key={oIdx} value={oIdx} className="flex items-center">
                          <Input
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                            className="ml-2"
                          />
                        </Radio>
                      ))}
                    </div>
                  </Radio.Group>
                </Card>
              ))}

              <div className="flex gap-4 mt-4">
                <Button type="dashed" onClick={addQuestion} className="flex-1">
                  + Add Question
                </Button>
                <Button type="primary" htmlType="submit" className="flex-1">
                  Create Test
                </Button>
              </div>
            </div>
          </Form>
        </Card>
      )}

      {/* Existing Quizzes Table */}
      {!showForm && (
        <Table
          columns={columns}
          dataSource={quizzes}
          rowKey={(_, idx) => idx?.toString() || Math.random().toString()}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  );
}