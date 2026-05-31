import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getPendingDoctors } from "@/services/adminService";
import ApproveButton from "./ApproveButton";

export default async function AdminDoctorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/admin/doctors");
  if (session.user.role !== "admin") redirect("/");

  const doctors = await getPendingDoctors();

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold font-heading">Duyệt hồ sơ bác sĩ</h1>
            <p className="text-on-surface-variant font-sans text-sm mt-0.5">
              {doctors.length} hồ sơ đang chờ xét duyệt
            </p>
          </div>
          <Link
            href="/dashboard/admin/specialties"
            className="flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-sm font-semibold font-sans text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">category</span>
            Quản lý chuyên khoa
          </Link>
        </div>

        {doctors.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-16 text-center shadow-xl shadow-indigo-500/5">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">
              check_circle
            </span>
            <p className="text-on-surface-variant font-sans">Không có hồ sơ nào đang chờ duyệt.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl shadow-indigo-500/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-on-surface-variant text-lg">
                        person
                      </span>
                      <h3 className="font-bold text-on-surface font-sans">Bs. {doc.name}</h3>
                    </div>

                    <p className="text-sm text-on-surface-variant font-sans mb-3">{doc.email}</p>

                    {doc.profile ? (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm font-sans">
                        {doc.profile.specialty && (
                          <div>
                            <span className="text-on-surface-variant">Chuyên khoa: </span>
                            <span className="font-medium text-on-surface">{doc.profile.specialty}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-on-surface-variant">CCHN: </span>
                          <span className="font-medium text-on-surface">{doc.profile.licenseNumber}</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Kinh nghiệm: </span>
                          <span className="font-medium text-on-surface">{doc.profile.experienceYears} năm</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant">Phí khám: </span>
                          <span className="font-medium text-on-surface">
                            {doc.profile.consultationFee.toLocaleString("vi-VN")}k
                          </span>
                        </div>
                        {doc.profile.bio && (
                          <div className="col-span-2 mt-1">
                            <span className="text-on-surface-variant">Giới thiệu: </span>
                            <span className="text-on-surface italic">{doc.profile.bio}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-amber-600 font-sans italic">
                        Chưa cập nhật hồ sơ chi tiết
                      </p>
                    )}

                    <p className="text-xs text-on-surface-variant font-sans mt-3">
                      Đăng ký:{" "}
                      {new Date(doc.createdAt).toLocaleDateString("vi-VN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <ApproveButton doctorId={doc.id} />
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
