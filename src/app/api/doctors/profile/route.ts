import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { upsertDoctorProfile, getMyProfile } from "@/services/doctorService";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "doctor") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const profile = await getMyProfile(session.user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET /api/doctors/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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
    const { specialtyId, licenseNumber, consultationFee } = body;

    if (!specialtyId || !licenseNumber || consultationFee === undefined) {
      return NextResponse.json(
        { error: "specialtyId, licenseNumber and consultationFee are required" },
        { status: 400 }
      );
    }

    const profile = await upsertDoctorProfile(session.user.id, body);

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/doctors/profile error:", error);

    if (message.includes("duplicate key") || message.includes("licenseNumber")) {
      return NextResponse.json({ error: "License number already in use" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
