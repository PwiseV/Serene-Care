"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload: Record<string, string> = {};
    if (name.trim() && name.trim() !== initialName) payload.name = name.trim();
    if (newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setMessage({ type: "err", text: "Chưa có thay đổi nào để lưu." });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Lưu thất bại" });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setMessage({ type: "ok", text: "Đã lưu thay đổi." });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-bold font-sans text-on-surface">Họ tên</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary focus:outline-none"
        />
      </div>

      <div className="border-t border-outline-variant/30 pt-4">
        <p className="mb-3 text-sm font-bold font-sans text-on-surface">Đổi mật khẩu</p>
        <div className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Mật khẩu hiện tại"
            autoComplete="current-password"
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
            autoComplete="new-password"
            className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {message && (
        <p
          className={`text-sm font-sans ${
            message.type === "ok" ? "text-secondary" : "text-error"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold font-sans text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
