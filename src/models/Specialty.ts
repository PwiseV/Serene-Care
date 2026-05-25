import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISpecialty extends Document {
  name: string;
  slug: string;
  icon: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialtySchema = new Schema<ISpecialty>(
  {
    name: {
      type: String,
      required: [true, "Specialty name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Specialty: Model<ISpecialty> =
  mongoose.models.Specialty ||
  mongoose.model<ISpecialty>("Specialty", SpecialtySchema);

export default Specialty;
