import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createRecord, getRecords } from "@/services/healthRecordService";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const records = await getRecords(session.user.id);
    return NextResponse.json({ records });
  } catch (error) {
    console.error("GET /api/health-records error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const formData = await req.formData();
    const title = (formData.get("title") as string | null)?.trim();
    const file = formData.get("file") as File | null;

    if (!title || !file) {
      return NextResponse.json({ error: "title and file are required" }, { status: 400 });
    }

    // Validate size before reading the entire buffer
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must not exceed 5 MB" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const record = await createRecord(
      session.user.id,
      title,
      buffer,
      file.name,
      file.type,
      file.size
    );

    return NextResponse.json({ record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/health-records error:", error);

    if (message === "File size exceeds 5 MB limit") {
      return NextResponse.json({ error: message }, { status: 413 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
