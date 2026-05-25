/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctorById } from "@/services/doctorService";
import { auth } from "@/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

const DAY_NAMES = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function StarRating({ rating, total }: { rating: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`material-symbols-outlined text-lg ${
              i <= Math.round(rating) ? "text-amber-500" : "text-outline"
            }`}
            style={{ fontVariationSettings: i <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}
          >
            star
          </span>
        ))}
      </div>
      <span className="font-bold text-on-surface">{rating.toFixed(1)}</span>
      <span className="text-on-surface-variant text-sm font-sans">({total} đánh giá)</span>
    </div>
  );
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [doctor, session] = await Promise.all([getDoctorById(id), auth()]);

  if (!doctor) notFound();

  const isLoggedIn = !!session?.user;
  const bookHref = isLoggedIn ? `/appointments/new?doctorId=${id}` : `/login?callbackUrl=/doctors/${id}`;

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant font-sans">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href="/doctors" className="hover:text-primary transition-colors">Bác sĩ</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-medium">Bs. {doctor.name}</span>
        </nav>

        {/* Doctor Header Card */}
        <div className="bg-surface-container-lowest rounded-3xl p-8 mb-8 shadow-xl shadow-indigo-500/5">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              {doctor.avatar ? (
                <img
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-40 h-40 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-40 h-40 rounded-2xl bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-7xl text-outline">
                    account_circle
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-1 block font-sans">
                {doctor.specialty.name}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight font-heading mb-2">
                Bs. {doctor.name}
              </h1>

              {doctor.totalReviews > 0 && (
                <div className="mb-3">
                  <StarRating rating={doctor.averageRating} total={doctor.totalReviews} />
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-6 text-sm font-sans">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-primary">
                    work_history
                  </span>
                  {doctor.experienceYears} năm kinh nghiệm
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-primary">
                    badge
                  </span>
                  CCHN: {doctor.licenseNumber}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="text-2xl font-extrabold text-primary font-sans">
                  {doctor.consultationFee.toLocaleString("vi-VN")}k
                  <span className="text-on-surface-variant font-medium text-sm">/khám</span>
                </div>
                <Link
                  href={bookHref}
                  className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold font-sans shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity active:scale-95"
                >
                  {isLoggedIn ? "Đặt lịch khám" : "Đăng nhập để đặt lịch"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Bio */}
            {doctor.bio && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
                <h2 className="text-lg font-bold font-heading mb-3">Giới thiệu</h2>
                <p className="text-on-surface-variant leading-relaxed font-sans">{doctor.bio}</p>
              </div>
            )}

            {/* Education */}
            {doctor.education.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
                <h2 className="text-lg font-bold font-heading mb-4">Học vấn & Đào tạo</h2>
                <div className="flex flex-col gap-4">
                  {doctor.education.map((edu, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-lg">school</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface font-sans">{edu.degree}</p>
                        <p className="text-sm text-on-surface-variant font-sans">
                          {edu.institution} · {edu.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
              <h2 className="text-lg font-bold font-heading mb-4">
                Đánh giá từ bệnh nhân
                {doctor.totalReviews > 0 && (
                  <span className="ml-2 text-sm font-normal text-on-surface-variant">
                    ({doctor.totalReviews})
                  </span>
                )}
              </h2>

              {doctor.reviews.length === 0 ? (
                <p className="text-on-surface-variant font-sans text-sm">
                  Chưa có đánh giá nào. Hãy là người đầu tiên!
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {doctor.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-on-surface font-sans text-sm">
                          {review.patientName}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={`material-symbols-outlined text-sm ${
                                i <= review.rating ? "text-amber-500" : "text-outline"
                              }`}
                              style={{
                                fontVariationSettings:
                                  i <= review.rating ? "'FILL' 1" : "'FILL' 0",
                              }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-on-surface-variant text-sm font-sans leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column – Working Hours */}
          <div className="flex flex-col gap-8">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5">
              <h2 className="text-lg font-bold font-heading mb-4">Lịch làm việc</h2>

              {doctor.workingHours.length === 0 ? (
                <p className="text-on-surface-variant font-sans text-sm">
                  Chưa cập nhật lịch làm việc.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {doctor.workingHours
                    .slice()
                    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                    .map((wh, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0"
                      >
                        <span className="font-medium text-on-surface font-sans text-sm">
                          {DAY_NAMES[wh.dayOfWeek]}
                        </span>
                        <span className="text-primary font-bold font-sans text-sm">
                          {wh.startTime} – {wh.endTime}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* CTA card */}
            <div className="bg-primary-container rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <h3 className="text-white font-bold font-heading mb-2">Sẵn sàng đặt khám?</h3>
              <p className="text-white/80 text-sm font-sans mb-4">
                Chọn khung giờ phù hợp và xác nhận trong vài bước đơn giản.
              </p>
              <Link
                href={bookHref}
                className="block text-center bg-white text-primary px-6 py-3 rounded-full font-bold font-sans text-sm hover:opacity-90 transition-opacity active:scale-95"
              >
                {isLoggedIn ? "Đặt lịch ngay" : "Đăng nhập"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
