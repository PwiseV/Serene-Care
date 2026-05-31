import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Specialty from "@/models/Specialty";
import { logAudit } from "@/services/adminService";
import type { Session } from "next-auth";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function requireAdmin(): Promise<Session | NextResponse> {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return session;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const { name, icon, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const updated = await Specialty.findByIdAndUpdate(
      id,
      { $set: { name: name.trim(), slug: toSlug(name), icon: icon ?? "", description: description ?? "" } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Specialty not found" }, { status: 404 });
    }

    await logAudit({
      actorId: guard.user.id,
      actorName: guard.user.name ?? "Admin",
      action: "specialty.update",
      targetType: "Specialty",
      targetId: id,
      summary: `Cập nhật chuyên khoa "${updated.name}"`,
    });

    return NextResponse.json({ specialty: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    console.error("PUT /api/admin/specialties/[id] error:", error);
    if (msg.includes("duplicate key")) {
      return NextResponse.json({ error: "Specialty already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await Specialty.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ error: "Specialty not found" }, { status: 404 });
    }

    await logAudit({
      actorId: guard.user.id,
      actorName: guard.user.name ?? "Admin",
      action: "specialty.delete",
      targetType: "Specialty",
      targetId: id,
      summary: `Xoá chuyên khoa "${deleted.name}"`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/specialties/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
