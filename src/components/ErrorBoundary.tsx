"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Result, Card, Typography } from "antd";

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "page" | "section" | "component";
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = "page" } = this.props;
      const isPageLevel = level === "page";

      if (isPageLevel) {
        return (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              background: "#f5f5f5",
            }}
          >
            <Card style={{ maxWidth: 600, textAlign: "center" }}>
              <Result
                status="error"
                title="Something went wrong"
                subTitle="We're sorry, but something unexpected happened. Please try again."
                extra={[
                  <Button type="primary" key="retry" onClick={this.handleRetry}>
                    Try Again
                  </Button>,
                  <Button key="home" onClick={() => window.location.href = "/"}>
                    Go to Home
                  </Button>,
                ]}
              />
              {process.env.NODE_ENV === "development" && this.state.error && (
                <Card
                  size="small"
                  title="Error Details (Dev Only)"
                  style={{ marginTop: 16, textAlign: "left" }}
                >
                  <Paragraph>
                    <Text strong>Error: </Text>
                    <Text code>{this.state.error.message}</Text>
                  </Paragraph>
                  <Paragraph>
                    <Text strong>Stack: </Text>
                    <pre style={{ fontSize: 12, overflow: "auto" }}>
                      {this.state.error.stack}
                    </pre>
                  </Paragraph>
                </Card>
              )}
            </Card>
          </div>
        );
      }

      return (
        <div
          style={{
            padding: "16px",
            background: "#fff2f0",
            border: "1px solid #ffccc7",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Paragraph type="danger" style={{ marginBottom: 8 }}>
            Failed to load this section
          </Paragraph>
          <Button size="small" onClick={this.handleRetry}>
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    level?: "page" | "section" | "component";
  }
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;
