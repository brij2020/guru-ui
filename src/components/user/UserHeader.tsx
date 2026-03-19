"use client";
import React, { useEffect, useState } from "react";
import {
  MenuOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Dropdown,
  Input,
  List,
  Space,
  Typography,
} from "antd";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import img from "../../../public/images/hero1.jpg";

import { medcertusers, MedCertUsers } from "@/utils/userdata/medcertusers";

const { Search } = Input;
const { Text } = Typography;

export default function UserHeader({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [userResults, setUserResults] = useState<MedCertUsers[]>([]);

  // USER SEARCH LOGIC
  const handleSearch = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setUserResults([]);
      return;
    }

    const filteredUsers = medcertusers.filter(
      (user) =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase()) ||
        user.role.toLowerCase().includes(value.toLowerCase())
    );

    setUserResults(filteredUsers);
  };

  // Search Result Dropdownbk 
  const searchResultOverlay = (
    <div
      style={{
        backgroundColor: "white",
        paddingLeft: 10,
        maxHeight: 250,
        overflowY: "auto",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <List
        dataSource={userResults}
        locale={{ emptyText: "No users found" }}
        renderItem={(user) => (
          <List.Item
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push(`/user/profile/${user.userId}`);
              setQuery("");
              setUserResults([]);
            }}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={<Text>{user.name}</Text>}
              description={`${user.email} • ${user.role}`}
            />
          </List.Item>
        )}
      />
    </div>
  );

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

      {/* SEARCH (STYLE SAME) */}
      <Dropdown
        open={!!query}
        popupRender={() => searchResultOverlay}
      >
        <Search
          placeholder="Search..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
          style={{ maxWidth: 400, width: "100%" }}
        />
      </Dropdown>

      {/* Notifications & User */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Badge count={3} offset={[0, 6]}>
          <BellOutlined
            style={{
              fontSize: 30,
              color: "var(--header-text)",
              cursor: "pointer",
            }}
          />
        </Badge>

        <Image
          src={img}
          alt="Doctor"
          width={50}
          height={60}
          className="rounded-full object-cover"
        />
      </div>
    </div>
  );
}
