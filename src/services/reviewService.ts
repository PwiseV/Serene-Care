import { Types } from "mongoose";
import dbConnect from "@/lib/mongoose";
import Review from "@/models/Review";
import DoctorProfile from "@/models/DoctorProfile";
import Appointment from "@/models/Appointment";

export interface ReviewItem {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewPayload {
  appointmentId: string;
  rating: number;
  comment?: string;
}

/** Re-compute and persist averageRating + totalReviews on DoctorProfile. */
async function updateAggregates(doctorId: string) {
  const agg = await Review.aggregate([
    { $match: { doctorId: new Types.ObjectId(doctorId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = agg[0] ?? {};
  await DoctorProfile.findOneAndUpdate(
    { userId: doctorId },
    { $set: { averageRating: Math.round(avg * 10) / 10, totalReviews: count } }
  );
}

export async function createReview(
  patientId: string,
  payload: CreateReviewPayload
): Promise<ReviewItem> {
  await dbConnect();

  const { appointmentId, rating, comment = "" } = payload;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5");
  }

  // Validate appointment ownership + completion
  const appointment = await Appointment.findById(appointmentId).lean();
  if (!appointment) throw new Error("Appointment not found");
  if (appointment.patientId.toString() !== patientId) throw new Error("Forbidden");
  if (appointment.status !== "completed") throw new Error("Can only review completed appointments");

  const doctorId = appointment.doctorId.toString();

  const review = await Review.create({
    patientId,
    doctorId,
    appointmentId,
    rating,
    comment: comment.trim(),
  });

  // Best-effort aggregation — don't block on failure
  await updateAggregates(doctorId).catch(console.error);

  return {
    id: review._id.toString(),
    patientName: "",
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}

export async function getReviewsByDoctor(
  doctorId: string,
  page = 1,
  limit = 10
): Promise<{ reviews: ReviewItem[]; total: number }> {
  await dbConnect();

  const filter = { doctorId: new Types.ObjectId(doctorId) };
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Review.find(filter)
      .populate("patientId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  const reviews: ReviewItem[] = docs.map((r) => {
    const patient = r.patientId as unknown as { name: string };
    return {
      id: r._id.toString(),
      patientName: patient?.name ?? "Ẩn danh",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    };
  });

  return { reviews, total };
}

/** Returns appointment IDs that the patient has already reviewed. */
export async function getReviewedAppointmentIds(patientId: string): Promise<Set<string>> {
  await dbConnect();
  const reviews = await Review.find({ patientId }).select("appointmentId").lean();
  return new Set(reviews.map((r) => r.appointmentId.toString()));
}
