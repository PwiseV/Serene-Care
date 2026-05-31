import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Central redirect hub — middleware sends logged-in users here from /login
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "admin") redirect("/dashboard/admin");
  if (session.user.role === "doctor") redirect("/dashboard/doctor");
  redirect("/dashboard/patient");
}
