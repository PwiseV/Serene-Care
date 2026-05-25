import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getDoctorById } from "@/services/doctorService";
import BookingClient from "./BookingClient";

interface PageProps {
  searchParams: Promise<{ doctorId?: string }>;
}

export default async function NewAppointmentPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/appointments/new");
  }
  if (session.user.role !== "patient") {
    redirect("/dashboard");
  }

  const { doctorId } = await searchParams;
  if (!doctorId) notFound();

  const doctor = await getDoctorById(doctorId);
  if (!doctor) notFound();

  return (
    <main className="pt-24 pb-20 min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant font-sans">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href="/doctors" className="hover:text-primary transition-colors">Bác sĩ</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href={`/doctors/${doctorId}`} className="hover:text-primary transition-colors">
            Bs. {doctor.name}
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <Link href="/dashboard/patient" className="hover:text-primary transition-colors">Lịch khám của tôi</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-on-surface font-medium">Đặt lịch khám</span>
        </nav>

        <h1 className="text-3xl font-extrabold tracking-tight font-heading mb-2">
          Đặt lịch khám
        </h1>
        <p className="text-on-surface-variant font-sans text-sm mb-8">
          Chọn ngày và khung giờ phù hợp với bạn.
        </p>

        <BookingClient
          doctor={{
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.specialty.name,
            consultationFee: doctor.consultationFee,
          }}
        />
      </div>
    </main>
  );
}
