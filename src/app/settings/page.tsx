import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/settings");
  if (session.user.role !== "patient") redirect("/dashboard");

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-6">
        <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant font-sans">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href="/dashboard/patient" className="hover:text-primary transition-colors">Lịch khám của tôi</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-medium">Cài đặt tài khoản</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight font-heading mb-2">Cài đặt tài khoản</h1>
        <p className="text-on-surface-variant font-sans text-sm mb-8">
          Quản lý thông tin cá nhân và bảo mật.
        </p>

        <SettingsClient
          initialName={session.user.name ?? ""}
          email={session.user.email ?? ""}
        />
      </div>
    </main>
  );
}
