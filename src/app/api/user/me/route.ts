import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body as {
      name?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update name
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Tên không được để trống" }, { status: 400 });
      }
      user.name = trimmed;
    }

    // Change password
    if (newPassword !== undefined) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Vui lòng nhập mật khẩu hiện tại" }, { status: 400 });
      }
      if (!user.password) {
        return NextResponse.json({ error: "Tài khoản không có mật khẩu (đăng nhập qua OAuth)" }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không đúng" }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    return NextResponse.json({ name: user.name });
  } catch (error) {
    console.error("PATCH /api/user/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
