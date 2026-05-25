import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import DoctorProfile from "@/models/DoctorProfile";
import Specialty from "@/models/Specialty";
import Appointment from "@/models/Appointment";

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
