"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SlotInfo {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  consultationFee: number;
}

interface Props {
  doctor: Doctor;
}

const DAY_NAMES = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const MONTH_SHORT = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00Z");
  const day = DAY_NAMES[d.getUTCDay()];
  return { day, date: d.getUTCDate(), month: MONTH_SHORT[d.getUTCMonth()] };
}

export default function BookingClient({ doctor }: Props) {
  const router = useRouter();

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientNote, setPatientNote] = useState("");
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available dates on mount
  useEffect(() => {
    setLoadingDates(true);
    fetch(`/api/doctors/${doctor.id}/slots`)
      .then((r) => r.json())
      .then((data) => {
        setAvailableDates(data.dates ?? []);
        if (data.dates?.length) setSelectedDate(data.dates[0]);
      })
      .catch(() => setError("Không thể tải lịch trống. Vui lòng thử lại."))
      .finally(() => setLoadingDates(false));
  }, [doctor.id]);

  // Fetch slots for selected date
  const fetchSlots = useCallback((date: string) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/doctors/${doctor.id}/slots?date=${date}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setError("Không thể tải giờ khám. Vui lòng thử lại."))
      .finally(() => setLoadingSlots(false));
  }, [doctor.id]);

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate);
  }, [selectedDate, fetchSlots]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot, patientNote }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error === "Slot is not available"
          ? "Khung giờ này vừa được đặt bởi người khác. Vui lòng chọn khung giờ khác."
          : "Đặt lịch thất bại. Vui lòng thử lại.");
        return;
      }

      router.push("/dashboard/patient");
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const availableSlots = slots.filter((s) => s.isAvailable);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Doctor summary */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">person</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-on-surface font-sans">Bs. {doctor.name}</p>
          <p className="text-sm text-on-surface-variant font-sans">{doctor.specialty}</p>
        </div>
        <div className="text-right">
          <p className="font-extrabold text-primary font-sans text-lg">
            {doctor.consultationFee.toLocaleString("vi-VN")}k
          </p>
          <p className="text-xs text-on-surface-variant font-sans">/ lần khám</p>
        </div>
      </div>

      {/* Step 1 – Date */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
        <h2 className="text-base font-bold font-heading mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center font-sans">1</span>
          Chọn ngày khám
        </h2>

        {loadingDates ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-16 h-20 rounded-xl bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : availableDates.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-4xl text-outline mb-2 block">event_busy</span>
            <p className="text-on-surface-variant font-sans text-sm">
              Bác sĩ chưa có lịch trống trong 30 ngày tới.
            </p>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {availableDates.map((dateStr) => {
              const { day, date, month } = formatDateLabel(dateStr);
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-shrink-0 w-16 flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all font-sans cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant bg-surface-container hover:border-primary/50"
                  }`}
                >
                  <span className="text-xs font-medium mb-1">{day}</span>
                  <span className="text-xl font-extrabold leading-none">{date}</span>
                  <span className="text-xs mt-1 opacity-80">{month}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 2 – Time slot */}
      {selectedDate && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
          <h2 className="text-base font-bold font-heading mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center font-sans">2</span>
            Chọn khung giờ
          </h2>

          {loadingSlots ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-surface-container animate-pulse" />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <p className="text-on-surface-variant font-sans text-sm text-center py-4">
              Không còn khung giờ trống cho ngày này.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`py-3 px-2 rounded-xl border-2 text-sm font-bold font-sans transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant bg-surface-container hover:border-primary/50 text-on-surface"
                    }`}
                  >
                    {slot.startTime}
                    <span className="block text-xs font-normal opacity-70">– {slot.endTime}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3 – Note */}
      {selectedSlot && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
          <h2 className="text-base font-bold font-heading mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center font-sans">3</span>
            Ghi chú triệu chứng <span className="font-normal text-on-surface-variant text-sm">(tuỳ chọn)</span>
          </h2>
          <textarea
            value={patientNote}
            onChange={(e) => setPatientNote(e.target.value)}
            placeholder="Mô tả triệu chứng, lý do khám..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-surface-container font-sans text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-none transition-colors"
          />
          <p className="text-right text-xs text-on-surface-variant font-sans mt-1">
            {patientNote.length}/500
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-error/10 border border-error/30 rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-error text-lg">error</span>
          <p className="text-error text-sm font-sans">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!selectedSlot || submitting}
        className="w-full py-4 bg-primary text-on-primary rounded-full font-bold font-sans text-base shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
            Đang đặt lịch...
          </span>
        ) : (
          "Xác nhận đặt lịch"
        )}
      </button>
    </form>
  );
}
