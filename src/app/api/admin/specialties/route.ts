import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Specialty from "@/models/Specialty";

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

async function requireAdmin(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await dbConnect();
    const specialties = await Specialty.find().sort({ name: 1 }).lean();
    return NextResponse.json({ specialties });
  } catch (error) {
    console.error("GET /api/admin/specialties error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (guard) return guard;

  try {
    await dbConnect();
    const body = await req.json();
    const { name, icon, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const slug = toSlug(name);
    const specialty = await Specialty.create({
      name: name.trim(),
      slug,
      icon: icon ?? "",
      description: description ?? "",
    });

    return NextResponse.json({ specialty }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    console.error("POST /api/admin/specialties error:", error);
    if (msg.includes("duplicate key") || msg.includes("slug") || msg.includes("name")) {
      return NextResponse.json({ error: "Specialty already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
