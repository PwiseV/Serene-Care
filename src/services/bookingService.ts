import dbConnect from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import type { AppointmentStatus, PaymentStatus } from "@/models/Appointment";
import TimeSlot, { ITimeSlot } from "@/models/TimeSlot";

export interface AppointmentItem {
  id: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  patientNote: string;
  doctorNote: string;
  createdAt: string;
  slot: { date: string; startTime: string; endTime: string } | null;
  doctor: { id: string; name: string };
  patient: { id: string; name: string };
}

export async function getAppointments(
  userId: string,
  role: "patient" | "doctor" | "admin"
): Promise<AppointmentItem[]> {
  await dbConnect();

  const query = role === "patient" ? { patientId: userId } : { doctorId: userId };

  const appointments = await Appointment.find(query)
    .populate("slotId", "date startTime endTime")
    .populate("patientId", "name")
    .populate("doctorId", "name")
    .sort({ createdAt: -1 })
    .lean();

  return appointments.map((apt) => {
    const slot = apt.slotId as unknown as { date: Date; startTime: string; endTime: string } | null;
    const doctor = apt.doctorId as unknown as { _id: { toString(): string }; name: string };
    const patient = apt.patientId as unknown as { _id: { toString(): string }; name: string };

    return {
      id: apt._id.toString(),
      status: apt.status,
      paymentStatus: apt.paymentStatus,
      patientNote: apt.patientNote,
      doctorNote: apt.doctorNote,
      createdAt: apt.createdAt.toISOString(),
      slot: slot
        ? { date: slot.date.toISOString(), startTime: slot.startTime, endTime: slot.endTime }
        : null,
      doctor: { id: doctor._id.toString(), name: doctor.name },
      patient: { id: patient._id.toString(), name: patient.name },
    };
  });
}

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Atomically lock a slot for a patient.
 * Throws "Slot is not available" if the slot is booked or currently locked.
 */
export async function lockSlot(
  slotId: string,
  patientId: string
): Promise<ITimeSlot> {
  await dbConnect();

  const slot = await TimeSlot.findOneAndUpdate(
    {
      _id: slotId,
      isBooked: false,
      $or: [{ lockedUntil: null }, { lockedUntil: { $lt: new Date() } }],
    },
    {
      $set: {
        lockedUntil: new Date(Date.now() + LOCK_DURATION_MS),
        lockedBy: patientId,
      },
    },
    { new: true }
  );

  if (!slot) throw new Error("Slot is not available");
  return slot;
}

/**
 * Confirm a pending appointment.
 * Marks the slot as permanently booked and clears the lock.
 * Only the doctor who owns the appointment (or admin) may confirm.
 */
export async function confirmBooking(
  appointmentId: string,
  actorId: string,
  actorRole: string
) {
  await dbConnect();

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  if (actorRole !== "admin") {
    if (
      actorRole !== "doctor" ||
      appointment.doctorId.toString() !== actorId
    ) {
      throw new Error("Forbidden");
    }
  }

  if (appointment.status !== "pending") {
    throw new Error("Only pending appointments can be confirmed");
  }

  await TimeSlot.findByIdAndUpdate(appointment.slotId, {
    $set: { isBooked: true, lockedUntil: null, lockedBy: null },
  });

  appointment.status = "confirmed";
  await appointment.save();
  return appointment;
}

/**
 * Mark a confirmed appointment as completed and optionally store the doctor's note.
 * Only the owning doctor (or admin) may complete. The slot stays booked.
 */
export async function completeBooking(
  appointmentId: string,
  actorId: string,
  actorRole: string,
  doctorNote?: string
) {
  await dbConnect();

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  if (actorRole !== "admin") {
    if (actorRole !== "doctor" || appointment.doctorId.toString() !== actorId) {
      throw new Error("Forbidden");
    }
  }

  if (appointment.status !== "confirmed") {
    throw new Error("Only confirmed appointments can be completed");
  }

  appointment.status = "completed";
  if (typeof doctorNote === "string") appointment.doctorNote = doctorNote.trim();
  await appointment.save();
  return appointment;
}

/**
 * Cancel an appointment and release the slot.
 * Patient (own), doctor (own), or admin may cancel.
 * Completed appointments cannot be cancelled.
 */
export async function cancelBooking(
  appointmentId: string,
  actorId: string,
  actorRole: string
) {
  await dbConnect();

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  if (actorRole !== "admin") {
    const isOwningPatient =
      actorRole === "patient" && appointment.patientId.toString() === actorId;
    const isOwningDoctor =
      actorRole === "doctor" && appointment.doctorId.toString() === actorId;
    if (!isOwningPatient && !isOwningDoctor) throw new Error("Forbidden");
  }

  if (appointment.status === "completed") {
    throw new Error("Completed appointments cannot be cancelled");
  }

  if (appointment.status === "cancelled") return appointment;

  await TimeSlot.findByIdAndUpdate(appointment.slotId, {
    $set: { isBooked: false, lockedUntil: null, lockedBy: null },
  });

  appointment.status = "cancelled";
  await appointment.save();
  return appointment;
}
