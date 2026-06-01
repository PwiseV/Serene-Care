import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDoctorNotifications } from "@/services/doctorService";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const notifications = await getDoctorNotifications(session.user.id);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET /api/doctor/notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
