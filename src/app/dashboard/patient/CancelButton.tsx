"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("Bạn có chắc muốn huỷ lịch khám này?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-4 py-2 rounded-full border border-error text-error text-sm font-bold font-sans hover:bg-error/10 transition-colors disabled:opacity-50 flex-shrink-0"
    >
      {loading ? "Đang huỷ..." : "Huỷ lịch"}
    </button>
  );
}
