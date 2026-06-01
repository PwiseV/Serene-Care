import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { completeBooking } from "@/services/bookingService";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const doctorNote = typeof body.doctorNote === "string" ? body.doctorNote : undefined;

    const appointment = await completeBooking(id, session.user.id, session.user.role, doctorNote);
    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/appointments/[id]/complete error:", error);

    if (message === "Appointment not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message === "Only confirmed appointments can be completed") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
