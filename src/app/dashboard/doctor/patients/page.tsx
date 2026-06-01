import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDoctorPatients } from "@/services/doctorService";
import AdminPagination from "@/components/admin/AdminPagination";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function code(id: string) {
  return `#PT-${id.slice(-4).toUpperCase()}`;
}

export default async function DoctorPatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/doctor/patients");
  if (session.user.role !== "doctor") redirect("/");

  const { q = "", page = "1" } = await searchParams;
  const { rows, total, page: current, totalPages } = await getDoctorPatients(session.user.id, {
    q,
    page: Number(page) || 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-on-surface">Bệnh nhân của tôi</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-sans">
          Danh sách bệnh nhân đã đặt lịch khám với bạn ({total}).
        </p>
      </div>

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
                  <th className="pb-3 font-semibold">Bệnh nhân</th>
                  <th className="pb-3 font-semibold">Liên hệ</th>
                  <th className="pb-3 font-semibold text-center">Số lần khám</th>
                  <th className="pb-3 font-semibold text-right">Lần khám gần nhất</th>
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
                          <p className="font-mono text-xs text-outline">{code(p.id)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-on-surface-variant">{p.email}</td>
                    <td className="py-3 text-center font-semibold text-on-surface">{p.visitCount}</td>
                    <td className="py-3 text-right text-on-surface-variant">
                      {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString("vi-VN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <AdminPagination
              basePath="/dashboard/doctor/patients"
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
