import { Types } from "mongoose";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";
import Specialty from "@/models/Specialty";
import Appointment from "@/models/Appointment";
import type { AppointmentStatus } from "@/models/Appointment";
import AuditLog from "@/models/AuditLog";

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function todayRange(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

/** Short, human-friendly code derived from a Mongo ObjectId (last 4 hex chars). */
function shortCode(prefix: string, id: string): string {
  return `#${prefix}-${id.slice(-4).toUpperCase()}`;
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

/* -------------------------------------------------------------------------- */
/*  Audit log (lịch sử thay đổi)                                               */
/* -------------------------------------------------------------------------- */

export interface AuditEntry {
  actorId: string;
  actorName: string;
  action: string;
  summary: string;
  targetType?: string;
  targetId?: string;
}

/** Records an admin action. Never throws — audit failures must not break the primary mutation. */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await dbConnect();
    await AuditLog.create({
      actorId: entry.actorId,
      actorName: entry.actorName,
      action: entry.action,
      summary: entry.summary,
      targetType: entry.targetType ?? "",
      targetId: entry.targetId ?? "",
    });
  } catch (error) {
    console.error("logAudit error:", error);
  }
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  action: string;
  summary: string;
  createdAt: string;
}

export async function getAuditLogs(limit = 20): Promise<AuditLogItem[]> {
  await dbConnect();
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  return logs.map((l) => ({
    id: l._id.toString(),
    actorName: l.actorName,
    action: l.action,
    summary: l.summary,
    createdAt: l.createdAt.toISOString(),
  }));
}

/* -------------------------------------------------------------------------- */
/*  Quản lý lịch hẹn                                                           */
/* -------------------------------------------------------------------------- */

export interface AdminAppointmentRow {
  id: string;
  code: string;
  patientName: string;
  doctorName: string;
  date: string | null;
  startTime: string;
  status: AppointmentStatus;
}

export interface AdminAppointmentsResult {
  rows: AdminAppointmentRow[];
  total: number;
  page: number;
  totalPages: number;
  stats: { today: number; pending: number; confirmed: number; cancelled: number };
}

