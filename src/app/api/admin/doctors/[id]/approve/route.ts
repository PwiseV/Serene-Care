import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { setDoctorApproval, logAudit } from "@/services/adminService";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { approved } = body;

    if (typeof approved !== "boolean") {
      return NextResponse.json({ error: "approved (boolean) is required" }, { status: 400 });
    }

    const modified = await setDoctorApproval(id, approved);
    if (!modified) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    await logAudit({
      actorId: session.user.id,
      actorName: session.user.name ?? "Admin",
      action: approved ? "doctor.approve" : "doctor.reject",
      targetType: "Doctor",
      targetId: id,
      summary: approved ? "Duyệt hồ sơ bác sĩ" : "Từ chối hồ sơ bác sĩ",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/admin/doctors/[id]/approve error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
