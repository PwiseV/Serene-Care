import dbConnect from "@/lib/mongoose";
import Appointment from "@/models/Appointment";
import TimeSlot, { ITimeSlot } from "@/models/TimeSlot";

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
