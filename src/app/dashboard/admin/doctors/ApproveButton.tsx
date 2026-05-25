"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveButton({ doctorId }: { doctorId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAction(approved: boolean) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => handleAction(true)}
        disabled={loading}
        className="px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-bold font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "..." : "Duyệt"}
      </button>
      <button
        onClick={() => handleAction(false)}
        disabled={loading}
        className="px-4 py-2 rounded-full bg-error-container text-on-error-container text-sm font-bold font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "..." : "Từ chối"}
      </button>
    </div>
  );
}
