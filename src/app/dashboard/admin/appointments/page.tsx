import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAdminAppointments } from "@/services/adminService";
import type { AppointmentStatus } from "@/models/Appointment";
import AdminPagination from "@/components/admin/AdminPagination";
import AppointmentActions from "./AppointmentActions";

const STATUS_META: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending: { label: "Đang chờ", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-secondary-container text-on-secondary-container" },
  completed: { label: "Hoàn thành", cls: "bg-tertiary-container text-on-tertiary-container" },
  cancelled: { label: "Đã huỷ", cls: "bg-error-container text-on-error-container" },
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Đang chờ" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã huỷ" },
];

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin/appointments");
  if (session.user.role !== "admin") redirect("/");

  const { status = "", page = "1" } = await searchParams;
  const { rows, total, page: current, totalPages, stats } = await getAdminAppointments({
    status,
    page: Number(page) || 1,
  });

  const cards = [
    { label: "Tổng hôm nay", value: stats.today, icon: "today", color: "text-primary" },
    { label: "Đang chờ", value: stats.pending, icon: "schedule", color: "text-amber-600" },
    { label: "Đã xác nhận", value: stats.confirmed, icon: "task_alt", color: "text-secondary" },
    { label: "Đã huỷ", value: stats.cancelled, icon: "cancel", color: "text-error" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-on-surface">Quản lý lịch hẹn</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-sans">
          Theo dõi và quản lý toàn bộ lịch hẹn trong hệ thống.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-surface-container-lowest p-5 shadow-xl shadow-indigo-500/5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-on-surface-variant font-sans uppercase tracking-wide">
                {c.label}
              </p>
              <span className={`material-symbols-outlined text-[20px] ${c.color}`}>{c.icon}</span>
            </div>
            <p className="mt-3 text-3xl font-extrabold font-sans text-on-surface">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = status === f.value;
          const href = f.value
            ? `/dashboard/admin/appointments?status=${f.value}`
            : "/dashboard/admin/appointments";
          return (
            <Link
              key={f.value || "all"}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-semibold font-sans transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant font-sans">
            Không có lịch hẹn nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="pb-3 font-semibold">Mã lịch hẹn</th>
                  <th className="pb-3 font-semibold">Tên bệnh nhân</th>
                  <th className="pb-3 font-semibold">Bác sĩ</th>
                  <th className="pb-3 font-semibold">Ngày / Giờ</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                  <th className="pb-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const meta = STATUS_META[r.status];
                  return (
                    <tr key={r.id} className="border-t border-outline-variant/20">
                      <td className="py-3 font-mono font-semibold text-primary">{r.code}</td>
                      <td className="py-3 font-semibold text-on-surface">{r.patientName}</td>
                      <td className="py-3 text-on-surface-variant">Bs. {r.doctorName}</td>
                      <td className="py-3 text-on-surface-variant">
                        {r.date
                          ? `${new Date(r.date).toLocaleDateString("vi-VN")} · ${r.startTime}`
                          : "—"}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <AppointmentActions appointmentId={r.id} status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <AdminPagination
              basePath="/dashboard/admin/appointments"
              page={current}
              totalPages={totalPages}
              total={total}
              params={{ status: status || undefined }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
