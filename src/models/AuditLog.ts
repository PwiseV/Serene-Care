import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAuditLog extends Document {
  actorId: Types.ObjectId;
  actorName: string;
  action: string; // machine key, e.g. "doctor.approve"
  targetType: string; // e.g. "Doctor", "Specialty", "Profile"
  targetId: string;
  summary: string; // human-readable Vietnamese description
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, default: "" },
    targetId: { type: String, default: "" },
    summary: { type: String, required: true },
  },
  { timestamps: true }
);

// Newest-first listing is the dominant read pattern
AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
