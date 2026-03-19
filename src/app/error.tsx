"use client";

import { useEffect } from "react";
import { Button, Result, Card, Typography } from "antd";

const { Paragraph, Text } = Typography;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

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
          title="Something went wrong!"
          subTitle="We're sorry, but something unexpected happened. The error has been logged."
          extra={[
            <Button type="primary" key="retry" onClick={reset}>
              Try Again
            </Button>,
            <Button key="home" onClick={() => (window.location.href = "/")}>
              Go to Home
            </Button>,
          ]}
        />
        {process.env.NODE_ENV === "development" && (
          <Card
            size="small"
            title="Error Details (Development Only)"
            style={{ marginTop: 16, textAlign: "left" }}
          >
            <Paragraph>
              <Text strong>Message: </Text>
              <Text code>{error.message}</Text>
            </Paragraph>
            {error.digest && (
              <Paragraph>
                <Text strong>Error ID: </Text>
                <Text copyable>{error.digest}</Text>
              </Paragraph>
            )}
            <Paragraph>
              <Text strong>Stack Trace: </Text>
            </Paragraph>
            <pre
              style={{
                fontSize: 11,
                overflow: "auto",
                maxHeight: "200px",
                background: "#f5f5f5",
                padding: "8px",
                borderRadius: "4px",
              }}
            >
              {error.stack}
            </pre>
          </Card>
        )}
      </Card>
    </div>
  );
}
