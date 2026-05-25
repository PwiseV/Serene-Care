import { NextRequest, NextResponse } from "next/server";
import { getReviewsByDoctor } from "@/services/reviewService";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

    const { reviews, total } = await getReviewsByDoctor(id, page, limit);
    return NextResponse.json({ reviews, total, page, limit });
  } catch (error) {
    console.error("GET /api/doctors/[id]/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
