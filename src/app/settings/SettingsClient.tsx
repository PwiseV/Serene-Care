"use client";

import { useState } from "react";

interface Props {
  initialName: string;
  email: string;
}

export default function SettingsClient({ initialName, email }: Props) {
  // --- Profile section ---
  const [name, setName] = useState(initialName);
  const [nameStatus, setNameStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [nameError, setNameError] = useState("");

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault();
    setNameStatus("loading");
    setNameError("");
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) { setNameError(data.error ?? "Cập nhật thất bại"); setNameStatus("error"); return; }
      setNameStatus("success");
      setTimeout(() => setNameStatus("idle"), 2500);
    } catch {
      setNameError("Lỗi kết nối. Vui lòng thử lại."); setNameStatus("error");
    }
  }

  // --- Password section ---
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwError, setPwError] = useState("");

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (pw.next !== pw.confirm) { setPwError("Mật khẩu xác nhận không khớp"); setPwStatus("error"); return; }
    setPwStatus("loading");
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error ?? "Đổi mật khẩu thất bại"); setPwStatus("error"); return; }
      setPwStatus("success");
      setPw({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwStatus("idle"), 2500);
    } catch {
      setPwError("Lỗi kết nối. Vui lòng thử lại."); setPwStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Profile info */}
      <form onSubmit={handleNameSave} className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
        <h2 className="text-base font-bold font-heading mb-5">Thông tin cá nhân</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface-variant font-sans mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container text-on-surface-variant font-sans text-sm cursor-not-allowed"
          />
          <p className="text-xs text-on-surface-variant font-sans mt-1">Email không thể thay đổi.</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-on-surface font-sans mb-1.5">Họ và tên</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container font-sans text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {nameStatus === "error" && (
          <p className="text-sm text-error font-sans mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">error</span>{nameError}
          </p>
        )}
        {nameStatus === "success" && (
          <p className="text-sm text-green-600 font-sans mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">check_circle</span>Đã lưu thành công!
          </p>
        )}

        <button
          type="submit"
          disabled={nameStatus === "loading" || name === initialName}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold font-sans text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {nameStatus === "loading" ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handlePasswordSave} className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
        <h2 className="text-base font-bold font-heading mb-5">Đổi mật khẩu</h2>

        {(["current", "next", "confirm"] as const).map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-sm font-medium text-on-surface font-sans mb-1.5">
              {field === "current" ? "Mật khẩu hiện tại" : field === "next" ? "Mật khẩu mới" : "Xác nhận mật khẩu mới"}
            </label>
            <input
              type="password"
              value={pw[field]}
              onChange={(e) => setPw((p) => ({ ...p, [field]: e.target.value }))}
              required
              minLength={field === "current" ? undefined : 6}
              className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container font-sans text-sm text-on-surface focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        ))}

        {pwStatus === "error" && (
          <p className="text-sm text-error font-sans mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">error</span>{pwError}
          </p>
        )}
        {pwStatus === "success" && (
          <p className="text-sm text-green-600 font-sans mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">check_circle</span>Đổi mật khẩu thành công!
          </p>
        )}

        <button
          type="submit"
          disabled={pwStatus === "loading"}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold font-sans text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pwStatus === "loading" ? "Đang đổi..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}
