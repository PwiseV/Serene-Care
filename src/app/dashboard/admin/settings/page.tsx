import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAuditLogs } from "@/services/adminService";
import AdminProfileForm from "./AdminProfileForm";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin/settings");
  if (session.user.role !== "admin") redirect("/");

  const logs = await getAuditLogs(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-on-surface">Cài đặt</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-sans">
          Chỉnh sửa thông tin cơ bản và xem lịch sử thay đổi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic info + edit */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
          <h2 className="mb-4 font-bold font-heading text-on-surface">Thông tin cơ bản</h2>
          <div className="mb-5 rounded-xl bg-surface-container px-4 py-3 text-sm font-sans">
            <div className="flex justify-between gap-4">
              <span className="text-on-surface-variant">Email</span>
              <span className="font-semibold text-on-surface">{session.user.email}</span>
            </div>
            <div className="mt-1.5 flex justify-between gap-4">
              <span className="text-on-surface-variant">Vai trò</span>
              <span className="font-semibold text-on-surface">Quản trị viên</span>
            </div>
          </div>
          <AdminProfileForm initialName={session.user.name ?? ""} />
        </div>

        {/* Change history */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
          <h2 className="mb-4 font-bold font-heading text-on-surface">Lịch sử thay đổi</h2>
          {logs.length === 0 ? (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined mb-2 block text-5xl text-outline">
                history
              </span>
              <p className="text-sm text-on-surface-variant font-sans">
                Chưa có thao tác nào được ghi nhận.
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined mt-0.5 text-[20px] text-primary">
                    {iconForAction(log.action)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-sans text-on-surface">{log.summary}</p>
                    <p className="text-xs text-on-surface-variant font-sans">
                      {log.actorName} · {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function iconForAction(action: string): string {
  if (action.startsWith("doctor")) return "stethoscope";
  if (action.startsWith("specialty")) return "category";
  if (action.startsWith("profile")) return "manage_accounts";
  return "history";
}
