import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAppointments } from "@/services/bookingService";
import { getMyProfile } from "@/services/doctorService";
import ConfirmButton from "./ConfirmButton";

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã huỷ",
  completed: "Hoàn thành",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  completed: "bg-blue-100 text-blue-700",
};

export default async function DoctorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/doctor");
  if (session.user.role !== "doctor") redirect("/");

  const [appointments, profile] = await Promise.all([
    getAppointments(session.user.id, "doctor"),
    getMyProfile(session.user.id),
  ]);

  const todayUTC = new Date().toISOString().slice(0, 10);
  const todayAppointments = appointments
    .filter((apt) => apt.slot?.date.slice(0, 10) === todayUTC)
    .sort((a, b) => (a.slot?.startTime ?? "").localeCompare(b.slot?.startTime ?? ""));

  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const revenue = profile ? completedCount * profile.consultationFee : 0;

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold font-heading mb-1">Bảng điều khiển</h1>
            <p className="text-on-surface-variant font-sans text-sm">
              Chào mừng, Bs. {session.user.name}
            </p>
          </div>
          <Link
            href="/dashboard/doctor/profile"
            className="px-5 py-2 rounded-full bg-surface-container border border-outline-variant text-sm font-bold font-sans hover:bg-surface-container-high transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base leading-none">edit</span>
            Cập nhật hồ sơ
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Tổng lịch hẹn", value: appointments.length, icon: "calendar_month", color: "text-primary" },
            { label: "Chờ xác nhận", value: pendingCount, icon: "pending", color: "text-amber-600" },
            { label: "Đã hoàn thành", value: completedCount, icon: "check_circle", color: "text-green-600" },
            {
              label: "Doanh thu (ước)",
              value: `${revenue.toLocaleString("vi-VN")}k`,
              icon: "payments",
              color: "text-secondary",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-xl shadow-indigo-500/5"
            >
              <span className={`material-symbols-outlined text-2xl ${stat.color} mb-2 block`}>
                {stat.icon}
              </span>
              <p className="text-2xl font-extrabold font-sans text-on-surface">{stat.value}</p>
              <p className="text-xs text-on-surface-variant font-sans mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's appointments */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
            <h2 className="text-lg font-bold font-heading mb-4">
              Lịch hẹn hôm nay
              <span className="ml-2 text-sm font-normal text-on-surface-variant">
                ({todayAppointments.length})
              </span>
            </h2>

            {todayAppointments.length === 0 ? (
              <p className="text-on-surface-variant font-sans text-sm">Không có lịch hẹn hôm nay.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-16 text-sm font-bold text-primary font-sans flex-shrink-0">
                        {apt.slot?.startTime}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface font-sans text-sm truncate">
                          {apt.patient.name}
                        </p>
                        {apt.patientNote && (
                          <p className="text-xs text-on-surface-variant font-sans italic truncate">
                            {apt.patientNote}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold font-sans ${STATUS_COLORS[apt.status]}`}>
                        {STATUS_LABELS[apt.status]}
                      </span>
                      {apt.status === "pending" && (
                        <ConfirmButton appointmentId={apt.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All appointments */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
            <h2 className="text-lg font-bold font-heading mb-4">Tất cả lịch hẹn</h2>

            {appointments.length === 0 ? (
              <p className="text-on-surface-variant font-sans text-sm">Chưa có lịch hẹn nào.</p>
            ) : (
              <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-on-surface font-sans text-sm truncate">
                        {apt.patient.name}
                      </p>
                      {apt.slot && (
                        <p className="text-xs text-on-surface-variant font-sans">
                          {new Date(apt.slot.date).toLocaleDateString("vi-VN", {
                            weekday: "short",
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                          {" · "}
                          {apt.slot.startTime}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold font-sans flex-shrink-0 ml-2 ${STATUS_COLORS[apt.status]}`}>
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
