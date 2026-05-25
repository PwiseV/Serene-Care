import mongoose, { Document, Model, Schema, Types } from "mongoose";

interface IEducation {
  degree: string;
  institution: string;
  year: number;
}

interface IWorkingHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  slotDurationMinutes: number;
}

export interface IDoctorProfile extends Document {
  userId: Types.ObjectId;
  specialtyId: Types.ObjectId;
  bio: string;
  experienceYears: number;
  licenseNumber: string;
  education: IEducation[];
  consultationFee: number;
  workingHours: IWorkingHours[];
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
  },
  { _id: false }
);

const WorkingHoursSchema = new Schema<IWorkingHours>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, required: true, default: 30 },
  },
  { _id: false }
);

const DoctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialtyId: {
      type: Schema.Types.ObjectId,
      ref: "Specialty",
      required: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      trim: true,
    },
    education: {
      type: [EducationSchema],
      default: [],
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: 0,
    },
    workingHours: {
      type: [WorkingHoursSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const DoctorProfile: Model<IDoctorProfile> =
  mongoose.models.DoctorProfile ||
  mongoose.model<IDoctorProfile>("DoctorProfile", DoctorProfileSchema);

export default DoctorProfile;
