"use client";
import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import "@/app/global.css"; 
import UserSiderbar from "@/components/user/UserSiderbar";
import UserHeader from "@/components/user/UserHeader";

const { Header, Sider, Content } = Layout;

const LOCAL_STORAGE_KEY = "medCert";

export default function FacLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<"admin" | "user">("user"); // default role
 
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // only admin or doctor roles
        setRole(user.role === "admin" ? "admin" : "user");
      }
    }
  }, []);

  // Apply theme class dynamically
  const themeClass = `${role}-theme`;

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
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        
          <UserSiderbar collapsed={collapsed} />
    
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 250,
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
         
            <UserHeader onToggleSidebar={() => setCollapsed(!collapsed)} />
          
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
