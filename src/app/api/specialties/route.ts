import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Specialty from "@/models/Specialty";

export async function GET() {
  try {
    await dbConnect();
    const specialties = await Specialty.find().sort({ name: 1 }).lean();
    return NextResponse.json({ specialties });
  } catch (error) {
    console.error("GET /api/specialties error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
