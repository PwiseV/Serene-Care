import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createReview } from "@/services/reviewService";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "patient") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { appointmentId, rating, comment } = body;

    if (!appointmentId || rating === undefined) {
      return NextResponse.json(
        { error: "appointmentId and rating are required" },
        { status: 400 }
      );
    }

    const review = await createReview(session.user.id, { appointmentId, rating, comment });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("POST /api/reviews error:", error);

    if (message === "Forbidden") return NextResponse.json({ error: message }, { status: 403 });
    if (message === "Appointment not found") return NextResponse.json({ error: message }, { status: 404 });
    if (message === "Can only review completed appointments") {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    if (message.includes("duplicate key") || message.includes("appointmentId")) {
      return NextResponse.json({ error: "Already reviewed this appointment" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
