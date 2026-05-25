"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HealthRecordItem {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

const MAX_SIZE = 5 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "picture_as_pdf";
  return "description";
}

export default function HealthRecordsSection() {
  const [records, setRecords] = useState<HealthRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health-records");
      const data = await res.json();
      if (res.ok) setRecords(data.records);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFileError("");
    if (selected && selected.size > MAX_SIZE) {
      setFileError("File không được vượt quá 5 MB.");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selected);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !file) {
      setError("Vui lòng nhập tiêu đề và chọn file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("file", file);
      const res = await fetch("/api/health-records", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setRecords((prev) => [data.record, ...prev]);
        setTitle("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setError(data.error ?? "Tải lên thất bại.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá hồ sơ này?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/health-records/${id}`, { method: "DELETE" });
      if (res.ok) setRecords((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-extrabold font-heading mb-1">Hồ sơ sức khoẻ</h2>
      <p className="text-on-surface-variant font-sans text-sm mb-6">
        Lưu trữ kết quả xét nghiệm, đơn thuốc, và tài liệu y tế (tối đa 5 MB/file).
      </p>

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5 mb-6"
      >
        <p className="text-sm font-bold font-sans text-on-surface mb-4">Tải lên hồ sơ mới</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề (vd: Kết quả xét nghiệm máu)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-sans text-sm focus:outline-none focus:border-primary"
            maxLength={200}
          />
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-sans text-sm cursor-pointer hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-base leading-none text-primary">upload_file</span>
            {file ? file.name : "Chọn file"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {fileError && <p className="text-xs text-error font-sans mb-2">{fileError}</p>}
        {error && <p className="text-xs text-error font-sans mb-2">{error}</p>}

        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2 rounded-full bg-primary text-on-primary text-sm font-bold font-sans hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {uploading ? "Đang tải lên..." : "Tải lên"}
        </button>
      </form>

      {/* Records list */}
      {loading ? (
        <p className="text-on-surface-variant font-sans text-sm">Đang tải...</p>
      ) : records.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-xl shadow-indigo-500/5">
          <span className="material-symbols-outlined text-5xl text-outline mb-3 block">folder_open</span>
          <p className="text-on-surface-variant font-sans text-sm">Chưa có hồ sơ nào.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {records.map((r) => (
            <div
              key={r.id}
              className="bg-surface-container-lowest rounded-2xl px-5 py-4 shadow-xl shadow-indigo-500/5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0">
                  {fileIcon(r.fileType)}
                </span>
                <div className="min-w-0">
                  <p className="font-bold font-sans text-on-surface text-sm truncate">{r.title}</p>
                  <p className="text-xs text-on-surface-variant font-sans">
                    {formatBytes(r.fileSize)} ·{" "}
                    {new Date(r.uploadedAt).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-surface-container transition-colors text-primary"
                  title="Xem / tải về"
                >
                  <span className="material-symbols-outlined text-xl leading-none">open_in_new</span>
                </a>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  className="p-2 rounded-full hover:bg-error/10 transition-colors text-error disabled:opacity-40"
                  title="Xoá"
                >
                  <span className="material-symbols-outlined text-xl leading-none">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
