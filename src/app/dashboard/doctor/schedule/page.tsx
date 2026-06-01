import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAppointments } from "@/services/bookingService";
import type { AppointmentStatus } from "@/models/Appointment";
import DoctorAppointmentActions from "@/components/doctor/DoctorAppointmentActions";
import SlotGenerator from "./SlotGenerator";

const STATUS_META: Record<AppointmentStatus, { label: string; cls: string }> = {
  pending: { label: "Chờ xác nhận", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận", cls: "bg-secondary-container text-on-secondary-container" },
  completed: { label: "Hoàn thành", cls: "bg-tertiary-container text-on-tertiary-container" },
  cancelled: { label: "Đã huỷ", cls: "bg-error-container text-on-error-container" },
};

const DAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

/** Monday (UTC) of the week at `offset` weeks from the current week. */
function weekStartUTC(offset: number): Date {
  const now = new Date();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const diffToMon = (base.getUTCDay() + 6) % 7;
  base.setUTCDate(base.getUTCDate() - diffToMon + offset * 7);
  return base;
}

function fmt(d: Date) {
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function DoctorSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/doctor/schedule");
  if (session.user.role !== "doctor") redirect("/");

  const { w = "0" } = await searchParams;
  const offset = Number.isNaN(Number(w)) ? 0 : Number(w);

  const appointments = await getAppointments(session.user.id, "doctor");

  const monday = weekStartUTC(offset);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const todayKey = new Date().toISOString().slice(0, 10);

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + i);
    const key = date.toISOString().slice(0, 10);
    const items = appointments
      .filter((a) => a.slot?.date.slice(0, 10) === key)
      .sort((a, b) => (a.slot?.startTime ?? "").localeCompare(b.slot?.startTime ?? ""));
    return { date, key, items, isToday: key === todayKey };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-on-surface">Lịch khám</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-sans">
            Tuần {fmt(monday)} – {fmt(sunday)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/doctor/schedule?w=${offset - 1}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </Link>
          <Link
            href="/dashboard/doctor/schedule"
            className="rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-semibold font-sans text-on-surface transition-colors hover:bg-surface-container"
          >
            Tuần này
          </Link>
          <Link
            href={`/dashboard/doctor/schedule?w=${offset + 1}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </Link>
        </div>
      </div>

      <SlotGenerator />

      {/* Weekly agenda */}
      <div className="space-y-3">
        {days.map((day) => (
          <div
            key={day.key}
            className={`rounded-2xl bg-surface-container-lowest p-5 shadow-xl shadow-indigo-500/5 ${
              day.isToday ? "ring-2 ring-primary/40" : ""
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <h2 className="font-bold font-heading text-on-surface">
                {DAY_NAMES[day.date.getUTCDay()]}
              </h2>
              <span className="text-sm text-on-surface-variant font-sans">{fmt(day.date)}</span>
              {day.isToday && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-on-primary">
                  Hôm nay
                </span>
              )}
              {day.items.length > 0 && (
                <span className="ml-auto text-xs font-semibold text-on-surface-variant font-sans">
                  {day.items.length} lịch
                </span>
              )}
            </div>

            {day.items.length === 0 ? (
              <p className="text-sm text-outline font-sans">Không có lịch khám.</p>
            ) : (
              <div className="divide-y divide-outline-variant/20">
                {day.items.map((apt) => {
                  const meta = STATUS_META[apt.status];
                  return (
                    <div key={apt.id} className="flex items-center justify-between gap-3 py-2.5">
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
        ))}
      </div>
    </div>
  );
}
