import { Types } from "mongoose";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";
import Specialty from "@/models/Specialty";
import Appointment from "@/models/Appointment";
import type { AppointmentStatus } from "@/models/Appointment";

export interface PendingDoctor {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profile: {
    specialty: string;
    licenseNumber: string;
    experienceYears: number;
    consultationFee: number;
    bio: string;
  } | null;
}

export interface AdminStats {
  totalDoctors: number;
  pendingDoctors: number;
  totalPatients: number;
  totalSpecialties: number;
  totalAppointments: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  await dbConnect();
  const [totalDoctors, pendingDoctors, totalPatients, totalSpecialties, totalAppointments] =
    await Promise.all([
      User.countDocuments({ role: "doctor", isApproved: true }),
      User.countDocuments({ role: "doctor", isApproved: false }),
      User.countDocuments({ role: "patient" }),
      Specialty.countDocuments(),
      Appointment.countDocuments(),
    ]);
  return { totalDoctors, pendingDoctors, totalPatients, totalSpecialties, totalAppointments };
}

export async function getPendingDoctors(): Promise<PendingDoctor[]> {
  await dbConnect();
  const users = await User.find({ role: "doctor", isApproved: false })
    .sort({ createdAt: 1 })
    .lean();

  const userIds = users.map((u) => u._id);
  const profiles = await DoctorProfile.find({ userId: { $in: userIds } })
    .populate("specialtyId", "name")
    .lean();

  const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

  return users.map((u) => {
    const p = profileMap.get(u._id.toString());
    const specialty = p?.specialtyId as unknown as { name: string } | null;
    return {
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      profile: p
        ? {
            specialty: specialty?.name ?? "",
            licenseNumber: p.licenseNumber,
            experienceYears: p.experienceYears,
            consultationFee: p.consultationFee,
            bio: p.bio,
          }
        : null,
    };
  });
}

export async function setDoctorApproval(userId: string, approved: boolean): Promise<boolean> {
  await dbConnect();
  const result = await User.updateOne(
    { _id: userId, role: "doctor" },
    { $set: { isApproved: approved } }
  );
  return result.modifiedCount > 0;
}

/* -------------------------------------------------------------------------- */
/*  Overview (Tổng quan)                                                       */
/* -------------------------------------------------------------------------- */

export interface OverviewAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  status: AppointmentStatus;
  date: string | null; // ISO date of the slot
  startTime: string;
}

export interface OverviewTopDoctor {
  id: string;
  name: string;
  specialty: string;
  averageRating: number;
  totalReviews: number;
}

export interface WeeklyPoint {
  label: string; // T2..CN
  date: string; // yyyy-mm-dd
  count: number;
}

