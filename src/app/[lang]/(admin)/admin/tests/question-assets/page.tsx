"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Image, Input, Popconfirm, Space, Typography, message, Modal } from "antd";
import { UploadOutlined, ReloadOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type LibraryAssetItem = {
  fileName: string;
  url: string;
  size?: number;
  updatedAt?: string;
};

export default function QuestionAssetsPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<LibraryAssetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const filteredItems = useMemo(() => {
    const query = String(search || "").trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => String(item.fileName || "").toLowerCase().includes(query));
  }, [items, search]);

  const toggleSelect = (fileName: string) => {
    const next = new Set(selectedKeys);
    if (next.has(fileName)) {
      next.delete(fileName);
    } else {
      next.add(fileName);
    }
    setSelectedKeys(next);
  };

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/question-assets");
      const payload = (await response.json()) as { data?: { items?: LibraryAssetItem[] } };
      setItems(Array.isArray(payload?.data?.items) ? payload.data?.items || [] : []);
    } catch {
      setItems([]);
      message.error("Failed to load asset library.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSelected = useCallback(async () => {
    if (selectedKeys.size === 0) return;
    Modal.confirm({
      title: `Delete ${selectedKeys.size} image(s)?`,
      content: "This cannot be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        const keys = Array.from(selectedKeys);
        console.log("[deleteSelected] Deleting:", keys);
        let deleted = 0;
        let failed = 0;
        for (const fileName of keys) {
          try {
            const url = `/api/admin/question-assets?file=${encodeURIComponent(fileName)}`;
            console.log("[deleteSelected] Fetching:", url);
            const res = await fetch(url, { method: "DELETE" });
            console.log("[deleteSelected] Response:", res.status, res.statusText);
            if (res.ok) {
              deleted++;
            } else {
              const err = await res.json();
              console.error("[deleteSelected] Error:", err);
              failed++;
            }
          } catch (err) {
            console.error("[deleteSelected] Catch error:", err);
            failed++;
          }
        }
        if (deleted > 0) message.success(`${deleted} image(s) deleted.`);
        if (failed > 0) message.error(`${failed} image(s) failed to delete.`);
        setSelectedKeys(new Set());
        await loadItems();
      },
    });
  }, [selectedKeys, loadItems]);

  const deleteSingle = useCallback(async (fileName: string) => {
    try {
      const url = `/api/admin/question-assets?file=${encodeURIComponent(fileName)}`;
      const response = await fetch(url, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(String(payload?.error || "Delete failed"));
      message.success("Image deleted.");
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        next.delete(fileName);
        return next;
      });
      await loadItems();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Delete failed");
    }
  }, [loadItems]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const response = await fetch("/api/admin/question-assets", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        data?: { items?: unknown[] };
        error?: string;
      };
      if (!response.ok) throw new Error(String(payload?.error || "Upload failed"));
      const count = payload?.data?.items?.length || 0;
      message.success(`${count} image(s) uploaded.`);
      await loadItems();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <Title level={4} className="!mb-1">Question Assets Library</Title>
        <Text type="secondary">Upload question images once and reuse them in Edit Question.</Text>
      </Card>

      <Card>
        <Space>
          <Button icon={<UploadOutlined />} type="primary" loading={uploading} onClick={() => fileRef.current?.click()}>
            Upload Images
          </Button>
          <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void loadItems()}>
            Refresh
          </Button>
          {selectedKeys.size > 0 && (
            <Button icon={<DeleteOutlined />} danger onClick={() => void deleteSelected()}>
              Delete ({selectedKeys.size})
            </Button>
          )}
        </Space>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void onUpload(event.target.files);
            event.currentTarget.value = "";
          }}
        />
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by file name..."
            allowClear
          />
          <Text type="secondary">{filteredItems.length} item(s)</Text>
        </div>
        {filteredItems.length === 0 ? (
          <Alert type="info" showIcon message="No assets uploaded yet." />
        ) : (
          <div className="flex flex-wrap gap-3">
            {filteredItems.map((item) => {
              const isSelected = selectedKeys.has(item.fileName);
              return (
                <div
                  key={item.fileName}
                  onClick={() => toggleSelect(item.fileName)}
                  className={`w-[180px] rounded border-2 cursor-pointer p-2 transition-colors ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="relative">
                    <div className="absolute right-1 top-1 z-10">
                      <Popconfirm
                        title="Delete this image?"
                        description="This action cannot be undone."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={(event) => {
                          event?.stopPropagation?.();
                          void deleteSingle(item.fileName);
                        }}
                        onPopupClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </Popconfirm>
                    </div>
                    <Image src={item.url} alt={item.fileName} width={160} height={110} />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                        <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white">✓</span>
                      </div>
                    )}
                  </div>
                  <Text className="mt-2 block text-xs" ellipsis={{ tooltip: item.fileName }}>
                    {item.fileName}
                  </Text>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
