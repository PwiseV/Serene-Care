import dbConnect from "@/lib/mongoose";
import DoctorProfile, { IDoctorProfile } from "@/models/DoctorProfile";
import Review from "@/models/Review";
import User from "@/models/User";

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
