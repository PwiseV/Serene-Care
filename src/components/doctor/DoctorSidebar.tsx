"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard/doctor", label: "Tổng quan", icon: "grid_view", exact: true },
  { href: "/dashboard/doctor/schedule", label: "Lịch khám", icon: "calendar_month" },
  { href: "/dashboard/doctor/patients", label: "Bệnh nhân", icon: "groups" },
  { href: "/dashboard/doctor/reviews", label: "Đánh giá", icon: "star" },
  { href: "/dashboard/doctor/profile", label: "Hồ sơ", icon: "badge" },
];

export default function DoctorSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-surface-container-lowest border-r border-outline-variant/30">
      <div className="px-6 py-7">
        <p className="text-xl font-extrabold tracking-tight text-primary font-heading leading-none">
          SERENE CARE
        </p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant font-sans">
          Không gian Bác sĩ
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold font-sans transition-colors ${
                active
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-error px-3 py-2.5 text-sm font-bold font-sans text-on-error transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
