import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminAppointmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin/appointments");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold font-heading text-on-surface">Quản lý lịch hẹn</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-sans">
          Theo dõi và quản lý toàn bộ lịch hẹn trong hệ thống.
        </p>
      </div>
      <div className="rounded-2xl bg-surface-container-lowest p-16 text-center shadow-xl shadow-indigo-500/5">
        <span className="material-symbols-outlined mb-3 block text-6xl text-outline">
          calendar_month
        </span>
        <p className="font-sans text-on-surface-variant">Tính năng đang được phát triển.</p>
      </div>
    </div>
  );
}
