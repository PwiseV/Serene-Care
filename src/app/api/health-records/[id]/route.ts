import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteRecord } from "@/services/healthRecordService";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "patient") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await deleteRecord(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("DELETE /api/health-records/[id] error:", error);

    if (message === "Record not found") return NextResponse.json({ error: message }, { status: 404 });
    if (message === "Forbidden") return NextResponse.json({ error: message }, { status: 403 });

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
