"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface DoctorInfo {
  name: string;
  avatar: string;
}

interface Notification {
  id: string;
  patientName: string;
  date: string | null;
  startTime: string;
  createdAt: string;
}

interface Notifications {
  items: Notification[];
  total: number;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export default function DoctorTopbar({
  doctor,
  initialNotifications,
}: {
  doctor: DoctorInfo;
  initialNotifications: Notifications;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notifications>(initialNotifications);
  const [query, setQuery] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/doctor/notifications");
        if (res.ok) setNotifications(await res.json());
      } catch {
        /* ignore transient errors */
      }
    }, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/dashboard/doctor/patients?q=${encodeURIComponent(q)}` : "/dashboard/doctor/patients");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 bg-surface-container-low/80 backdrop-blur-xl px-8 py-4 border-b border-outline-variant/30">
      {/* Search */}
      <form onSubmit={submitSearch} className="relative flex-1 max-w-xl">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm bệnh nhân của bạn..."
          className="w-full rounded-full border border-outline-variant/50 bg-surface-container-lowest py-2.5 pl-11 pr-4 text-sm font-sans text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />
      </form>

      {/* Notify bell */}
      <div ref={bellRef} className="relative">
        <button
          onClick={() => setBellOpen((v) => !v)}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Thông báo"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {notifications.total > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
              {notifications.total > 99 ? "99+" : notifications.total}
            </span>
          )}
        </button>

        {bellOpen && (
          <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-xl shadow-indigo-500/10 border border-outline-variant/20 z-50">
            <div className="px-4 py-3 border-b border-outline-variant/20">
              <p className="text-sm font-bold font-heading text-on-surface">Lịch đặt mới</p>
            </div>

            {notifications.total === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-on-surface-variant font-sans">
                Không có lịch đặt mới.
              </p>
            ) : (
              <div className="py-1">
                {notifications.items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setBellOpen(false);
                      router.push("/dashboard/doctor/schedule");
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      event_available
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-sans text-on-surface">
                        <span className="font-semibold">{n.patientName}</span> đặt lịch khám
                      </p>
                      <p className="text-xs text-on-surface-variant font-sans">
                        {n.date
                          ? `${new Date(n.date).toLocaleDateString("vi-VN")} · ${n.startTime} — `
                          : ""}
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile chip */}
      <div className="flex items-center gap-3 pl-1">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold font-sans text-on-surface leading-tight">
            Bs. {doctor.name}
          </p>
          <p className="text-xs text-on-surface-variant font-sans">Bác sĩ</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-container text-on-primary text-sm font-bold">
          {doctor.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doctor.avatar} alt={doctor.name} className="h-full w-full object-cover" />
          ) : (
            initials(doctor.name)
          )}
        </div>
      </div>
    </header>
  );
}
