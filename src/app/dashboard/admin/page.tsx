import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminOverview } from "@/services/adminService";
import type { AppointmentStatus } from "@/models/Appointment";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

const STATUS_META: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending: { label: "Đang chờ", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-secondary-container text-on-secondary-container" },
  completed: { label: "Hoàn thành", cls: "bg-tertiary-container text-on-tertiary-container" },
  cancelled: { label: "Đã huỷ", cls: "bg-error-container text-on-error-container" },
};

function formatFee(k: number) {
  // consultationFee is stored in thousands of VND (…k)
  return `${(k * 1000).toLocaleString("vi-VN")}₫`;
}

export default async function AdminOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin");
  if (session.user.role !== "admin") redirect("/");

  const { stats, recentAppointments, topDoctors, weeklyAppointments } = await getAdminOverview();
  const maxWeekly = Math.max(1, ...weeklyAppointments.map((d) => d.count));
  const hasWeekly = weeklyAppointments.some((d) => d.count > 0);

  const cards = [
    { label: "Tổng lịch hẹn", value: stats.totalAppointments.toLocaleString("vi-VN"), icon: "calendar_month", color: "text-primary", bg: "bg-primary/10" },
    { label: "Bác sĩ hoạt động", value: stats.activeDoctors.toLocaleString("vi-VN"), icon: "stethoscope", color: "text-tertiary", bg: "bg-tertiary/10" },
    { label: "Bệnh nhân mới (30 ngày)", value: stats.newPatients.toLocaleString("vi-VN"), icon: "person_add", color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Doanh thu (đã hoàn thành)", value: formatFee(stats.revenue), icon: "payments", color: "text-on-primary", bg: "", highlight: true },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-on-surface">
          {greeting()}, {session.user.name?.split(" ").slice(-1)[0]}.
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant font-sans">
          Đây là những gì đang diễn ra tại phòng khám hôm nay.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl p-5 shadow-xl shadow-indigo-500/5 ${
              c.highlight ? "bg-gradient-primary" : "bg-surface-container-lowest"
            }`}
          >
            <div
              className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                c.highlight ? "bg-white/20" : c.bg
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] ${c.color}`}>{c.icon}</span>
            </div>
            <p
              className={`text-2xl font-extrabold font-sans ${
                c.highlight ? "text-on-primary" : "text-on-surface"
              }`}
            >
              {c.value}
            </p>
            <p
              className={`mt-1 text-xs font-sans ${
                c.highlight ? "text-on-primary/80" : "text-on-surface-variant"
              }`}
            >
              {c.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent appointments */}
        <div className="lg:col-span-2 rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
          <h2 className="mb-4 font-bold font-heading text-on-surface">Đặt lịch gần đây</h2>
          {recentAppointments.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant font-sans">
              Chưa có lịch hẹn nào.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-on-surface-variant">
                    <th className="pb-3 font-semibold">Bệnh nhân</th>
                    <th className="pb-3 font-semibold">Bác sĩ</th>
                    <th className="pb-3 font-semibold">Chuyên khoa</th>
                    <th className="pb-3 font-semibold">Trạng thái</th>
                    <th className="pb-3 font-semibold text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((a) => {
                    const meta = STATUS_META[a.status];
                    return (
                      <tr key={a.id} className="border-t border-outline-variant/20">
                        <td className="py-3 font-semibold text-on-surface">{a.patientName}</td>
                        <td className="py-3 text-on-surface-variant">Bs. {a.doctorName}</td>
                        <td className="py-3 text-on-surface-variant">{a.specialty}</td>
                        <td className="py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 text-right text-on-surface-variant">
                          {a.date
                            ? `${new Date(a.date).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                              })} ${a.startTime}`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top doctors */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
          <h2 className="mb-4 font-bold font-heading text-on-surface">Bác sĩ tiêu biểu</h2>
          {topDoctors.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant font-sans">
              Chưa có bác sĩ nào.
            </p>
          ) : (
            <div className="space-y-4">
              {topDoctors.map((d) => (
                <div key={d.id}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold font-sans text-on-surface">
                        Bs. {d.name}
                      </p>
                      <p className="truncate text-xs text-on-surface-variant font-sans">
                        {d.specialty}
                      </p>
                    </div>
                    <span className="flex items-center gap-0.5 text-sm font-bold font-sans text-on-surface">
                      <span className="material-symbols-outlined text-amber-500 text-[16px]">
                        star
                      </span>
                      {d.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-gradient-primary"
                      style={{ width: `${(d.averageRating / 5) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-on-surface-variant font-sans">
                    {d.totalReviews} đánh giá
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weekly capacity chart */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
        <h2 className="mb-1 font-bold font-heading text-on-surface">Công suất phòng khám</h2>
        <p className="mb-6 text-xs text-on-surface-variant font-sans">Lịch hẹn trong 7 ngày qua</p>
        {!hasWeekly ? (
          <p className="py-8 text-center text-sm text-on-surface-variant font-sans">
            Chưa có lịch hẹn trong 7 ngày qua.
          </p>
        ) : (
          <div className="flex items-end justify-between gap-3 h-40">
            {weeklyAppointments.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-primary transition-all"
                    style={{ height: `${Math.max(4, (d.count / maxWeekly) * 100)}%` }}
                    title={`${d.count} lịch hẹn`}
                  />
                </div>
                <span className="text-xs font-semibold text-on-surface-variant font-sans">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
