"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DAY_NAMES = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

interface Specialty {
  _id: string;
  name: string;
}

interface Education {
  degree: string;
  institution: string;
  year: number;
}

interface WorkingHour {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

interface ProfileForm {
  specialtyId: string;
  bio: string;
  experienceYears: number;
  licenseNumber: string;
  consultationFee: number;
  education: Education[];
  workingHours: WorkingHour[];
}

const EMPTY_FORM: ProfileForm = {
  specialtyId: "",
  bio: "",
  experienceYears: 0,
  licenseNumber: "",
  consultationFee: 0,
  education: [],
  workingHours: [],
};

export default function DoctorProfilePage() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/specialties").then((r) => r.json()),
      fetch("/api/doctors/profile").then((r) => r.json()),
    ]).then(([specData, profileData]) => {
      setSpecialties(specData.specialties ?? []);
      if (profileData.profile) {
        setForm({
          specialtyId: profileData.profile.specialtyId ?? "",
          bio: profileData.profile.bio ?? "",
          experienceYears: profileData.profile.experienceYears ?? 0,
          licenseNumber: profileData.profile.licenseNumber ?? "",
          consultationFee: profileData.profile.consultationFee ?? 0,
          education: profileData.profile.education ?? [],
          workingHours: profileData.profile.workingHours ?? [],
        });
      }
      setLoading(false);
    });
  }, []);

  // ── Working hours helpers ──────────────────────────────────
  const enabledDays = new Set(form.workingHours.map((wh) => wh.dayOfWeek));

  function toggleDay(day: number) {
    if (enabledDays.has(day)) {
      setForm((f) => ({ ...f, workingHours: f.workingHours.filter((wh) => wh.dayOfWeek !== day) }));
    } else {
      setForm((f) => ({
        ...f,
        workingHours: [
          ...f.workingHours,
          { dayOfWeek: day, startTime: "08:00", endTime: "17:00", slotDurationMinutes: 30 },
        ].sort((a, b) => a.dayOfWeek - b.dayOfWeek),
      }));
    }
  }

  function updateWorkingHour(day: number, field: keyof WorkingHour, value: string | number) {
    setForm((f) => ({
      ...f,
      workingHours: f.workingHours.map((wh) =>
        wh.dayOfWeek === day ? { ...wh, [field]: value } : wh
      ),
    }));
  }

  // ── Education helpers ──────────────────────────────────────
  function addEducation() {
    setForm((f) => ({
      ...f,
      education: [...f.education, { degree: "", institution: "", year: new Date().getFullYear() }],
    }));
  }

  function updateEducation(i: number, field: keyof Education, value: string | number) {
    setForm((f) => ({
      ...f,
      education: f.education.map((edu, idx) => (idx === i ? { ...edu, [field]: value } : edu)),
    }));
  }

  function removeEducation(i: number) {
    setForm((f) => ({ ...f, education: f.education.filter((_, idx) => idx !== i) }));
  }

  // ── Submit ─────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/doctors/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Có lỗi xảy ra");
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError("Không thể kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="pt-24 pb-20 min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-outline animate-spin">
          progress_activity
        </span>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard/doctor"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold font-heading">Cập nhật hồ sơ</h1>
            <p className="text-on-surface-variant font-sans text-sm">Thông tin hành nghề của bạn</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic info */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5 flex flex-col gap-5">
            <h2 className="text-base font-bold font-heading">Thông tin cơ bản</h2>

            <div>
              <label className="block text-sm font-bold font-sans text-on-surface mb-1">
                Chuyên khoa <span className="text-error">*</span>
              </label>
              <select
                value={form.specialtyId}
                onChange={(e) => setForm((f) => ({ ...f, specialtyId: e.target.value }))}
                required
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
              >
                <option value="">Chọn chuyên khoa</option>
                {specialties.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold font-sans text-on-surface mb-1">
                Số CCHN <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                required
                placeholder="VD: 12345/BYT-CCT"
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold font-sans text-on-surface mb-1">
                  Kinh nghiệm (năm)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, experienceYears: Number(e.target.value) }))
                  }
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold font-sans text-on-surface mb-1">
                  Phí khám (nghìn đồng) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.consultationFee}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, consultationFee: Number(e.target.value) }))
                  }
                  required
                  className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold font-sans text-on-surface mb-1">
                Giới thiệu bản thân
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={4}
                placeholder="Mô tả kinh nghiệm, chuyên môn..."
                className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm font-sans bg-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Education */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold font-heading">Học vấn & Đào tạo</h2>
              <button
                type="button"
                onClick={addEducation}
                className="text-sm text-primary font-bold font-sans flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-base leading-none">add</span>
                Thêm
              </button>
            </div>

            {form.education.length === 0 && (
              <p className="text-sm text-on-surface-variant font-sans">Chưa có thông tin học vấn.</p>
            )}

            {form.education.map((edu, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 bg-surface-container rounded-xl">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeEducation(i)}
                    className="text-error text-xs font-bold font-sans hover:opacity-80"
                  >
                    Xoá
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Bằng cấp (VD: Bác sĩ đa khoa)"
                  value={edu.degree}
                  onChange={(e) => updateEducation(i, "degree", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Trường / cơ sở đào tạo"
                  value={edu.institution}
                  onChange={(e) => updateEducation(i, "institution", e.target.value)}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  placeholder="Năm tốt nghiệp"
                  value={edu.year}
                  onChange={(e) => updateEducation(i, "year", Number(e.target.value))}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>

          {/* Working hours */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5 flex flex-col gap-4">
            <h2 className="text-base font-bold font-heading">Lịch làm việc</h2>
            <p className="text-xs text-on-surface-variant font-sans -mt-2">
              Chọn ngày và thiết lập giờ làm việc. Hệ thống tự tạo slot theo thời gian mỗi ca.
            </p>

            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const isEnabled = enabledDays.has(day);
                const wh = form.workingHours.find((w) => w.dayOfWeek === day);
                return (
                  <div key={day}>
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => toggleDay(day)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-bold font-sans text-on-surface">
                        {DAY_NAMES[day]}
                      </span>
                    </label>

                    {isEnabled && wh && (
                      <div className="ml-7 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-on-surface-variant font-sans mb-1">
                            Bắt đầu
                          </label>
                          <input
                            type="time"
                            value={wh.startTime}
                            onChange={(e) => updateWorkingHour(day, "startTime", e.target.value)}
                            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-on-surface-variant font-sans mb-1">
                            Kết thúc
                          </label>
                          <input
                            type="time"
                            value={wh.endTime}
                            onChange={(e) => updateWorkingHour(day, "endTime", e.target.value)}
                            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-on-surface-variant font-sans mb-1">
                            Mỗi ca (phút)
                          </label>
                          <select
                            value={wh.slotDurationMinutes}
                            onChange={(e) =>
                              updateWorkingHour(day, "slotDurationMinutes", Number(e.target.value))
                            }
                            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm font-sans bg-surface focus:outline-none focus:border-primary"
                          >
                            <option value={15}>15 phút</option>
                            <option value={30}>30 phút</option>
                            <option value={45}>45 phút</option>
                            <option value={60}>60 phút</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback & Submit */}
          {error && (
            <p className="text-sm text-error font-sans text-center">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 font-sans text-center font-bold">
              Hồ sơ đã được cập nhật thành công!
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-bold font-sans text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu hồ sơ"}
          </button>
        </form>
      </div>
    </main>
  );
}
