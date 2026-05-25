import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IHealthRecord extends Document {
  patientId: Types.ObjectId;
  title: string;
  fileUrl: string;
  filePublicId: string; // Cloudinary public_id for deletion
  fileType: string;     // MIME type e.g. "image/jpeg", "application/pdf"
  fileSize: number;     // bytes
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const HealthRecordSchema = new Schema<IHealthRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filePublicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      max: [MAX_FILE_SIZE, "File size must not exceed 5 MB"],
    },
    uploadedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

const HealthRecord: Model<IHealthRecord> =
  mongoose.models.HealthRecord ||
  mongoose.model<IHealthRecord>("HealthRecord", HealthRecordSchema);

export default HealthRecord;
