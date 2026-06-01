import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getReviewsByDoctor } from "@/services/reviewService";
import { getMyProfile } from "@/services/doctorService";
import AdminPagination from "@/components/admin/AdminPagination";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-[16px] ${
            i < rating ? "text-amber-500" : "text-outline-variant"
          }`}
          style={{ fontVariationSettings: i < rating ? "'FILL' 1" : undefined }}
        >
          star
        </span>
      ))}
    </span>
  );
}

export default async function DoctorReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/doctor/reviews");
  if (session.user.role !== "doctor") redirect("/");

  const { page = "1" } = await searchParams;
  const current = Number(page) || 1;
  const limit = 10;

  const [profile, { reviews, total }] = await Promise.all([
    getMyProfile(session.user.id),
    getReviewsByDoctor(session.user.id, current, limit),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-on-surface">Đánh giá</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-sans">
          Phản hồi từ bệnh nhân sau khi khám.
        </p>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-6 rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
        <div className="text-center">
          <p className="text-4xl font-extrabold font-sans text-on-surface">
            {(profile?.averageRating ?? 0).toFixed(1)}
          </p>
          <Stars rating={Math.round(profile?.averageRating ?? 0)} />
        </div>
        <div className="border-l border-outline-variant/30 pl-6">
          <p className="text-sm text-on-surface-variant font-sans">Tổng số đánh giá</p>
          <p className="text-2xl font-extrabold font-sans text-on-surface">
            {profile?.totalReviews ?? 0}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
        {reviews.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant font-sans">
            Chưa có đánh giá nào.
          </p>
        ) : (
          <>
            <div className="divide-y divide-outline-variant/20">
              {reviews.map((r) => (
                <div key={r.id} className="py-4 first:pt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold font-sans text-on-surface">
                      {r.patientName}
                    </p>
                    <Stars rating={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-1 text-sm text-on-surface-variant font-sans">{r.comment}</p>
                  )}
                  <p className="mt-1 text-xs text-outline font-sans">
                    {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
            <AdminPagination
              basePath="/dashboard/doctor/reviews"
              page={current}
              totalPages={totalPages}
              total={total}
              limit={limit}
            />
          </>
        )}
      </div>
    </div>
  );
}
