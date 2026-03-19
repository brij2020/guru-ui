"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Tabs,
  List,
  Typography,
  Row,
  Col,
  message,
  Modal,
  Progress,
  Radio,
  Space,
} from "antd";
import {
  PlayCircleOutlined,
  FilePdfOutlined,
  NotificationOutlined,
  ProfileOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import cardio from "../../../public/images/cardiology.jpg";
import basics from "../../../public/images/ECG.jpeg";
import pharma from "../../../public/images/pharma.jpg";
import inter from "../../../public/images/inter.png";
import { getTestById, getQuizQuestionsForMyCourses, TestQuestion } from "../../utils/testData";

const { Title, Text } = Typography;

export default function MyCourses({ dict, lang }: any) {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [quizData, setQuizData] = useState({
    currentQuestion: 0,
    answers: {} as Record<string, number>,
    isSubmitted: false
  });

  const courses = [
    {
      id: 1,
      title: dict?.myCoursesData?.lecture1 || "Lecture 1 - Heart Anatomy",
      description: dict?.myCoursesData?.lecture1Desc || "Overview of cardiac chambers, valves and major vessels.",
      image: cardio,
      video: "/videos/alice.mp4",
      announcements: [
        dict?.myCoursesData?.lecture1A1 || "Live doubt session on Friday",
        dict?.myCoursesData?.lecture1A2 || "Assignment due next week",
      ],
      tests: [
        {
          id: "t1",
          name: dict?.myCoursesData?.heartQuiz || "Heart Anatomy Quiz",
          language: dict?.languageMixed || "English/Arabic",
        },
        {
          id: "t2",
          name: dict?.myCoursesData?.mcq || "Anatomy MCQ",
          language: dict?.languageMixed || "English/Arabic",
        },
      ],
      pdfs: ["/pdfs/Heart-Anatomy-Notes.pdf", "/pdfs/Cardiac-Diagram.pdf"],
    },
    {
      id: 2,
      title: dict?.myCoursesData?.lecture2 || "Lecture 2 - ECG Basics",
      description: dict?.myCoursesData?.lecture2Desc || "How to read a basic ECG and recognize common patterns.",
      image: basics,
      video: "/assets/videos/alice.mp4",
      announcements: [
        dict?.myCoursesData?.lecture2A1 || "Quiz will be unlocked Sunday",
      ],
      tests: [
        {
          id: "t3",
          name: dict?.myCoursesData?.ecgTest || "ECG Pattern Test",
          language: dict?.languageEnglish || "English",
        },
      ],
      pdfs: ["/pdfs/ECG-Basics.pdf"],
    },
    {
      id: 3,
      title: dict?.myCoursesData?.lecture3 || "Lecture 3 - Cardiac Pharmacology",
      description: dict?.myCoursesData?.lecture3Desc || "Key drugs used in emergency cardiac care and their effects.",
      image: pharma,
      video: "/videos/lecture3.mp4",
      announcements: [
        dict?.myCoursesData?.lecture3A1 || "MCQ practice paper uploaded",
      ],
      tests: [
        {
          id: "t4",
          name: dict?.myCoursesData?.pharmaQuiz || "Pharma Quiz",
          language: dict?.languageArabic || "Arabic",
        },
      ],
      pdfs: ["/pdfs/Cardiac-Drugs.pdf"],
    },
    {
      id: 4,
      title: dict?.myCoursesData?.lecture4 || "Lecture 4 - Interventions",
      description: dict?.myCoursesData?.lecture4Desc || "PCI basics and indications — case discussions.",
      image: inter,
      video: "/videos/lecture4.mp4",
      announcements: [
        dict?.myCoursesData?.lecture4A1 || "Case study discussion on Wednesday",
      ],
      tests: [
        {
          id: "t5",
          name: dict?.myCoursesData?.interQuiz || "Intervention Quiz",
          language: dict?.languageEnglish || "English",
        },
      ],
      pdfs: ["/pdfs/PCI-Guidelines.pdf"],
    },
  ];

  // Get test results from localStorage
  const getTestResults = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quizResults');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error("Error parsing quiz results:", error);
          return {};
        }
      }
    }
    return {};
  };

  // Get retake counts from localStorage
  const getRetakeCounts = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quizRetakeCounts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          return {};
        }
      }
    }
    return {};
  };

  // Get current retake count for a test
  const getRetakeCount = (testId: string) => {
    const retakeCounts = getRetakeCounts();
    return retakeCounts[testId] || 0;
  };

  // Increment retake count
  const incrementRetakeCount = (testId: string) => {
    const retakeCounts = getRetakeCounts();
    retakeCounts[testId] = (retakeCounts[testId] || 0) + 2;
    localStorage.setItem('quizRetakeCounts', JSON.stringify(retakeCounts));
    return retakeCounts[testId];
  };

  // Get quiz questions from testData
  const getQuizQuestions = (testId: string) => {
    return getQuizQuestionsForMyCourses(testId);
  };

  const handleStartTest = (test: any) => {
    setActiveTest(test);
    setQuizData({
      currentQuestion: 0,
      answers: {},
      isSubmitted: false
    });
    setShowQuiz(true);
  };

  const handleRetakeTest = (test: any) => {
    const retakeCount = getRetakeCount(test.id);
    
    if (retakeCount >= 1) {
      message.warning("You can only retake this test once!");
      return;
    }
    
    // Increment retake count
    incrementRetakeCount(test.id);
    
    // Start test
    setActiveTest(test);
    setQuizData({
      currentQuestion: 0,
      answers: {},
      isSubmitted: false
    });
    setShowQuiz(true);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setQuizData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: optionIndex
      }
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeTest) return;
    
    const questions = getQuizQuestions(activeTest.id);
    let correct = 0;
    
    questions.forEach(q => {
       if (!q.id) return;
      if (quizData.answers[q.id] === q.correct) {
        correct++;
      }
    });
    
    const result = {
      score: correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      passed: (correct / questions.length) >= 0.7,
      timestamp: new Date().toISOString(),
      answers: quizData.answers,
      testName: activeTest.name,
      isRetake: getRetakeCount(activeTest.id) > 0
    };
    
    // Save to localStorage
    const allResults = getTestResults();
    allResults[activeTest.id] = result;
    localStorage.setItem('quizResults', JSON.stringify(allResults));
    
    // Mark as submitted
    setQuizData(prev => ({ ...prev, isSubmitted: true }));
    
    // Show success message
    const retakeCount = getRetakeCount(activeTest.id);
    if (retakeCount > 0) {
      message.success("Retake test submitted successfully!");
    } else {
      message.success("Test submitted successfully! You can view results from View Result button.");
    }
  };

  const handleViewResult = (testId: string) => {
    const results = getTestResults();
    const result = results[testId];
    
    if (!result) {
      message.warning("Please complete the test first!");
      return;
    }
    
    // Fix: Ensure answers object exists
    const resultWithAnswers = {
      ...result,
      answers: result.answers || {} // Default to empty object if undefined
    };
    
    setSelectedResult(resultWithAnswers);
    setSelectedTestId(testId);
    setShowResultModal(true);
  };

  // Render Result Modal
  const renderResultModal = () => {
    if (!showResultModal || !selectedResult) return null;
    
    const questions = getQuizQuestions(selectedTestId);
    
    return (
      <Modal
        title={`Test Result - ${selectedResult.testName || selectedTestId} ${selectedResult.isRetake ? '(Retake)' : ''}`}
        open={showResultModal}
        onCancel={() => setShowResultModal(false)}
        width={800}
        style={{ top: 20 }}
        footer={[
          <Button key="close" onClick={() => setShowResultModal(false)}>
            Close
          </Button>
        ]}
      >
        <div style={{ padding: "10px" }}>
          {/* Score Summary */}
          <div style={{ 
            textAlign: "center", 
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: "#fafafa",
            borderRadius: "8px"
          }}>
            <Title level={2} style={{ marginBottom: "10px" }}>
              {selectedResult.score}/{selectedResult.total}
            </Title>
            <div style={{ 
              fontSize: "20px", 
              fontWeight: "bold",
              color: selectedResult.passed ? "#52c41a" : "#ff4d4f",
              marginBottom: "10px"
            }}>
              {selectedResult.passed ? "PASSED" : "FAILED"}
            </div>
            <Text type="secondary">
              Submitted on: {new Date(selectedResult.timestamp).toLocaleDateString()}
              {selectedResult.isRetake && " (Retake)"}
            </Text>
          </div>
          
          {/* Question-wise Review */}
          <Title level={4} style={{ marginBottom: "20px" }}>
            Question-wise Review:
          </Title>
          
          <div style={{ maxHeight: "500px", overflowY: "auto", paddingRight: "10px" }}>
            {questions.map((q, idx) => {
              // FIX: Check if answers exist and has the question id
              const userAnswer = 
              q.id && selectedResult.answers
              ? selectedResult.answers[q.id] : undefined;
              const isCorrect = userAnswer !== undefined && userAnswer === q.correct;
              
              return (
                <Card 
                  key={q.id} 
                  size="small" 
                  style={{ 
                    marginBottom: "15px",
                    borderLeft: `4px solid ${isCorrect ? "#52c41a" : "#ff4d4f"}`
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <Text strong>Q{idx + 1}: {q.question}</Text>
                  </div>
                  
                  <div style={{ marginLeft: "10px" }}>
                    {q.options.map((opt, optIdx) => {
                      const isUserAnswer = userAnswer === optIdx;
                      const isCorrectAnswer = optIdx === q.correct;
                      
                      return (
                        <div 
                          key={optIdx}
                          style={{ 
                            padding: "8px 5px",
                            margin: "4px 0",
                            backgroundColor: isCorrectAnswer ? "#f6ffed" : 
                                          isUserAnswer && !isCorrect ? "#fff2f0" : "transparent",
                            borderRadius: "4px",
                            border: isCorrectAnswer ? "1px solid #b7eb8f" : 
                                   isUserAnswer && !isCorrect ? "1px solid #ffccc7" : "1px solid transparent"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ 
                              width: "20px", 
                              height: "20px", 
                              borderRadius: "50%",
                              backgroundColor: isCorrectAnswer ? "#52c41a" : 
                                            isUserAnswer && !isCorrect ? "#ff4d4f" : "#d9d9d9",
                              marginRight: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "12px"
                            }}>
                              {isCorrectAnswer ? "✓" : 
                               isUserAnswer && !isCorrect ? "✗" : ""}
                            </div>
                            <div>
                              <Text style={{ 
                                color: isCorrectAnswer ? "#52c41a" : 
                                      isUserAnswer && !isCorrect ? "#ff4d4f" : "#000"
                              }}>
                                {opt}
                                {isCorrectAnswer && " (Correct Answer)"}
                                {isUserAnswer && !isCorrect && " (Your Answer)"}
                              </Text>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ 
                    marginTop: "15px", 
                    padding: "10px",
                    backgroundColor: "#fafafa",
                    borderRadius: "4px"
                  }}>
                    <Text type="secondary">
                      <strong>Status:</strong>{" "}
                      <span style={{ 
                        color: isCorrect ? "#52c41a" : "#ff4d4f",
                        fontWeight: "bold"
                      }}>
                        {isCorrect ? "Correct ✓" : "Incorrect ✗"}
                      </span>
                      {userAnswer === undefined && (
                        <span style={{ color: "#fa8c16", marginLeft: "10px" }}>
                          (Not answered)
                        </span>
                      )}
                    </Text>
                    {q.explanation && (
                      <div style={{ marginTop: "10px", padding: "8px", backgroundColor: "#e6f7ff", borderRadius: "4px" }}>
                        <Text type="secondary">
                          <strong>Explanation:</strong> {q.explanation}
                        </Text>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Performance Summary */}
          <Card style={{ marginTop: "20px" }}>
            <Title level={5} style={{ marginBottom: "15px" }}>Performance Summary</Title>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#52c41a" }}>
                    {selectedResult.score}
                  </div>
                  <Text type="secondary">Correct Answers</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ff4d4f" }}>
                    {selectedResult.total - selectedResult.score}
                  </div>
                  <Text type="secondary">Incorrect Answers</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </Modal>
    );
  };

  // Render Quiz Modal
  const renderQuizModal = () => {
    if (!activeTest || !showQuiz) return null;
    
    const questions = getQuizQuestions(activeTest.id);
    
    if (questions.length === 0) {
      return (
        <Modal
          title={activeTest.name}
          open={showQuiz}
          onCancel={() => setShowQuiz(false)}
          footer={[
            <Button key="close" onClick={() => setShowQuiz(false)}>
              Close
            </Button>
          ]}
        >
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Title level={4}>No questions available for this test</Title>
          </div>
        </Modal>
      );
    }

    const currentQuestion = questions[quizData.currentQuestion];
    const isLastQuestion = quizData.currentQuestion === questions.length - 1;
    const answeredCount = Object.keys(quizData.answers).length;
    const retakeCount = getRetakeCount(activeTest.id);

    if (quizData.isSubmitted) {
      // Quiz Submitted View (Simple - No results shown)
      return (
        <Modal
          title="Quiz Submitted"
          open={showQuiz}
          onCancel={() => setShowQuiz(false)}
          footer={[
            <Button 
              key="close" 
              type="primary" 
              onClick={() => setShowQuiz(false)}
            >
              Close
            </Button>
          ]}
        >
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ 
              fontSize: "48px", 
              color: "#52c41a",
              marginBottom: "20px"
            }}>
              ✓
            </div>
            <Title level={3} style={{ color: "#52c41a" }}>
              {retakeCount > 0 ? "Retake Test Submitted!" : "Quiz Submitted Successfully!"}
            </Title>
            <Text style={{ fontSize: "16px", display: "block", margin: "20px 0" }}>
              Your {retakeCount > 0 ? "retake test" : "test"} has been submitted successfully.
            </Text>
            <Text type="secondary" style={{ display: "block", marginBottom: "30px" }}>
              You can view your results by clicking on "View Result" button.
            </Text>
            <div style={{ 
              padding: "15px", 
              backgroundColor: "#f6ffed",
              borderRadius: "8px",
              marginTop: "20px"
            }}>
              <Text>Answered: {answeredCount}/{questions.length} questions</Text>
              {retakeCount > 0 && (
                <Text style={{ display: "block", marginTop: "5px" }}>
                  This was your retake attempt ({retakeCount}/1 allowed)
                </Text>
              )}
            </div>
          </div>
        </Modal>
      );
    }

    // Quiz Questions View
    return (
      <Modal
        title={`${activeTest.name} ${retakeCount > 0 ? '(Retake)' : ''} (Question ${quizData.currentQuestion + 1}/${questions.length})`}
        open={showQuiz}
        onCancel={() => setShowQuiz(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        {retakeCount > 0 && (
          <div style={{ 
            marginBottom: "15px", 
            padding: "10px",
            backgroundColor: "#fff7e6",
            border: "1px solid #ffd591",
            borderRadius: "6px"
          }}>
            <Text strong style={{ color: "#fa8c16" }}>
              ⚠️ This is your retake attempt ({retakeCount}/1)
            </Text>
          </div>
        )}
        
        <div>
          {/* Progress Bar */}
          <div style={{ marginBottom: "20px" }}>
            <Progress 
              percent={((quizData.currentQuestion + 1) / questions.length) * 100} 
              size="small" 
              showInfo={false}
            />
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              marginTop: "5px"
            }}>
              <Text type="secondary">
                Question {quizData.currentQuestion + 1} of {questions.length}
              </Text>
              <Text type="secondary">
                Answered: {answeredCount}/{questions.length}
              </Text>
            </div>
          </div>

          {/* Question */}
          <Card style={{ marginBottom: "20px", backgroundColor: "#fafafa" }}>
            <Title level={4} style={{ marginBottom: "0" }}>
              {currentQuestion.question}
            </Title>
          </Card>

          {/* Options */}
          <div style={{ marginBottom: "30px" }}>
            <Radio.Group
              value={currentQuestion.id ? quizData.answers[currentQuestion.id] : undefined}
              onChange={(e) => {
                if (!currentQuestion.id) return
                handleAnswerSelect(currentQuestion.id, e.target.value)}}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "15px",
                      margin: "8px 0",
                      border: "1px solid",
                      borderColor: currentQuestion.id && quizData.answers[currentQuestion.id] === idx ? "#1890ff" : "#d9d9d9",
                      borderRadius: "6px",
                      backgroundColor: currentQuestion.id && quizData.answers[currentQuestion.id] === idx ? "#e6f7ff" : "white",
                      cursor: "pointer"
                    }}
                    onClick={() => currentQuestion.id && handleAnswerSelect(currentQuestion.id, idx)}
                  >
                    <Radio value={idx} style={{ width: "100%" }}>
                      <span style={{ fontSize: "16px" }}>{option}</span>
                    </Radio>
                  </div>
                ))}
              </Space>
            </Radio.Group>
          </div>

          {/* Question Numbers */}
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "8px", 
            marginBottom: "30px",
            justifyContent: "center"
          }}>
            {questions.map((_, idx) => (
              <Button
                key={idx}
                type={quizData.currentQuestion === idx ? "primary" : 
                      questions[idx].id &&
                      quizData.answers[questions[idx].id] !== undefined ? "default" : "dashed"}
                shape="circle"
                size="small"
                onClick={() => setQuizData(prev => ({ ...prev, currentQuestion: idx }))}
              >
                {idx + 1}
              </Button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            padding: "20px 0",
            borderTop: "1px solid #f0f0f0"
          }}>
            <Button 
              onClick={() => {
                if (quizData.currentQuestion > 0) {
                  setQuizData(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
                }
              }}
              disabled={quizData.currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div>
              <Text type="secondary" style={{ marginRight: "15px" }}>
                {answeredCount} of {questions.length} answered
              </Text>
            </div>
            
            {isLastQuestion ? (
              <Button 
                type="primary" 
                onClick={handleSubmitQuiz}
                disabled={answeredCount < questions.length}
              >
                {retakeCount > 0 ? "Submit Retake" : "Submit Quiz"}
              </Button>
            ) : (
              <Button 
                type="primary" 
                onClick={() => {
                  setQuizData(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
                }}
              >
                Next Question
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      {!selectedCourse ? (
        <>
          <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
            {dict?.myCourses?.title || "Your Courses"}
          </Title>

          <Row gutter={[16, 16]}>
            {courses.map((course) => (
              <Col xs={24} md={12} key={course.id}>
                <Card
                  hoverable
                  style={{ borderRadius: "10px", cursor: "default" }}
                  cover={
                    <Image
                      alt={course.title}
                      src={course.image}
                      style={{ height: "10", objectFit: "cover" }}
                    />
                  }
                  actions={[
                    <Button
                      key="play"
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => setSelectedCourse(course)}
                    >
                      {dict?.buttons?.play || "Play"}
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={course.title}
                    description={course.description}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <div>
          {/* Back Button */}
          <Button
            onClick={() => setSelectedCourse(null)}
            style={{ marginBottom: "15px" }}
          >
            ← {dict?.buttons?.back || "Back"}
          </Button>

          {/* Video Section */}
          <Title level={3}>{selectedCourse.title}</Title>
          <video
            controls
            src={selectedCourse.video}
            style={{
              width: "100%",
              maxHeight: "400px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          />

          {/* Tabs */}
          <Tabs
            defaultActiveKey="announcements"
            items={[
              {
                key: "announcements",
                label: (
                  <>
                    <NotificationOutlined />{" "}
                    {dict?.tabs?.announcements || "Announcements"}
                  </>
                ),
                children: (
                  <List
                    bordered
                    dataSource={selectedCourse.announcements}
                    renderItem={(item: string) => (
                      <List.Item>{item}</List.Item>
                    )}
                  />
                ),
              },
              {
                key: "tests",
                label: (
                  <>
                    <ProfileOutlined />{" "}
                    {dict?.tabs?.tests || "Test Series"}
                  </>
                ),
                children: (
                  <List
                    bordered
                    dataSource={selectedCourse.tests}
                    renderItem={(t: any) => {
                      const results = getTestResults();
                      const result = results[t.id];
                      const retakeCount = getRetakeCount(t.id);
                      const canRetake = retakeCount < 1 && result; // Can retake only once
                      const hasAttempted = !!result; // Has attempted at least once
                      
                      return (
                        <List.Item
                          actions={[
                            !hasAttempted ? (
                              <Button
                                key="start"
                                type="primary"
                                onClick={() => handleStartTest(t)}
                              >                            
                                {dict?.buttons?.startTest || "Start Test"}
                              </Button>
                            ) : canRetake ? (
                              <Button
                                key="retake"
                                type="default"
                                icon={<RedoOutlined />}
                                onClick={() => handleRetakeTest(t)}
                              >
                                Retake Test
                              </Button>
                            ) : (
                              <Button
                                key="disabled"
                                disabled
                                type="dashed"
                              >
                                Retake Used
                              </Button>
                            ),
                            <Button 
                              key="view" 
                              onClick={() => handleViewResult(t.id)}
                              type={result ? "default" : "dashed"}
                            >
                              {dict?.buttons?.viewResult || "View Result"}
                              {result && (
                                <span style={{ 
                                  marginLeft: "8px", 
                                  fontWeight: "bold",
                                }}>
                                </span>
                              )}
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={t.name}
                            description={`${dict?.labels?.language || "Language"}: ${t.language}`}
                          />
                          {result && (
                            <div style={{ 
                              padding: "4px 12px",
                              backgroundColor: result.passed ? "#f6ffed" : "#fff2f0",
                              borderRadius: "4px",
                              border: `1px solid ${result.passed ? "#b7eb8f" : "#ffccc7"}`
                            }}>
                              <Text style={{ 
                                color: result.passed ? "#52c41a" : "#ff4d4f",
                                fontWeight: "bold"
                              }}>
                                {result.passed ? "✓ Passed" : "✗ Failed"}
                                {retakeCount > 0 && " (Retaken)"}
                              </Text>
                            </div>
                          )}
                        </List.Item>
                      );
                    }}
                  />
                ),
              },
              {
                key: "pdfs",
                label: (
                  <>
                    <FilePdfOutlined />{" "}
                    {dict?.tabs?.pdfs || "Supporting PDFs"}
                  </>
                ),
                children: (
                  <List
                    bordered
                    dataSource={selectedCourse.pdfs}
                    renderItem={(p: string) => (
                      <List.Item>
                        <a href={p} target="_blank" rel="noreferrer">
                          {p.split("/").pop()}
                        </a>
                      </List.Item>
                    )}
                  />
                ),
              },
            ]}
          />
        </div>
      )}

      {/* Quiz Modal */}
      {renderQuizModal()}
      
      {/* Result Modal */}
      {renderResultModal()}
    </div>
  );
}