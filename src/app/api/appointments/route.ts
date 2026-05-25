import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { lockSlot } from "@/services/bookingService";
import dbConnect from "@/lib/mongoose";
import Appointment from "@/models/Appointment";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "patient") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { slotId, patientNote } = body;

    if (!slotId) {
      return NextResponse.json({ error: "slotId is required" }, { status: 400 });
    }

    await dbConnect();

    // Atomic lock — throws "Slot is not available" if taken
    const slot = await lockSlot(slotId, session.user.id);

    const appointment = await Appointment.create({
      patientId: session.user.id,
      doctorId: slot.doctorId,
      slotId: slot._id,
      status: "pending",
      paymentStatus: "unpaid",
      patientNote: patientNote ?? "",
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/appointments error:", error);

    if (message === "Slot is not available") {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
