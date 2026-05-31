"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@/models/Appointment";

export default function AppointmentActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const canConfirm = status === "pending";
  const canCancel = status === "pending" || status === "confirmed";

  async function act(action: "confirm" | "cancel") {
    if (action === "cancel" && !confirm("Huỷ lịch hẹn này?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/${action}`, { method: "POST" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Thao tác thất bại");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => act("confirm")}
        disabled={loading || !canConfirm}
        title="Xác nhận"
        className="rounded-full p-1.5 text-secondary transition-colors hover:bg-secondary-container disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <span className="material-symbols-outlined text-[18px]">check_circle</span>
      </button>
      <button
        onClick={() => act("cancel")}
        disabled={loading || !canCancel}
        title="Huỷ"
        className="rounded-full p-1.5 text-error transition-colors hover:bg-error-container disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <span className="material-symbols-outlined text-[18px]">cancel</span>
      </button>
    </div>
  );
}
