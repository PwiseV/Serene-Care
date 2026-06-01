import { Types, type PipelineStage } from "mongoose";
import dbConnect from "@/lib/mongoose";
import DoctorProfile, { IDoctorProfile } from "@/models/DoctorProfile";
import Review from "@/models/Review";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import type { AppointmentStatus } from "@/models/Appointment";

export interface DoctorListItem {
  id: string;
  name: string;
  avatar: string;
  specialty: { id: string; name: string; slug: string };
  bio: string;
  experienceYears: number;
  consultationFee: number;
  averageRating: number;
  totalReviews: number;
}

export interface DoctorDetail extends DoctorListItem {
  licenseNumber: string;
  education: { degree: string; institution: string; year: number }[];
  workingHours: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  }[];
  reviews: {
    id: string;
    patientName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
}

export interface DoctorFilters {
  search?: string;
  specialtyId?: string;
  page?: number;
  limit?: number;
}

export async function getDoctors(
  filters: DoctorFilters = {}
): Promise<{ doctors: DoctorListItem[]; total: number }> {
  await dbConnect();

  const { search, specialtyId, page = 1, limit = 12 } = filters;
  const skip = (page - 1) * limit;

  // Find approved doctor user IDs matching search
  const userQuery: Record<string, unknown> = {
    role: "doctor",
    isApproved: true,
  };
  if (search) {
    userQuery.name = { $regex: search, $options: "i" };
  }

  const approvedUsers = await User.find(userQuery).select("_id").lean();
  const approvedUserIds = approvedUsers.map((u) => u._id);

  const profileQuery: Record<string, unknown> = {
    userId: { $in: approvedUserIds },
  };
  if (specialtyId) {
    profileQuery.specialtyId = specialtyId;
  }

  const [profiles, total] = await Promise.all([
    DoctorProfile.find(profileQuery)
      .populate("userId", "name avatar")
      .populate("specialtyId", "name slug")
      .skip(skip)
      .limit(limit)
      .lean(),
    DoctorProfile.countDocuments(profileQuery),
  ]);

  const doctors: DoctorListItem[] = profiles.map((p) => {
    const user = p.userId as unknown as { _id: string; name: string; avatar: string };
    const specialty = p.specialtyId as unknown as { _id: string; name: string; slug: string };
    return {
      id: user._id.toString(),
      name: user.name,
      avatar: user.avatar,
      specialty: { id: specialty._id.toString(), name: specialty.name, slug: specialty.slug },
      bio: p.bio,
      experienceYears: p.experienceYears,
      consultationFee: p.consultationFee,
      averageRating: p.averageRating,
      totalReviews: p.totalReviews,
    };
  });

  return { doctors, total };
}

export async function getDoctorById(userId: string): Promise<DoctorDetail | null> {
  await dbConnect();

  const [profile, user] = await Promise.all([
    DoctorProfile.findOne({ userId })
      .populate("specialtyId", "name slug")
      .lean(),
    User.findById(userId).select("name avatar isApproved role").lean(),
  ]);

  if (!profile || !user || user.role !== "doctor" || !user.isApproved) return null;

  const specialty = profile.specialtyId as unknown as { _id: string; name: string; slug: string };

  const reviewDocs = await Review.find({ doctorId: userId })
    .populate("patientId", "name avatar")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const reviews = reviewDocs.map((r) => {
    const patient = r.patientId as unknown as { name: string };
    return {
      id: r._id.toString(),
      patientName: patient.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    };
  });

  return {
    id: userId,
    name: user.name,
    avatar: user.avatar ?? "",
    specialty: { id: specialty._id.toString(), name: specialty.name, slug: specialty.slug },
    bio: profile.bio,
    experienceYears: profile.experienceYears,
    consultationFee: profile.consultationFee,
    averageRating: profile.averageRating,
    totalReviews: profile.totalReviews,
    licenseNumber: profile.licenseNumber,
    education: profile.education,
    workingHours: profile.workingHours,
    reviews,
  };
}

export interface MyProfile {
  specialtyId: string;
  bio: string;
  experienceYears: number;
  licenseNumber: string;
  consultationFee: number;
  education: { degree: string; institution: string; year: number }[];
  workingHours: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  }[];
  averageRating: number;
  totalReviews: number;
}

