import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getAdminStats } from "@/services/adminService";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin");
  if (session.user.role !== "admin") redirect("/");

  const stats = await getAdminStats();

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold font-heading mb-1">Quản trị hệ thống</h1>
          <p className="text-on-surface-variant font-sans text-sm">
            Chào mừng, {session.user.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Bác sĩ đã duyệt",
              value: stats.totalDoctors,
              icon: "stethoscope",
              color: "text-primary",
            },
            {
              label: "Chờ duyệt",
              value: stats.pendingDoctors,
              icon: "pending_actions",
              color: stats.pendingDoctors > 0 ? "text-amber-600" : "text-on-surface-variant",
            },
            {
              label: "Bệnh nhân",
              value: stats.totalPatients,
              icon: "people",
              color: "text-secondary",
            },
            {
              label: "Chuyên khoa",
              value: stats.totalSpecialties,
              icon: "category",
              color: "text-tertiary",
            },
            {
              label: "Tổng lịch hẹn",
              value: stats.totalAppointments,
              icon: "calendar_month",
              color: "text-green-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-xl shadow-indigo-500/5"
            >
              <span className={`material-symbols-outlined text-2xl ${stat.color} mb-2 block`}>
                {stat.icon}
              </span>
              <p className="text-2xl font-extrabold font-sans text-on-surface">{stat.value}</p>
              <p className="text-xs text-on-surface-variant font-sans mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/dashboard/admin/doctors"
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5 hover:bg-surface-container transition-colors flex items-start gap-4"
          >
            <span className="material-symbols-outlined text-3xl text-primary mt-0.5">
              pending_actions
            </span>
            <div>
              <h2 className="font-bold text-on-surface font-sans">Duyệt bác sĩ</h2>
              <p className="text-sm text-on-surface-variant font-sans mt-1">
                {stats.pendingDoctors > 0
                  ? `${stats.pendingDoctors} hồ sơ đang chờ xét duyệt`
                  : "Không có hồ sơ nào đang chờ"}
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard/admin/specialties"
            className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5 hover:bg-surface-container transition-colors flex items-start gap-4"
          >
            <span className="material-symbols-outlined text-3xl text-secondary mt-0.5">
              category
            </span>
            <div>
              <h2 className="font-bold text-on-surface font-sans">Quản lý chuyên khoa</h2>
              <p className="text-sm text-on-surface-variant font-sans mt-1">
                Thêm, sửa, xoá danh mục chuyên khoa
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
