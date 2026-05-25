import { NextRequest, NextResponse } from "next/server";
import { getSlotsByDate, getAvailableDates } from "@/services/slotService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dateParam = req.nextUrl.searchParams.get("date");

    // No date param → return list of dates that have available slots (next 30 days)
    if (!dateParam) {
      const dates = await getAvailableDates(id, 30);
      return NextResponse.json({ dates });
    }

    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const slots = await getSlotsByDate(id, date);
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("GET /api/doctors/[id]/slots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
