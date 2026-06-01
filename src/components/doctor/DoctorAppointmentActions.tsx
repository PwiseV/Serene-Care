"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@/models/Appointment";

export default function DoctorAppointmentActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [note, setNote] = useState("");

  async function call(action: "confirm" | "cancel" | "complete", body?: object) {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/${action}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        setShowComplete(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Thao tác thất bại");
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "completed") {
    return <span className="text-xs font-semibold text-tertiary font-sans">Đã hoàn thành</span>;
  }
  if (status === "cancelled") {
    return <span className="text-xs font-semibold text-error font-sans">Đã huỷ</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {status === "pending" && (
        <>
          <button
            onClick={() => call("confirm")}
            disabled={loading}
            className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold font-sans text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Đồng ý & tiến hành
          </button>
          <button
            onClick={() => {
              if (confirm("Từ chối lịch khám này?")) call("cancel");
            }}
            disabled={loading}
            title="Từ chối"
            className="rounded-full p-1.5 text-error transition-colors hover:bg-error-container disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </>
      )}

      {status === "confirmed" && (
        <button
          onClick={() => setShowComplete(true)}
          disabled={loading}
          className="rounded-full bg-tertiary px-3.5 py-1.5 text-xs font-bold font-sans text-on-tertiary transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Hoàn tất
        </button>
      )}

      {showComplete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !loading && setShowComplete(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 font-bold font-heading text-on-surface">Hoàn tất buổi khám</h3>
            <p className="mb-4 text-sm text-on-surface-variant font-sans">
              Ghi lại chẩn đoán / ghi chú cho bệnh nhân (không bắt buộc).
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Chẩn đoán, lời dặn, đơn thuốc..."
              className="w-full resize-none rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-sm font-sans text-on-surface focus:border-primary focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowComplete(false)}
                disabled={loading}
                className="rounded-full bg-surface-container px-4 py-2 text-sm font-bold font-sans text-on-surface transition-colors hover:bg-surface-container-high"
              >
                Huỷ
              </button>
              <button
                onClick={() => call("complete", { doctorNote: note })}
                disabled={loading}
                className="rounded-full bg-tertiary px-5 py-2 text-sm font-bold font-sans text-on-tertiary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : "Xác nhận hoàn tất"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
