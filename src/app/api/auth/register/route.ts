import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/authService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const user = await registerUser(body);

    return NextResponse.json(
      { message: "User registered successfully", user: { id: user._id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "Email is already registered" || error.message === "Missing required fields") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
