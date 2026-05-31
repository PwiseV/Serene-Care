import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAdminDoctors } from "@/services/adminService";
import AdminPagination from "@/components/admin/AdminPagination";
import ApproveButton from "./ApproveButton";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "approved", label: "Đang hoạt động" },
  { value: "pending", label: "Đợi duyệt" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function AdminDoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin/doctors");
  if (session.user.role !== "admin") redirect("/");

  const { status = "", q = "", page = "1" } = await searchParams;
  const normalizedStatus = status === "approved" || status === "pending" ? status : undefined;

  const { rows, total, page: current, totalPages, stats } = await getAdminDoctors({
    status: normalizedStatus,
    q,
    page: Number(page) || 1,
  });

  const cards = [
    { label: "Tổng số bác sĩ", value: stats.total, icon: "stethoscope", color: "text-primary" },
    { label: "Đang hoạt động", value: stats.approved, icon: "verified", color: "text-secondary" },
    { label: "Đợi duyệt", value: stats.pending, icon: "pending_actions", color: "text-amber-600" },
    { label: "Chuyên khoa", value: stats.specialties, icon: "category", color: "text-tertiary" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold font-heading text-on-surface">Quản lý Bác sĩ</h1>
          <p className="mt-1 text-sm text-on-surface-variant font-sans">
            Danh sách bác sĩ và trạng thái xét duyệt hồ sơ.
          </p>
        </div>
        <Link
          href="/dashboard/admin/specialties"
          className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-sm font-semibold font-sans text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-[18px]">category</span>
          Quản lý chuyên khoa
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl bg-surface-container-lowest p-5 shadow-xl shadow-indigo-500/5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-on-surface-variant font-sans uppercase tracking-wide">
                {c.label}
              </p>
              <span className={`material-symbols-outlined text-[20px] ${c.color}`}>{c.icon}</span>
            </div>
            <p className="mt-3 text-3xl font-extrabold font-sans text-on-surface">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (status || "") === f.value;
          const href = f.value
            ? `/dashboard/admin/doctors?status=${f.value}`
            : "/dashboard/admin/doctors";
          return (
            <Link
              key={f.value || "all"}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-semibold font-sans transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant font-sans">
            {q ? `Không tìm thấy bác sĩ khớp với "${q}".` : "Chưa có bác sĩ nào."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="pb-3 font-semibold">Mã BS</th>
                  <th className="pb-3 font-semibold">Tên bác sĩ</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Khoa</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                  <th className="pb-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-t border-outline-variant/20">
                    <td className="py-3 font-mono font-semibold text-primary">{d.code}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary">
                          {initials(d.name)}
                        </span>
                        <span className="font-semibold text-on-surface">Bs. {d.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-on-surface-variant">{d.email}</td>
                    <td className="py-3 text-on-surface-variant">{d.specialty}</td>
                    <td className="py-3">
                      {d.isApproved ? (
                        <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-semibold text-on-secondary-container">
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Đợi duyệt
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {d.isApproved ? (
                        <span className="block text-right text-xs text-outline font-sans">—</span>
                      ) : (
                        <div className="flex justify-end">
                          <ApproveButton doctorId={d.id} />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <AdminPagination
              basePath="/dashboard/admin/doctors"
              page={current}
              totalPages={totalPages}
              total={total}
              params={{ status: status || undefined, q: q || undefined }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
