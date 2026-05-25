import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { cancelBooking } from "@/services/bookingService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const appointment = await cancelBooking(id, session.user.id, session.user.role);

    return NextResponse.json({ appointment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/appointments/[id]/cancel error:", error);

    if (message === "Appointment not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    if (message === "Completed appointments cannot be cancelled") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
