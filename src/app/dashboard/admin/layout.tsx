import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAdminNotifications } from "@/services/adminService";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin");
  if (session.user.role !== "admin") redirect("/");

  const notifications = await getAdminNotifications();

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminSidebar />
      <div className="pl-64">
        <AdminTopbar
          admin={{
            name: session.user.name ?? "Admin",
            avatar: session.user.image ?? "",
          }}
          initialNotifications={notifications}
        />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
