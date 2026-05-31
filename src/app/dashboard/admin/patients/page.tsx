import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminPatients } from "@/services/adminService";
import AdminPagination from "@/components/admin/AdminPagination";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function AdminPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin/patients");
  if (session.user.role !== "admin") redirect("/");

  const { q = "", page = "1" } = await searchParams;
  const { rows, total, page: current, totalPages, stats } = await getAdminPatients({
    q,
    page: Number(page) || 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-on-surface">
          Cơ sở dữ liệu Bệnh nhân
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant font-sans">
          Quản lý và theo dõi hồ sơ bệnh nhân. Hiện có {stats.total.toLocaleString("vi-VN")} bệnh
          nhân.
        </p>
      </div>

      {/* New-today highlight + search hint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-gradient-primary p-6 shadow-xl shadow-indigo-500/10">
          <span className="material-symbols-outlined text-on-primary text-[28px]">person_add</span>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-on-primary/80 font-sans">
            Đăng ký mới
          </p>
          <p className="text-3xl font-extrabold font-sans text-on-primary">+{stats.newToday} hôm nay</p>
        </div>
        <div className="md:col-span-2 flex items-center rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
          <p className="text-sm text-on-surface-variant font-sans">
            {q ? (
              <>
                Đang lọc theo từ khoá <span className="font-semibold text-on-surface">“{q}”</span>.
                Dùng ô tìm kiếm ở thanh trên để tìm bệnh nhân theo tên hoặc email.
              </>
            ) : (
              "Dùng ô tìm kiếm ở thanh trên để tìm bệnh nhân theo tên hoặc email."
            )}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
        {rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant font-sans">
            {q ? `Không tìm thấy bệnh nhân khớp với "${q}".` : "Chưa có bệnh nhân nào."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="pb-3 font-semibold">Thông tin bệnh nhân</th>
                  <th className="pb-3 font-semibold">Liên hệ</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                  <th className="pb-3 font-semibold">Lần khám cuối</th>
                  <th className="pb-3 font-semibold text-right">Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-outline-variant/20">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tertiary-container text-xs font-bold text-on-tertiary-container">
                          {initials(p.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-on-surface">{p.name}</p>
                          <p className="font-mono text-xs text-outline">{p.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-on-surface-variant">{p.email}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-semibold text-on-secondary-container">
                        Hoạt động
                      </span>
                    </td>
                    <td className="py-3 text-on-surface-variant">
                      {p.lastVisit ? (
                        <div>
                          <p>{new Date(p.lastVisit.date).toLocaleDateString("vi-VN")}</p>
                          <p className="text-xs text-outline">Bs. {p.lastVisit.doctorName}</p>
                        </div>
                      ) : (
                        <span className="text-outline">Chưa khám</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-on-surface-variant">
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <AdminPagination
              basePath="/dashboard/admin/patients"
              page={current}
              totalPages={totalPages}
              total={total}
              params={{ q: q || undefined }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
