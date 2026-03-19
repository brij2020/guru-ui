import type { Metadata } from "next";
import "./global.css";
import { ClientProvider } from "@/components/ClientProvider";

export const metadata: Metadata = {
  title: "ai.guru",
  description: "AI-powered interview and exam preparation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
