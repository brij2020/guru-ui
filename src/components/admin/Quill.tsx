"use client";

import dynamic from "next/dynamic";
import React from "react";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  return (
    <div>
      <ReactQuill theme="snow" value={value} onChange={onChange} />
    </div>
  );
}
