import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchUsers } from "@/services/adminService";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const q = req.nextUrl.searchParams.get("q") ?? "";
    const results = await searchUsers(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/admin/search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
