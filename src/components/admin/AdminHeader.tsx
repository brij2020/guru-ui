"use client";
import React, { useEffect, useState } from "react";
import { MenuOutlined } from "@ant-design/icons";
import adminImg from "../../../public/images/admin.jpg";
import { Dropdown} from "antd";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  dict: any;
}

export default function AdminHeader({
  onToggleSidebar,dict,lang
}: {
  onToggleSidebar: () => void;dict:any;lang?: string;
}) {
  // const { lang } = useParams(); 
  const [complianceReports, setComplianceReports] = useState<unknown[]>([]);

  useEffect(() => {
    const reports = localStorage.getItem("complianceReports");
    if (reports) {
      setComplianceReports(JSON.parse(reports));
    }
  }, []);
  console.log(complianceReports)

  const userMenu = {
    items: [
      {
        key: "profile",
        label: <Link href={`/${lang}/admin/profile`}>{dict.dashboard.admin.header.profile}</Link>,
      },
      {
        key: "logout",
        label: <Link href={`/${lang}/auth/login`}>{dict.dashboard.admin.header.logout}</Link>,
      },
    ],
  };
  const isRTL = lang === "ar";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "64px",
        backgroundColor: "var(--header-bg)",
        color: "var(--header-text)",
        gap: 16,
        width: "100%",
         direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {/* Sidebar Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <MenuOutlined
          onClick={onToggleSidebar}
          style={{
            fontSize: 20,
            color: "var(--header-text)",
            cursor: "pointer",
          }}
        />
      </div>

      {/* User Dropdown (Avatar + Name + Role together) */}
      <Dropdown menu={userMenu} placement={isRTL ? "bottomLeft" : "bottomRight"}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer",flexDirection: isRTL ? "row-reverse" : "row", }}>
          <Image
            src={adminImg}
            alt="Admin"
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
          <div style={{ lineHeight: 1.2,textAlign: isRTL ? "right" : "left"  }}>
            <h3 style={{ margin: 0, fontWeight: 600, color: "var(--header-text)" }}>
              {dict.dashboard.admin.header.name}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: "gray" }}>{dict.dashboard.admin.header.role}</p>
          </div>
        </div>
      </Dropdown>
    </div>
  );
}
