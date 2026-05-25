"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewButton({ appointmentId }: { appointmentId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Vui lòng chọn số sao.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, rating, comment }),
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Có lỗi xảy ra.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full border border-outline-variant text-sm font-bold font-sans text-on-surface hover:bg-surface-container transition-colors flex-shrink-0 flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-base leading-none text-amber-500">star</span>
        Đánh giá
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-outline-variant/20 w-full">
      <p className="text-sm font-bold font-sans text-on-surface mb-3">Đánh giá lịch khám này</p>

      {/* Star selector */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <span
              className={`material-symbols-outlined text-2xl transition-colors ${
                i <= (hovered || rating) ? "text-amber-500" : "text-outline"
              }`}
              style={{
                fontVariationSettings:
                  i <= (hovered || rating) ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              star
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-sans text-on-surface-variant self-center">
            {["", "Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"][rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Chia sẻ trải nghiệm của bạn (tuỳ chọn)..."
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface font-sans text-sm focus:outline-none focus:border-primary resize-none mb-3"
      />

      {error && (
        <p className="text-xs text-error font-sans mb-2">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-full bg-primary text-on-primary text-sm font-bold font-sans hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setRating(0); setComment(""); setError(""); }}
          className="px-5 py-2 rounded-full bg-surface-container text-on-surface text-sm font-bold font-sans hover:bg-surface-container-high transition-colors"
        >
          Huỷ
        </button>
      </form>
    </div>
  );
}
