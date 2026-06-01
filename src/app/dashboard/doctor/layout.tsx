import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDoctorNotifications } from "@/services/doctorService";
import DoctorSidebar from "@/components/doctor/DoctorSidebar";
import DoctorTopbar from "@/components/doctor/DoctorTopbar";

export default async function DoctorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/doctor");
  if (session.user.role !== "doctor") redirect("/");

  const notifications = await getDoctorNotifications(session.user.id);

  return (
    <div className="min-h-screen bg-surface-container-low">
      <DoctorSidebar />
      <div className="pl-64">
        <DoctorTopbar
          doctor={{
            name: session.user.name ?? "Bác sĩ",
            avatar: session.user.image ?? "",
          }}
          initialNotifications={notifications}
        />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
