"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, Menu } from "antd";
import { userSidebarItems } from "@/utils/sidebaritems";
import { DashboardOutlined, FileTextOutlined, CopyOutlined} from "@ant-design/icons";

const { Sider } = Layout;
const LOCAL_STORAGE_KEY = "medCert";

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <DashboardOutlined twoToneColor="#0077b6" />,
  "My Course": <FileTextOutlined className="text-lg font-bold hover:text-[#0077b6]" />,
  "My Profile": <CopyOutlined className="text-lg font-bold hover:text-[#0077b6]" />,
  "My Certificate": <FileTextOutlined className="text-lg font-bold hover:text-[#0077b6]" />,

}; 

export default function UserSidebar({ collapsed }: { collapsed: boolean }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const userbarItems = user?.role === "user" ? userSidebarItems : [];
  const [selectedKey, setSelectedKey] = useState(userbarItems[0]?.path);


  return (
    <>
      <div
        className={`text-xl font-bold text-white py-4 px-4 h-3 transition-all duration-300 ${collapsed ? "text-center text-base px-2 group-hover:text-[#0077b6]" : ""
          }`}
        style={{
          background: "var(--sidebar-bg)",
          borderBottom: "1px solid var(--section-border)",
           flex: "0 0 auto",
        }}
      >
        {collapsed ? "U+" : "User + Data"}

      </div>
      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        onClick={({ key }) => {
          setSelectedKey(key);
          router.push(key);
        }}
        style={{
          background: "var(--sidebar-bg)",
          borderRight: "none",
          marginTop: "1.9rem",
        }}
        items={userbarItems.flatMap((item, index) => {
          const menuItem = {
            key: item.path,
            icon: iconMap[item.label],
            label: item.label,
          };

          if (index < userbarItems.length - 1) {
            return [menuItem, { type: "divider" as const, className: "custom-divider" }];
          }
          return [menuItem];
        })}
      />
    </>
  )
}