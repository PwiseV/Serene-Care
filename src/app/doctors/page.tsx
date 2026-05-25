/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Suspense } from "react";
import { getDoctors } from "@/services/doctorService";
import dbConnect from "@/lib/mongoose";
import Specialty from "@/models/Specialty";
import DoctorSearchForm from "@/components/doctors/DoctorSearchForm";

interface PageProps {
  searchParams: Promise<{ search?: string; specialtyId?: string; page?: string }>;
}

async function getSpecialties() {
  await dbConnect();
  return Specialty.find().sort({ name: 1 }).lean();
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="material-symbols-outlined text-sm text-amber-500"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        star
      </span>
      <span className="text-sm font-bold text-on-surface">{rating.toFixed(1)}</span>
    </div>
  );
}

export default async function DoctorsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const specialtyId = params.specialtyId ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));
  const limit = 12;

  const [{ doctors, total }, specialties] = await Promise.all([
    getDoctors({ search, specialtyId, page, limit }),
    getSpecialties(),
  ]);

  const totalPages = Math.ceil(total / limit);

  const buildPageUrl = (p: number) => {
    const q = new URLSearchParams();
    if (search) q.set("search", search);
    if (specialtyId) q.set("specialtyId", specialtyId);
    q.set("page", String(p));
    return `/doctors?${q.toString()}`;
  };

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-8 mb-12">
        <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2 block font-sans">
          ĐỘI NGŨ Y TẾ
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight font-heading">
              Tìm Bác Sĩ
            </h1>
            <p className="text-on-surface-variant mt-2 font-sans">
              {total > 0
                ? `Tìm thấy ${total} bác sĩ phù hợp`
                : "Không tìm thấy bác sĩ nào"}
            </p>
          </div>
        </div>

        <Suspense>
          <DoctorSearchForm
            specialties={specialties.map((s) => ({
              _id: s._id.toString(),
              name: s.name,
            }))}
          />
        </Suspense>
      </section>

      {/* Doctor Grid */}
      <section className="max-w-7xl mx-auto px-8">
        {doctors.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">
              person_search
            </span>
            <p className="text-on-surface-variant font-sans text-lg">
              Không tìm thấy bác sĩ phù hợp với bộ lọc hiện tại.
            </p>
            <Link
              href="/doctors"
              className="mt-4 inline-block text-primary font-bold hover:underline font-sans"
            >
              Xóa bộ lọc
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/doctors/${doctor.id}`}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-indigo-500/5"
              >
                <div className="h-56 overflow-hidden relative bg-surface-container">
                  {doctor.avatar ? (
                    <img
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500"
                      src={doctor.avatar}
                      alt={doctor.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-7xl text-outline">
                        account_circle
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-xs text-on-secondary-container"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-xs font-bold text-on-secondary-container">
                      {doctor.averageRating > 0
                        ? doctor.averageRating.toFixed(1)
                        : "Mới"}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-1 block font-sans">
                      {doctor.specialty.name}
                    </span>
                    <h3 className="text-lg font-bold text-on-surface font-heading">
                      Bs. {doctor.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed font-sans line-clamp-2">
                      {doctor.bio || "Bác sĩ chuyên khoa tại Serene Care."}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="text-primary font-bold font-sans">
                        {doctor.consultationFee.toLocaleString("vi-VN")}k
                        <span className="text-on-surface-variant font-medium text-xs">
                          /khám
                        </span>
                      </div>
                      {doctor.totalReviews > 0 && (
                        <div className="flex items-center gap-2">
                          <StarRating rating={doctor.averageRating} />
                          <span className="text-xs text-on-surface-variant font-sans">
                            ({doctor.totalReviews})
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="px-5 py-2.5 bg-surface-container-high group-hover:bg-primary group-hover:text-white rounded-full font-bold text-sm transition-all font-sans">
                      Đặt khám
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1)}
                className="p-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildPageUrl(p)}
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold font-sans transition-colors ${
                  p === page
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                }`}
              >
                {p}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1)}
                className="p-3 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
