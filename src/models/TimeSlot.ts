import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITimeSlot extends Document {
  doctorId: Types.ObjectId;
  date: Date;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isBooked: boolean;
  lockedUntil: Date | null;
  lockedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
      index: true,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate slots for the same doctor at the same date+time
TimeSlotSchema.index({ doctorId: 1, date: 1, startTime: 1 }, { unique: true });

// TTL index: MongoDB auto-expires the lock field — handled in queries, not via TTL
// Lock release is handled atomically in bookingService via $or condition on lockedUntil

const TimeSlot: Model<ITimeSlot> =
  mongoose.models.TimeSlot ||
  mongoose.model<ITimeSlot>("TimeSlot", TimeSlotSchema);

export default TimeSlot;
