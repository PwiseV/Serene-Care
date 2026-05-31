"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminInfo {
  name: string;
  avatar: string;
}

interface Notifications {
  pendingDoctors: { id: string; name: string; createdAt: string }[];
  recentBookings: { id: string; patientName: string; doctorName: string; createdAt: string }[];
  total: number;
}

interface SearchResults {
  doctors: { id: string; name: string; email: string }[];
  patients: { id: string; name: string; email: string }[];
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

export default function AdminTopbar({
  admin,
  initialNotifications,
}: {
  admin: AdminInfo;
  initialNotifications: Notifications;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notifications>(initialNotifications);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [bellOpen, setBellOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // Poll notifications every 30s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) setNotifications(await res.json());
      } catch {
        /* ignore transient errors */
      }
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          setResults(await res.json());
          setSearchOpen(true);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  // Click outside
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const goto = useCallback(
    (path: string) => {
      setSearchOpen(false);
      setQuery("");
      router.push(path);
    },
    [router]
  );

  const hasResults =
    results && (results.doctors.length > 0 || results.patients.length > 0);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 bg-surface-container-low/80 backdrop-blur-xl px-8 py-4 border-b border-outline-variant/30">
      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-xl">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setSearchOpen(true)}
          placeholder="Tìm bệnh nhân, hồ sơ hoặc bác sĩ..."
          className="w-full rounded-full border border-outline-variant/50 bg-surface-container-lowest py-2.5 pl-11 pr-4 text-sm font-sans text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />

        {searchOpen && query.trim() && (
          <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-xl shadow-indigo-500/10 border border-outline-variant/20 py-2 z-50">
            {searching && !hasResults ? (
              <p className="px-4 py-3 text-sm text-on-surface-variant font-sans">Đang tìm...</p>
            ) : !hasResults ? (
              <p className="px-4 py-3 text-sm text-on-surface-variant font-sans">
                Không tìm thấy kết quả.
              </p>
            ) : (
              <>
                {results!.doctors.length > 0 && (
                  <SearchGroup
                    label="Bác sĩ"
                    icon="stethoscope"
                    items={results!.doctors}
                    onPick={() => goto("/dashboard/admin/doctors")}
                  />
                )}
                {results!.patients.length > 0 && (
                  <SearchGroup
                    label="Bệnh nhân"
                    icon="person"
                    items={results!.patients}
                    onPick={() => goto("/dashboard/admin/patients")}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

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
              <p className="text-sm font-bold font-heading text-on-surface">Thông báo</p>
            </div>

            {notifications.total === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-on-surface-variant font-sans">
                Không có thông báo mới.
              </p>
            ) : (
              <div className="py-1">
                {notifications.pendingDoctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setBellOpen(false);
                      router.push("/dashboard/admin/doctors");
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5">
                      pending_actions
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-sans text-on-surface">
                        <span className="font-semibold">Bs. {d.name}</span> đang chờ duyệt
                      </p>
                      <p className="text-xs text-on-surface-variant font-sans">
                        {timeAgo(d.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
                {notifications.recentBookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBellOpen(false);
                      router.push("/dashboard/admin/appointments");
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                      event_available
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-sans text-on-surface">
                        <span className="font-semibold">{b.patientName}</span> đặt lịch với Bs.{" "}
                        {b.doctorName}
                      </p>
                      <p className="text-xs text-on-surface-variant font-sans">
                        {timeAgo(b.createdAt)}
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
          <p className="text-sm font-bold font-sans text-on-surface leading-tight">{admin.name}</p>
          <p className="text-xs text-on-surface-variant font-sans">Quản trị viên</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-container text-on-primary text-sm font-bold">
          {admin.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={admin.avatar} alt={admin.name} className="h-full w-full object-cover" />
          ) : (
            initials(admin.name)
          )}
        </div>
      </div>
    </header>
  );
}

function SearchGroup({
  label,
  icon,
  items,
  onPick,
}: {
  label: string;
  icon: string;
  items: { id: string; name: string; email: string }[];
  onPick: () => void;
}) {
  return (
    <div className="py-1">
      <p className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant font-sans">
        {label}
      </p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={onPick}
          className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold font-sans text-on-surface truncate">{item.name}</p>
            <p className="text-xs text-on-surface-variant font-sans truncate">{item.email}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