export async function getMyProfile(userId: string): Promise<MyProfile | null> {
  await dbConnect();
  const profile = await DoctorProfile.findOne({ userId }).lean();
  if (!profile) return null;
  return {
    specialtyId: profile.specialtyId.toString(),
    bio: profile.bio,
    experienceYears: profile.experienceYears,
    licenseNumber: profile.licenseNumber,
    consultationFee: profile.consultationFee,
    education: profile.education,
    workingHours: profile.workingHours,
    averageRating: profile.averageRating,
    totalReviews: profile.totalReviews,
  };
}

export interface UpsertProfilePayload {
  specialtyId: string;
  bio?: string;
  experienceYears?: number;
  licenseNumber: string;
  education?: { degree: string; institution: string; year: number }[];
  consultationFee: number;
  workingHours?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
  }[];
}

export async function upsertDoctorProfile(
  userId: string,
  data: UpsertProfilePayload
): Promise<IDoctorProfile> {
  await dbConnect();

  const profile = await DoctorProfile.findOneAndUpdate(
    { userId },
    { $set: { userId, ...data } },
    { new: true, upsert: true, runValidators: true }
  );

  return profile;
}

/* -------------------------------------------------------------------------- */
/*  Doctor workspace: notifications + patients                                 */
/* -------------------------------------------------------------------------- */

export interface DoctorNotification {
  id: string;
  patientName: string;
  date: string | null;
  startTime: string;
  createdAt: string;
}

/** Pending appointments (new bookings) awaiting this doctor's confirmation. */
export async function getDoctorNotifications(
  doctorId: string
): Promise<{ items: DoctorNotification[]; total: number }> {
  await dbConnect();

  const docs = await Appointment.find({ doctorId, status: "pending" })
    .populate("patientId", "name")
    .populate("slotId", "date startTime")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const items = docs.map((a) => {
    const patient = a.patientId as unknown as { name: string } | null;
    const slot = a.slotId as unknown as { date: Date; startTime: string } | null;
    return {
      id: a._id.toString(),
      patientName: patient?.name ?? "—",
      date: slot?.date ? slot.date.toISOString() : null,
      startTime: slot?.startTime ?? "",
      createdAt: a.createdAt.toISOString(),
    };
  });

  return { items, total: items.length };
}

export interface DoctorPatientRow {
  id: string;
  name: string;
  email: string;
  visitCount: number;
  lastVisit: string | null;
  lastStatus: AppointmentStatus | null;
}

export interface DoctorPatientsResult {
  rows: DoctorPatientRow[];
  total: number;
  page: number;
  totalPages: number;
}

/** Distinct patients who have booked this doctor, with visit count + last visit. */
export async function getDoctorPatients(
  doctorId: string,
  filters: { q?: string; page?: number; limit?: number } = {}
): Promise<DoctorPatientsResult> {
  await dbConnect();

  const limit = filters.limit ?? 10;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * limit;

  const pipeline: PipelineStage[] = [
    { $match: { doctorId: new Types.ObjectId(doctorId) } },
    { $lookup: { from: "timeslots", localField: "slotId", foreignField: "_id", as: "slot" } },
    { $unwind: { path: "$slot", preserveNullAndEmptyArrays: true } },
    { $sort: { "slot.date": -1 } },
    {
      $group: {
        _id: "$patientId",
        visitCount: { $sum: 1 },
        lastVisit: { $first: "$slot.date" },
        lastStatus: { $first: "$status" },
      },
    },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "patient" } },
    { $unwind: "$patient" },
  ];

  if (filters.q?.trim()) {
    const regex = { $regex: filters.q.trim(), $options: "i" };
    pipeline.push({ $match: { $or: [{ "patient.name": regex }, { "patient.email": regex }] } });
  }

  pipeline.push({ $sort: { lastVisit: -1 } });
  pipeline.push({
    $facet: {
      rows: [{ $skip: skip }, { $limit: limit }],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await Appointment.aggregate(pipeline);
  const rawRows = (result?.rows ?? []) as Array<{
    _id: Types.ObjectId;
    visitCount: number;
    lastVisit?: Date;
    lastStatus?: AppointmentStatus;
    patient: { name: string; email: string };
  }>;
  const total = (result?.total?.[0]?.count ?? 0) as number;

  const rows: DoctorPatientRow[] = rawRows.map((r) => ({
    id: r._id.toString(),
    name: r.patient.name,
    email: r.patient.email,
    visitCount: r.visitCount,
    lastVisit: r.lastVisit ? new Date(r.lastVisit).toISOString() : null,
    lastStatus: r.lastStatus ?? null,
  }));

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
