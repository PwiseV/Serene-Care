import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin/settings");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-on-surface">Cài đặt</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-sans">
          Chỉnh sửa thông tin cơ bản và xem lịch sử thay đổi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic info */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
          <h2 className="mb-4 font-bold font-heading text-on-surface">Thông tin cơ bản</h2>
          <dl className="space-y-3 text-sm font-sans">
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Họ tên</dt>
              <dd className="font-semibold text-on-surface">{session.user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Email</dt>
              <dd className="font-semibold text-on-surface">{session.user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Vai trò</dt>
              <dd className="font-semibold text-on-surface">Quản trị viên</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-xl bg-surface-container px-4 py-3 text-xs text-on-surface-variant font-sans">
            Biểu mẫu chỉnh sửa thông tin đang được phát triển.
          </p>
        </div>

        {/* Change history */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-xl shadow-indigo-500/5">
          <h2 className="mb-4 font-bold font-heading text-on-surface">Lịch sử thay đổi</h2>
          <div className="py-10 text-center">
            <span className="material-symbols-outlined mb-2 block text-5xl text-outline">
              history
            </span>
            <p className="text-sm text-on-surface-variant font-sans">
              Lịch sử thao tác quản trị sẽ hiển thị tại đây.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
