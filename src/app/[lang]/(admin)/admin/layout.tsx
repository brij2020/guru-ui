"use client";
import React, { use, useEffect, useState } from "react";
import { Layout } from "antd";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import "@/app/global.css";
import en from "../../../../../dictionaries/en.json"
import ar from "../../../../../dictionaries/ar.json"

const { Header, Sider, Content } = Layout;
const LOCAL_STORAGE_KEY = "medCert";
export default function AdminLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = use(params);
  const lang = resolvedParams?.lang || "en";
  const dict = lang === "ar" ? ar : en;
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<"admin" | "user">("admin"); // default to admin
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!storedUser) {
        setIsAuthorized(false);
        router.replace(`/${lang}/login`);
        return;
      }
      try {
        const user = JSON.parse(storedUser);
        const simplifiedRole = user.role === "admin" ? "admin" : "user";
        setRole(simplifiedRole);
        if (simplifiedRole !== "admin") {
          setIsAuthorized(false);
          router.replace(`/${lang}/login`);
          return;
        }
        setIsAuthorized(true);
      } catch {
        setIsAuthorized(false);
        router.replace(`/${lang}/login`);
      }
    }
  }, [lang, router]);

  if (isAuthorized !== true) {
    return null;
  }

  const themeClass = `${role}-theme`;
  // console.log("LANG:", lang, "DICT:", dict);

  return (
    <Layout className={themeClass} style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="md"
        onBreakpoint={(broken) => setCollapsed(broken)}
        width={250}
        style={{
          background: "var(--sidebar-bg)",
          height: "100vh",
          position: "fixed",
          left: lang === "ar" ? "auto" : 0,
          right: lang === "ar" ? 0 : "auto",
          top: 0,
          bottom: 0,
          zIndex: 1000,
          overflow: "hidden",

        }}
      >
        <div
          style={{
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <AdminSidebar collapsed={collapsed} dict={dict} lang={lang} />
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: lang === "ar" ? 0 : collapsed ? 80 : 250,
          marginRight: lang === "ar" ? (collapsed ? 80 : 250) : 0,
          transition: "all 0.3s",
          backgroundColor: "var(--layout-bg)",
        }}
      >
        <Header
          style={{
            background: "var(--header-bg)",
            padding: "0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <AdminHeader onToggleSidebar={() => setCollapsed(!collapsed)} dict={dict} lang={lang} />
        </Header>

        <Content
          style={{
            margin: "12px 8px 0",
            padding: 12,
            background: "var(--content-bg)",
            color: "var(--section-text)",
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
