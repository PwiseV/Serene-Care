import { NextRequest, NextResponse } from "next/server";
import { getDoctors } from "@/services/doctorService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const specialtyId = searchParams.get("specialtyId") ?? undefined;
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "12")));

    const result = await getDoctors({ search, specialtyId, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/doctors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