export interface AdminOverview {
  stats: {
    totalAppointments: number;
    activeDoctors: number;
    newPatients: number; // last 30 days
    revenue: number; // sum of consultationFee for completed appointments
  };
  recentAppointments: OverviewAppointment[];
  topDoctors: OverviewTopDoctor[];
  weeklyAppointments: WeeklyPoint[];
}

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await dbConnect();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // 7-day window (today inclusive, going back 6 days)
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
  const weekEnd = new Date(startOfDay(now).getTime() + 24 * 60 * 60 * 1000); // end of today

  const [
    totalAppointments,
    activeDoctors,
    newPatients,
    revenueAgg,
    recentDocs,
    topProfiles,
    weeklyAgg,
  ] = await Promise.all([
    Appointment.countDocuments(),
    User.countDocuments({ role: "doctor", isApproved: true }),
    User.countDocuments({ role: "patient", createdAt: { $gte: thirtyDaysAgo } }),
    Appointment.aggregate<{ total: number }>([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "doctorprofiles",
          localField: "doctorId",
          foreignField: "userId",
          as: "profile",
        },
      },
      { $unwind: "$profile" },
      { $group: { _id: null, total: { $sum: "$profile.consultationFee" } } },
    ]),
    Appointment.find()
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("slotId", "date startTime")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    getApprovedTopProfiles(4),
    Appointment.aggregate<{ _id: string; count: number }>([
      {
        $lookup: {
          from: "timeslots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      { $unwind: "$slot" },
      { $match: { "slot.date": { $gte: weekStart, $lt: weekEnd } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$slot.date" } },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Map specialty for recent appointments' doctors
  const doctorIds = recentDocs.map((a) => (a.doctorId as { _id: Types.ObjectId })._id);
  const profiles = await DoctorProfile.find({ userId: { $in: doctorIds } })
    .populate("specialtyId", "name")
    .lean();
  const specialtyByDoctor = new Map(
    profiles.map((p) => [
      p.userId.toString(),
      (p.specialtyId as unknown as { name: string } | null)?.name ?? "—",
    ])
  );

  const recentAppointments: OverviewAppointment[] = recentDocs.map((a) => {
    const patient = a.patientId as unknown as { _id: Types.ObjectId; name: string } | null;
    const doctor = a.doctorId as unknown as { _id: Types.ObjectId; name: string } | null;
    const slot = a.slotId as unknown as { date: Date; startTime: string } | null;
    return {
      id: a._id.toString(),
      patientName: patient?.name ?? "—",
      doctorName: doctor?.name ?? "—",
      specialty: doctor ? specialtyByDoctor.get(doctor._id.toString()) ?? "—" : "—",
      status: a.status,
      date: slot?.date ? slot.date.toISOString() : null,
      startTime: slot?.startTime ?? "",
    };
  });

  // Build the 7-day series with zero-filled days
  const countByDay = new Map(weeklyAgg.map((d) => [d._id, d.count]));
  const weeklyAppointments: WeeklyPoint[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
      day.getDate()
    ).padStart(2, "0")}`;
    return {
      label: WEEKDAY_LABELS[day.getDay()],
      date: key,
      count: countByDay.get(key) ?? 0,
    };
  });

  return {
    stats: {
      totalAppointments,
      activeDoctors,
      newPatients,
      revenue: revenueAgg[0]?.total ?? 0,
    },
    recentAppointments,
    topDoctors: topProfiles,
    weeklyAppointments,
  };
}

async function getApprovedTopProfiles(limit: number): Promise<OverviewTopDoctor[]> {
  const approved = await User.find({ role: "doctor", isApproved: true }).select("_id").lean();
  const approvedIds = approved.map((u) => u._id);

  const profiles = await DoctorProfile.find({ userId: { $in: approvedIds } })
    .populate("userId", "name")
    .populate("specialtyId", "name")
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit)
    .lean();

  return profiles.map((p) => {
    const user = p.userId as unknown as { _id: Types.ObjectId; name: string };
    const specialty = p.specialtyId as unknown as { name: string } | null;
    return {
      id: user._id.toString(),
      name: user.name,
      specialty: specialty?.name ?? "—",
      averageRating: p.averageRating,
      totalReviews: p.totalReviews,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Notifications (chuông thông báo)                                           */
/* -------------------------------------------------------------------------- */

export interface AdminNotifications {
  pendingDoctors: { id: string; name: string; createdAt: string }[];
  recentBookings: {
    id: string;
    patientName: string;
    doctorName: string;
    createdAt: string;
  }[];
  total: number;
}

export async function getAdminNotifications(): Promise<AdminNotifications> {
  await dbConnect();

  const [pending, bookings] = await Promise.all([
    User.find({ role: "doctor", isApproved: false })
      .select("name createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Appointment.find({ status: "pending" })
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const pendingDoctors = pending.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    createdAt: u.createdAt.toISOString(),
  }));

  const recentBookings = bookings.map((a) => {
    const patient = a.patientId as unknown as { name: string } | null;
    const doctor = a.doctorId as unknown as { name: string } | null;
    return {
      id: a._id.toString(),
      patientName: patient?.name ?? "—",
      doctorName: doctor?.name ?? "—",
      createdAt: a.createdAt.toISOString(),
    };
  });

  return {
    pendingDoctors,
    recentBookings,
    total: pendingDoctors.length + recentBookings.length,
  };
}

/* -------------------------------------------------------------------------- */
/*  Search (tìm bệnh nhân / bác sĩ)                                            */
/* -------------------------------------------------------------------------- */

export interface SearchResults {
  doctors: { id: string; name: string; email: string }[];
  patients: { id: string; name: string; email: string }[];
}

export async function searchUsers(query: string): Promise<SearchResults> {
  await dbConnect();

  const q = query.trim();
  if (!q) return { doctors: [], patients: [] };

  const regex = { $regex: q, $options: "i" };
  const filter = (role: string) => ({
    role,
    $or: [{ name: regex }, { email: regex }],
  });

  const [doctors, patients] = await Promise.all([
    User.find(filter("doctor")).select("name email").limit(5).lean(),
    User.find(filter("patient")).select("name email").limit(5).lean(),
  ]);

  const map = (list: typeof doctors) =>
    list.map((u) => ({ id: u._id.toString(), name: u.name, email: u.email }));

  return { doctors: map(doctors), patients: map(patients) };
}
