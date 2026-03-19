"use client";

import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";

export default function GlobalErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ErrorBoundary level="page">{children}</ErrorBoundary>;
}
