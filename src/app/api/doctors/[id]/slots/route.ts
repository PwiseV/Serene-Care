import { NextRequest, NextResponse } from "next/server";
import { getSlotsByDate } from "@/services/slotService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dateParam = req.nextUrl.searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Query param 'date' is required (YYYY-MM-DD)" },
        { status: 400 }
      );
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
