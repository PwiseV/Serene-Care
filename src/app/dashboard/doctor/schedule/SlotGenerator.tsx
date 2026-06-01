"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function SlotGenerator() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const today = new Date();
  const inAWeek = new Date(today.getTime() + 6 * 86400000);

  const [startDate, setStartDate] = useState(isoDate(today));
  const [endDate, setEndDate] = useState(isoDate(inAWeek));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function generate() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/doctors/slots/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Tạo lịch thất bại" });
        return;
      }
      setMessage({
        type: "ok",
        text: `Đã tạo ${data.created} slot (${data.skipped} đã tồn tại).`,
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-xl shadow-indigo-500/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <span className="flex items-center gap-2 font-bold font-heading text-on-surface">
          <span className="material-symbols-outlined text-[20px] text-primary">event_repeat</span>
          Tạo lịch trống
        </span>
        <span className="material-symbols-outlined text-on-surface-variant">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="mt-4 border-t border-outline-variant/20 pt-4">
          <p className="mb-4 text-xs text-on-surface-variant font-sans">
            Hệ thống tạo slot dựa trên <strong>Lịch làm việc</strong> trong hồ sơ của bạn (tối đa 90
            ngày). Slot đã tồn tại sẽ được bỏ qua.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant font-sans">
                Từ ngày
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm font-sans text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-on-surface-variant font-sans">
                Đến ngày
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-outline-variant bg-surface px-3 py-2 text-sm font-sans text-on-surface focus:border-primary focus:outline-none"
              />
            </div>
            <button
              onClick={generate}
              disabled={loading}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold font-sans text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Đang tạo..." : "Tạo slot"}
            </button>
          </div>
          {message && (
            <p
              className={`mt-3 text-sm font-sans ${
                message.type === "ok" ? "text-secondary" : "text-error"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
