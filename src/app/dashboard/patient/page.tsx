import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAppointments } from "@/services/bookingService";
import { getReviewedAppointmentIds } from "@/services/reviewService";
import CancelButton from "./CancelButton";
import ReviewButton from "./ReviewButton";
import HealthRecordsSection from "./HealthRecordsSection";

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

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/patient");
  if (session.user.role !== "patient") redirect("/");

  const [appointments, reviewedIds] = await Promise.all([
    getAppointments(session.user.id, "patient"),
    getReviewedAppointmentIds(session.user.id),
  ]);

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-extrabold font-heading mb-1">Lịch khám của tôi</h1>
        <p className="text-on-surface-variant font-sans mb-8 text-sm">
          {appointments.length} lịch hẹn
        </p>

        {appointments.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-16 text-center shadow-xl shadow-indigo-500/5">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">
              calendar_today
            </span>
            <p className="text-on-surface-variant font-sans">Bạn chưa có lịch khám nào.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold font-sans ${STATUS_COLORS[apt.status]}`}
                      >
                        {STATUS_LABELS[apt.status]}
                      </span>
                    </div>

                    <h3 className="font-bold text-on-surface font-sans">Bs. {apt.doctor.name}</h3>

                    {apt.slot && (
                      <p className="text-sm text-on-surface-variant font-sans mt-1">
                        {new Date(apt.slot.date).toLocaleDateString("vi-VN", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                        {" · "}
                        {apt.slot.startTime} – {apt.slot.endTime}
                      </p>
                    )}

                    {apt.patientNote && (
                      <p className="text-sm text-on-surface-variant font-sans mt-2 italic">
                        &ldquo;{apt.patientNote}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {(apt.status === "pending" || apt.status === "confirmed") && (
                      <CancelButton appointmentId={apt.id} />
                    )}
                    {apt.status === "cancelled" && (
                      <Link
                        href={`/appointments/new?doctorId=${apt.doctor.id}`}
                        className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-bold font-sans hover:bg-primary/10 transition-colors"
                      >
                        Đặt lại
                      </Link>
                    )}
                  </div>
                </div>

                {apt.status === "completed" && !reviewedIds.has(apt.id) && (
                  <ReviewButton appointmentId={apt.id} />
                )}

                {apt.status === "completed" && reviewedIds.has(apt.id) && (
                  <p className="mt-3 pt-3 border-t border-outline-variant/20 text-xs text-on-surface-variant font-sans flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    Đã đánh giá
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        <HealthRecordsSection />
      </div>
    </main>
  );
}
