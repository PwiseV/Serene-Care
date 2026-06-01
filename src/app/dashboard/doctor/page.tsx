import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAppointments } from "@/services/bookingService";
import { getMyProfile } from "@/services/doctorService";
import { getReviewsByDoctor } from "@/services/reviewService";
import type { AppointmentStatus } from "@/models/Appointment";
import DoctorAppointmentActions from "@/components/doctor/DoctorAppointmentActions";

const STATUS_META: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-secondary-container text-on-secondary-container" },
  completed: { label: "Hoàn thành", cls: "bg-tertiary-container text-on-tertiary-container" },
  cancelled: { label: "Đã huỷ", cls: "bg-error-container text-on-error-container" },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default async function DoctorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/doctor");
  if (session.user.role !== "doctor") redirect("/");

  const [appointments, profile, reviewsData] = await Promise.all([
    getAppointments(session.user.id, "doctor"),
    getMyProfile(session.user.id),
    getReviewsByDoctor(session.user.id, 1, 3),
  ]);

  const todayUTC = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments
    .filter((a) => a.slot?.date.slice(0, 10) === todayUTC)
    .sort((a, b) => (a.slot?.startTime ?? "").localeCompare(b.slot?.startTime ?? ""));

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const revenue = profile ? completedCount * profile.consultationFee : 0;

  // Weekly chart: appointment count per day for the last 7 days (by slot date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekly = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today.getTime() - (6 - i) * 86400000);
    const key = day.toISOString().slice(0, 10);
    const count = appointments.filter((a) => a.slot?.date.slice(0, 10) === key).length;
    return { label: WEEKDAY_LABELS[day.getDay()], count };
  });
  const maxWeekly = Math.max(1, ...weekly.map((d) => d.count));
  const hasWeekly = weekly.some((d) => d.count > 0);

  const cards = [
    { label: "Lịch hôm nay", value: todayAppointments.length, icon: "today", color: "text-primary", bg: "bg-primary/10" },
    { label: "Chờ xác nhận", value: pendingCount, icon: "schedule", color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Đã hoàn thành", value: completedCount, icon: "task_alt", color: "text-tertiary", bg: "bg-tertiary/10" },
    {
      label: "Doanh thu (ước)",
      value: `${(revenue * 1000).toLocaleString("vi-VN")}₫`,
      icon: "payments",
      highlight: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-on-surface">
            {greeting()}, Bs. {session.user.name?.split(" ").slice(-1)[0]}.
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant font-sans">
            Hôm nay bạn có {todayAppointments.length} lịch khám.
          </p>
        </div>
        {!profile && (
          <Link
            href="/dashboard/doctor/profile"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold font-sans text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            Hoàn thiện hồ sơ
          </Link>
        )}
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
              <span
                className={`material-symbols-outlined text-[22px] ${
                  c.highlight ? "text-on-primary" : c.color
                }`}
              >
                {c.icon}
              </span>
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
        {/* Today's schedule */}
        <div className="lg:col-span-2 rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold font-heading text-on-surface">Lịch khám hôm nay</h2>
            <Link
              href="/dashboard/doctor/schedule"
              className="text-sm font-semibold font-sans text-primary hover:underline"
            >
              Xem lịch khám
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant font-sans">
              Không có lịch khám hôm nay.
            </p>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {todayAppointments.map((apt) => {
                const meta = STATUS_META[apt.status];
                return (
                  <div key={apt.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-14 flex-shrink-0 text-sm font-bold font-sans text-primary">
                        {apt.slot?.startTime}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold font-sans text-on-surface">
                          {apt.patient.name}
                        </p>
                        {apt.patientNote && (
                          <p className="truncate text-xs italic text-on-surface-variant font-sans">
                            {apt.patientNote}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <DoctorAppointmentActions appointmentId={apt.id} status={apt.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rating + recent reviews */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
            <h2 className="mb-3 font-bold font-heading text-on-surface">Đánh giá</h2>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500 text-[32px]">star</span>
              <div>
                <p className="text-3xl font-extrabold font-sans text-on-surface">
                  {(profile?.averageRating ?? 0).toFixed(1)}
                </p>
                <p className="text-xs text-on-surface-variant font-sans">
                  {profile?.totalReviews ?? 0} đánh giá
                </p>
              </div>
            </div>
            {reviewsData.reviews.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-outline-variant/20 pt-4">
                {reviewsData.reviews.map((r) => (
                  <div key={r.id}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold font-sans text-on-surface">
                        {r.patientName}
                      </p>
                      <span className="flex items-center gap-0.5 text-xs font-bold text-on-surface">
                        <span className="material-symbols-outlined text-amber-500 text-[14px]">
                          star
                        </span>
                        {r.rating}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="truncate text-xs text-on-surface-variant font-sans">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
        <h2 className="mb-1 font-bold font-heading text-on-surface">Lịch khám 7 ngày qua</h2>
        <p className="mb-6 text-xs text-on-surface-variant font-sans">Số lịch khám theo ngày</p>
        {!hasWeekly ? (
          <p className="py-8 text-center text-sm text-on-surface-variant font-sans">
            Chưa có lịch khám trong 7 ngày qua.
          </p>
        ) : (
          <div className="flex h-40 items-end justify-between gap-3">
            {weekly.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-primary transition-all"
                    style={{ height: `${Math.max(4, (d.count / maxWeekly) * 100)}%` }}
                    title={`${d.count} lịch khám`}
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
