"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/confirm`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-bold font-sans hover:opacity-90 transition-opacity disabled:opacity-50 flex-shrink-0"
    >
      {loading ? "Đang xác nhận..." : "Xác nhận"}
    </button>
  );
}
