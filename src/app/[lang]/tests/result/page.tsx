"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button, Progress, Divider, Collapse, Tag, Statistic, Alert } from "antd";
import { useRouter } from "next/navigation";
import {
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  
  ReloadOutlined,
  StarOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { TestQuestion, getQuestionTypeDisplay } from "@/utils/testData";
import CodeEditor from "@/components/CodeEditor";

const { Title, Text } = Typography;

export default function ResultPage() {
  const [results, setResults] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedResults = sessionStorage.getItem('testResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      router.push('/tests');
    }
  }, [router]);

  const handleRetake = () => {
    router.push('/tests/difficulty');
  };

  const handleHome = () => {
    router.push('/tests');
  };

  if (!results) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  const testInfo = results?.testInfo ?? { title: "Test", domain: "General", duration: 0 };
  const aiEvaluation =
    results?.aiEvaluation && typeof results.aiEvaluation === "object" ? results.aiEvaluation : null;
  const score = Number(aiEvaluation?.summary?.score ?? results?.score) || 0;
  const questions: TestQuestion[] = Array.isArray(results?.questions) ? results.questions : [];
  const totalQuestions =
    Number(aiEvaluation?.summary?.totalQuestions ?? results?.totalQuestions) || questions.length || 0;
  const userAnswers =
    results?.userAnswers && typeof results.userAnswers === "object" ? results.userAnswers : {};
  const timeSpentSeconds =
    Number.isFinite(Number(results?.timeSpent))
      ? Number(results.timeSpent)
      : (Number(testInfo?.duration) || 0) * 60;
  const autoSubmitted = Boolean(results?.autoSubmitted);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const timeSpentMinutes = Math.round(timeSpentSeconds / 60);
  const incorrectAnswers = Math.max(0, totalQuestions - score);
  const aiFeedbackList = Array.isArray(aiEvaluation?.questionFeedback)
    ? aiEvaluation.questionFeedback
    : [];
  const attemptedFromAnswers = Object.values(userAnswers).filter((answer: any) => {
    const value = answer?.value;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return false;
  }).length;
  const attemptedCount = Number(aiEvaluation?.summary?.attemptedCount) || attemptedFromAnswers;
  const unattemptedCount = Math.max(0, totalQuestions - attemptedCount);
  const aiFeedbackMap = aiFeedbackList.reduce<Record<number, any>>((acc, item) => {
    const idx = Number(item?.questionIndex);
    if (Number.isFinite(idx) && idx >= 0) {
      acc[idx] = item;
    }
    return acc;
  }, {});

  const getPerformanceColor = (percent: number) => {
    if (percent >= 80) return "#52c41a";
    if (percent >= 60) return "#faad14";
    return "#f5222d";
  };

  const getPerformanceText = (percent: number) => {
    if (percent >= 80) return "Excellent!";
    if (percent >= 60) return "Good Job!";
    if (percent >= 40) return "Average";
    return "Needs Improvement";
  };

  const getQuestionStatus = (questionIndex: number) => {
    const aiFeedback = aiFeedbackMap[questionIndex];
    if (aiFeedback) {
      const verdict = String(aiFeedback.verdict || "").toLowerCase();
      if (verdict === "correct") return { status: "correct", color: "success" };
      if (verdict === "partial") return { status: "partial", color: "warning" };
      if (verdict === "incorrect") return { status: "incorrect", color: "error" };
      if (verdict === "unattempted") return { status: "unattempted", color: "default" };
    }

    const userAnswer = userAnswers[questionIndex];
    const question = questions[questionIndex];
    
    if (!userAnswer) return { status: 'unattempted', color: 'default' };
    
    if (question.type === 'mcq') {
      const isCorrect = userAnswer.value === question.answer;
      return { 
        status: isCorrect ? 'correct' : 'incorrect', 
        color: isCorrect ? 'success' : 'error' 
      };
    }
    
    return { status: 'attempted', color: 'processing' };
  };

  const renderCodeAnswer = (code: string, title: string, backgroundColor: string = '#f8f9fa') => {
    return (
      <div style={{ marginBottom: 15 }}>
        <strong>{title}:</strong>
        <div style={{ marginTop: 8 }}>
          <CodeEditor
            value={code}
            onChange={() => {}} // Read-only
            language="javascript"
            height="200px"
          />
        </div>
      </div>
    );
  };

  const renderSimpleCode = (code: string, title: string, backgroundColor: string = '#f8f9fa') => {
    return (
      <div style={{ marginBottom: 15 }}>
        <strong>{title}:</strong>
        <div style={{ 
          background: backgroundColor, 
          padding: 12, 
          borderRadius: 6, 
          marginTop: 8,
          border: '1px solid #e9ecef',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {code}
        </div>
      </div>
    );
  };

  const renderQuestionReviewItem = (question: TestQuestion, index: number) => {
    const userAnswer = userAnswers[index];
    const status = getQuestionStatus(index);

    return {
      key: String(index),
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ flex: 1, minWidth: 300 }}>
            <strong>Question {index + 1}:</strong> {question.question}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Tag>{getQuestionTypeDisplay(question.type)}</Tag>
            <Tag color={status.color}>
              {status.status === 'correct' && '✓ Correct'}
              {status.status === 'partial' && '◐ Partial'}
              {status.status === 'incorrect' && '✗ Incorrect'}
              {status.status === 'attempted' && '✓ Attempted'}
              {status.status === 'unattempted' && '○ Unattempted'}
            </Tag>
          </div>
        </div>
      ),
      children: (
        <div style={{ padding: '10px 0' }}>
          {/* User's Answer */}
          <div style={{ marginBottom: 20 }}>
            <strong style={{ fontSize: '16px', color: '#1890ff' }}>Your Answer:</strong>
            {userAnswer ? (
              question.type === 'coding' ? (
                renderCodeAnswer(userAnswer.value, "Your Code Solution", '#f0f5ff')
              ) : question.type === 'theory' || question.type === 'scenario' ? (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: 16, 
                  borderRadius: 6, 
                  marginTop: 8,
                  border: '1px solid #e9ecef',
                  lineHeight: 1.6
                }}>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{userAnswer.value}</Text>
                </div>
              ) : (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: 12, 
                  borderRadius: 6, 
                  marginTop: 8,
                  border: '1px solid #e9ecef'
                }}>
                  <Text strong>{userAnswer.value}</Text>
                </div>
              )
            ) : (
              <div style={{ 
                background: '#fff2e8', 
                padding: 12, 
                borderRadius: 6, 
                marginTop: 8,
                border: '1px solid #ffbb96',
              }}>
                <Text type="secondary" style={{ color: '#d46b08' }}>
                  ❌ Not attempted
                </Text>
              </div>
            )}
          </div>

          <Divider style={{ margin: '20px 0' }} />

          {/* Correct Answer (for MCQ) */}
          {question.type === 'mcq' && question.answer && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#52c41a' }}>Correct Answer:</strong>
              <div style={{ 
                background: '#f6ffed', 
                padding: 12, 
                borderRadius: 6, 
                marginTop: 8,
                border: '1px solid #b7eb8f'
              }}>
                <Text strong style={{ color: '#389e0d' }}>{question.answer}</Text>
              </div>
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#1890ff' }}>Explanation:</strong>
              <div style={{ 
                background: '#f0f5ff', 
                padding: 16, 
                borderRadius: 6, 
                marginTop: 8,
                border: '1px solid #d6e4ff',
                lineHeight: 1.6
              }}>
                <Text>{question.explanation}</Text>
              </div>
            </div>
          )}

          {aiFeedbackMap[index]?.feedback && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#7c3aed' }}>AI Evaluation Feedback:</strong>
              <div style={{
                background: '#f5f3ff',
                padding: 16,
                borderRadius: 6,
                marginTop: 8,
                border: '1px solid #ddd6fe',
                lineHeight: 1.6
              }}>
                <Text>{String(aiFeedbackMap[index].feedback)}</Text>
              </div>
            </div>
          )}

          {aiFeedbackMap[index]?.improvement && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#ea580c' }}>Improvement Tip:</strong>
              <div style={{
                background: '#fff7ed',
                padding: 16,
                borderRadius: 6,
                marginTop: 8,
                border: '1px solid #fed7aa',
                lineHeight: 1.6
              }}>
                <Text>{String(aiFeedbackMap[index].improvement)}</Text>
              </div>
            </div>
          )}

          {/* Sample Solution for Coding */}
          {question.sampleSolution && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#389e0d' }}>💡 Sample Solution (For Reference):</strong>
              {question.type === 'coding' ? (
                renderCodeAnswer(question.sampleSolution, "", '#f6ffed')
              ) : (
                renderSimpleCode(question.sampleSolution, "", '#f6ffed')
              )}
            </div>
          )}

          {/* Expected Output */}
          {question.expectedOutput && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#fa8c16' }}>Expected Output:</strong>
              <div style={{ 
                background: '#fff7e6', 
                padding: 12, 
                borderRadius: 6, 
                marginTop: 8,
                border: '1px solid #ffd591'
              }}>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  fontFamily: 'monospace',
                  color: '#d46b08'
                }}>
                  {question.expectedOutput}
                </pre>
              </div>
            </div>
          )}

          {/* Ideal Solution for Scenario */}
          {question.idealSolution && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#722ed1' }}>Ideal Solution Approach:</strong>
              <div style={{ 
                background: '#f9f0ff', 
                padding: 16, 
                borderRadius: 6, 
                marginTop: 8,
                border: '1px solid #d3adf7',
                lineHeight: 1.6
              }}>
                <Text style={{ whiteSpace: 'pre-wrap' }}>{question.idealSolution}</Text>
              </div>
            </div>
          )}

          {/* Key Considerations */}
          {question.keyConsiderations && (
            <div style={{ marginBottom: 15 }}>
              <strong style={{ fontSize: '16px', color: '#13c2c2' }}>Key Considerations:</strong>
              <ul style={{ 
                marginTop: 8, 
                marginBottom: 0,
                paddingLeft: 20 
              }}>
                {question.keyConsiderations.map((consideration: string, idx: number) => (
                  <li key={idx} style={{ marginBottom: 8, lineHeight: 1.5 }}>
                    <Text>{consideration}</Text>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Input/Output for Coding Questions */}
          {question.inputOutput && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#1890ff' }}>Input/Output Requirements:</strong>
              <div style={{ 
                background: '#e6f7ff', 
                padding: 16, 
                borderRadius: 6, 
                marginTop: 8,
                border: '1px solid #91d5ff',
                lineHeight: 1.6
              }}>


                <Text>{question.inputOutput}</Text>
              </div>
            </div>
          )}

          {/* Solution Approach for Coding Questions */}
          {question.solutionApproach && (
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: '16px', color: '#fa8c16' }}>Solution Approach:</strong>
              <div style={{ 
                background: '#fff7e6', 
                padding: 16, 
                borderRadius: 6, 
                marginTop: 8,
                border: '1px solid #ffd591',
                lineHeight: 1.6
              }}>
                <Text>{question.solutionApproach}</Text>
              </div>
            </div>
          )}

          {/* Complexity for Coding Questions */}
          {question.complexity && (
            <div style={{ marginBottom: 15 }}>
              <strong style={{ fontSize: '16px', color: '#52c41a' }}>Complexity Analysis:</strong>
              <div style={{ 
                background: '#f6ffed', 
                padding: 12, 
                borderRadius: 6, 
                marginTop: 8,
                border: '1px solid #b7eb8f'
              }}>
                <Text strong style={{ color: '#389e0d' }}>{question.complexity}</Text>
              </div>
            </div>
          )}
        </div>
      ),
    };
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      padding: "16px"
    }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
            overflow: "hidden",
            marginBottom: 12
          }}
        >
          {/* Header */}
          <div style={{ 
            background: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",
            padding: "18px 22px",
            color: "white"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <TrophyOutlined style={{ fontSize: 26 }} />
              <Title level={3} style={{ color: "white", margin: 0 }}>
              Test Completed!
              </Title>
              <Text style={{ color: "white", fontSize: 14, opacity: 0.92 }}>
                {testInfo.title} • {testInfo.domain}
              </Text>
            </div>
            {autoSubmitted && (
              <Alert
                message="Test was auto-submitted when time expired"
                type="warning"
                style={{ marginTop: 10, background: 'rgba(255,255,255,0.18)', border: 'none' }}
              />
            )}
          </div>

          {/* Results Summary */}
          <div style={{ padding: "20px" }}>
            <Row gutter={[12, 12]} style={{ marginBottom: 18 }}>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Score"
                    value={score}
                    suffix={`/ ${totalQuestions}`}
                    prefix={<StarOutlined />}
                    valueStyle={{ color: getPerformanceColor(percentage), fontSize: 24 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Accuracy"
                    value={percentage}
                    suffix="%"
                    valueStyle={{ color: getPerformanceColor(percentage), fontSize: 24 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Time"
                    value={timeSpentMinutes}
                    suffix="min"
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ fontSize: 24 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card size="small" style={{ borderRadius: 12 }}>
                  <Statistic
                    title="Unattempted"
                    value={unattemptedCount}
                    prefix={<QuestionCircleOutlined />}
                    valueStyle={{ fontSize: 24 }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[12, 12]}>
              {/* Score Card */}
              <Col xs={24} md={10}>
                <Card 
                  style={{ 
                    textAlign: "center",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb"
                  }}
                >
                  <div style={{ marginBottom: 16 }}>
                    <Progress
                      type="circle"
                      percent={percentage}
                      strokeColor={getPerformanceColor(percentage)}
                      size={104}
                      format={percent => (
                        <div>
                          <div style={{ fontSize: 20, fontWeight: "bold" }}>
                            {percent}%
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>
                            Score
                          </div>
                        </div>
                      )}
                    />
                  </div>
                  
                  <Title level={3} style={{ color: getPerformanceColor(percentage) }}>
                    {getPerformanceText(percentage)}
                  </Title>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    <Tag color="success" style={{ fontSize: 14, padding: '4px 12px' }}>
                      <CheckCircleOutlined /> Correct: {score}
                    </Tag>
                    <Tag color="error" style={{ fontSize: 14, padding: '4px 12px' }}>
                      <CloseCircleOutlined /> Incorrect: {incorrectAnswers}
                    </Tag>
                    <Tag color="processing" style={{ fontSize: 14, padding: '4px 12px' }}>
                      <QuestionCircleOutlined /> Unattempted: {unattemptedCount}
                    </Tag>
                  </div>
                </Card>
              </Col>

              {/* Details & Actions */}
              <Col xs={24} md={14}>
                <Card size="small" style={{ borderRadius: 12, marginBottom: 12 }}>
                  <Title level={4}>Test Summary</Title>
                  <Divider style={{ margin: "10px 0 14px" }} />
                  
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 20, marginRight: 12 }} />
                    <Text style={{ fontSize: 16 }}>Correct Answers: <strong>{score}</strong></Text>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <CloseCircleOutlined style={{ color: "#f5222d", fontSize: 20, marginRight: 12 }} />
                    <Text style={{ fontSize: 16 }}>Incorrect Answers: <strong>{incorrectAnswers}</strong></Text>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <QuestionCircleOutlined style={{ color: "#faad14", fontSize: 20, marginRight: 12 }} />
                    <Text style={{ fontSize: 16 }}>Unattempted: <strong>{unattemptedCount}</strong></Text>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <ClockCircleOutlined style={{ color: "#1890ff", fontSize: 20, marginRight: 12 }} />
                    <Text style={{ fontSize: 16 }}>Time Spent: <strong>{timeSpentMinutes} min</strong></Text>
                  </div>
                </Card>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, flexDirection: "row", flexWrap: "wrap" }}>
                  <Button
                    type="primary"
                    size="middle"
                    onClick={handleRetake}
                    icon={<ReloadOutlined />}
                    style={{
                      height: 40,
                      fontSize: 14,
                      borderRadius: 8,
                    }}
                  >
                    Retake This Test
                  </Button>
                  
                  <Button
                    size="middle"
                    onClick={handleHome}
                    icon={<HomeOutlined />}
                    style={{
                      height: 40,
                      fontSize: 14,
                      borderRadius: 8,
                    }}
                  >
                    Back to All Tests
                  </Button>
                </div>
              </Col>
            </Row>

            {/* Detailed Question Review */}
            <Divider />
            <div style={{ marginTop: 10 }}>
              <Title level={3}>Detailed Question Review</Title>
              <Text style={{ color: "#666", fontSize: 14, display: 'block', marginBottom: 12 }}>
                Review your answers and learn from detailed explanations
              </Text>

              <Collapse 
                accordion 
                size="small"
                items={questions.map((question: TestQuestion, index: number) => 
                  renderQuestionReviewItem(question, index)
                )}
                style={{ 
                  background: 'transparent',
                  border: '1px solid #e8e8e8'
                }}
              />
            </div>

            {/* Performance Insights */}
            <Divider />
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Title level={4}>Performance Insights</Title>
              {aiEvaluation?.summary?.overallFeedback && (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 16, textAlign: 'left' }}
                  message="AI Overall Feedback"
                  description={String(aiEvaluation.summary.overallFeedback)}
                />
              )}
              {Array.isArray(aiEvaluation?.summary?.strengths) && aiEvaluation.summary.strengths.length > 0 && (
                <div style={{ marginBottom: 12, textAlign: 'left' }}>
                  <Text strong>Strengths:</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {aiEvaluation.summary.strengths.map((item: string, idx: number) => (
                      <li key={`s-${idx}`}><Text>{item}</Text></li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(aiEvaluation?.summary?.improvements) && aiEvaluation.summary.improvements.length > 0 && (
                <div style={{ marginBottom: 16, textAlign: 'left' }}>
                  <Text strong>Improvements:</Text>
                  <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                    {aiEvaluation.summary.improvements.map((item: string, idx: number) => (
                      <li key={`i-${idx}`}><Text>{item}</Text></li>
                    ))}
                  </ul>
                </div>
              )}
              <Text style={{ color: "#666", fontSize: 14, display: 'block', marginBottom: 12, lineHeight: 1.6 }}>
                {percentage >= 80 
                  ? "🎉 Outstanding performance! You have excellent knowledge in this domain. Keep up the great work!"
                  : percentage >= 60
                  ? "👍 Good performance! With a little more practice, you'll excel in this domain."
                  : "📚 Keep practicing! Review the concepts and try again to improve your score. You're on the right track!"
                }
              </Text>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <Tag color="blue" style={{ fontSize: 14, padding: '6px 12px' }}>Accuracy: {percentage}%</Tag>
                <Tag color="green" style={{ fontSize: 14, padding: '6px 12px' }}>Correct: {score}</Tag>
                <Tag color="red" style={{ fontSize: 14, padding: '6px 12px' }}>Incorrect: {incorrectAnswers}</Tag>
                <Tag color="orange" style={{ fontSize: 14, padding: '6px 12px' }}>Time: {timeSpentMinutes}m</Tag>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