export async function getAdminAppointments(filters: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<AdminAppointmentsResult> {
  await dbConnect();

  const limit = filters.limit ?? 10;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * limit;

  const status =
    filters.status && APPOINTMENT_STATUSES.includes(filters.status as AppointmentStatus)
      ? (filters.status as AppointmentStatus)
      : undefined;
  const query = status ? { status } : {};

  const { start, end } = todayRange();

  const [docs, total, pending, confirmed, cancelled, todayAgg] = await Promise.all([
    Appointment.find(query)
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .populate("slotId", "date startTime")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Appointment.countDocuments(query),
    Appointment.countDocuments({ status: "pending" }),
    Appointment.countDocuments({ status: "confirmed" }),
    Appointment.countDocuments({ status: "cancelled" }),
    Appointment.aggregate<{ count: number }>([
      {
        $lookup: {
          from: "timeslots",
          localField: "slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      { $unwind: "$slot" },
      { $match: { "slot.date": { $gte: start, $lt: end } } },
      { $count: "count" },
    ]),
  ]);

  const rows: AdminAppointmentRow[] = docs.map((a) => {
    const patient = a.patientId as unknown as { name: string } | null;
    const doctor = a.doctorId as unknown as { name: string } | null;
    const slot = a.slotId as unknown as { date: Date; startTime: string } | null;
    return {
      id: a._id.toString(),
      code: shortCode("APT", a._id.toString()),
      patientName: patient?.name ?? "—",
      doctorName: doctor?.name ?? "—",
      date: slot?.date ? slot.date.toISOString() : null,
      startTime: slot?.startTime ?? "",
      status: a.status,
    };
  });

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    stats: { today: todayAgg[0]?.count ?? 0, pending, confirmed, cancelled },
  };
}

/* -------------------------------------------------------------------------- */
/*  Quản lý bác sĩ                                                             */
/* -------------------------------------------------------------------------- */

export interface AdminDoctorRow {
  id: string;
  code: string;
  name: string;
  email: string;
  specialty: string;
  isApproved: boolean;
}

export interface AdminDoctorsResult {
  rows: AdminDoctorRow[];
  total: number;
  page: number;
  totalPages: number;
  stats: { total: number; approved: number; pending: number; specialties: number };
}

export async function getAdminDoctors(filters: {
  status?: "approved" | "pending";
  q?: string;
  page?: number;
  limit?: number;
}): Promise<AdminDoctorsResult> {
  await dbConnect();

  const limit = filters.limit ?? 10;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { role: "doctor" };
  if (filters.status === "approved") query.isApproved = true;
  if (filters.status === "pending") query.isApproved = false;
  if (filters.q?.trim()) {
    const regex = { $regex: filters.q.trim(), $options: "i" };
    query.$or = [{ name: regex }, { email: regex }];
  }

  const [users, total, totalDoctors, approved, totalSpecialties] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
    User.countDocuments({ role: "doctor" }),
    User.countDocuments({ role: "doctor", isApproved: true }),
    Specialty.countDocuments(),
  ]);

  const userIds = users.map((u) => u._id);
  const profiles = await DoctorProfile.find({ userId: { $in: userIds } })
    .populate("specialtyId", "name")
    .lean();
  const specialtyByDoctor = new Map(
    profiles.map((p) => [
      p.userId.toString(),
      (p.specialtyId as unknown as { name: string } | null)?.name ?? "—",
    ])
  );

  const rows: AdminDoctorRow[] = users.map((u) => ({
    id: u._id.toString(),
    code: shortCode("DR", u._id.toString()),
    name: u.name,
    email: u.email,
    specialty: specialtyByDoctor.get(u._id.toString()) ?? "Chưa cập nhật",
    isApproved: u.isApproved,
  }));

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    stats: {
      total: totalDoctors,
      approved,
      pending: totalDoctors - approved,
      specialties: totalSpecialties,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Quản lý bệnh nhân                                                          */
/* -------------------------------------------------------------------------- */

export interface AdminPatientRow {
  id: string;
  code: string;
  name: string;
  email: string;
  createdAt: string;
  lastVisit: { date: string; doctorName: string } | null;
}

export interface AdminPatientsResult {
  rows: AdminPatientRow[];
  total: number;
  page: number;
  totalPages: number;
  stats: { total: number; newToday: number };
}

export async function getAdminPatients(filters: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<AdminPatientsResult> {
  await dbConnect();

  const limit = filters.limit ?? 10;
  const page = Math.max(1, filters.page ?? 1);
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { role: "patient" };
  if (filters.q?.trim()) {
    const regex = { $regex: filters.q.trim(), $options: "i" };
    query.$or = [{ name: regex }, { email: regex }];
  }

  const { start } = todayRange();

  const [users, total, newToday] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
    User.countDocuments({ role: "patient", createdAt: { $gte: start } }),
  ]);

  // Resolve the most recent visit (slot date + doctor) for the patients on this page
  const patientIds = users.map((u) => u._id);
  const lastVisits = await Appointment.aggregate<{
    _id: Types.ObjectId;
    date: Date;
    doctorName: string;
  }>([
    { $match: { patientId: { $in: patientIds } } },
    {
      $lookup: { from: "timeslots", localField: "slotId", foreignField: "_id", as: "slot" },
    },
    { $unwind: "$slot" },
    { $sort: { "slot.date": -1 } },
    {
      $group: {
        _id: "$patientId",
        date: { $first: "$slot.date" },
        doctorId: { $first: "$doctorId" },
      },
    },
    { $lookup: { from: "users", localField: "doctorId", foreignField: "_id", as: "doctor" } },
    { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
    { $project: { date: 1, doctorName: "$doctor.name" } },
  ]);
  const lastVisitByPatient = new Map(
    lastVisits.map((v) => [v._id.toString(), { date: v.date, doctorName: v.doctorName ?? "—" }])
  );

  const rows: AdminPatientRow[] = users.map((u) => {
    const visit = lastVisitByPatient.get(u._id.toString());
    return {
      id: u._id.toString(),
      code: shortCode("PT", u._id.toString()),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      lastVisit: visit ? { date: visit.date.toISOString(), doctorName: visit.doctorName } : null,
    };
  });

  return {
    rows,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    stats: { total, newToday },
  };
}
