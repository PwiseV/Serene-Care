import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateSlots } from "@/services/slotService";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required (ISO strings)" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const result = await generateSlots(session.user.id, start, end);

    return NextResponse.json({
      message: `Generated ${result.created} slots (${result.skipped} already existed)`,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/doctors/slots/generate error:", error);

    const clientErrors = [
      "endDate must be >= startDate",
      "Date range exceeds maximum",
      "Doctor profile not found",
      "Doctor has no working hours configured",
    ];
    if (clientErrors.some((e) => message.startsWith(e))) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
