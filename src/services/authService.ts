import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User, { IUser } from "@/models/User";

export async function registerUser(data: Partial<IUser>): Promise<IUser> {
  await dbConnect();

  const { email, password, name, role } = data;

  if (!email || !password || !name) {
    throw new Error("Missing required fields");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Default to patient if role is invalid or not provided
  const validRole = role === "doctor" ? "doctor" : "patient";

  const newUser = await User.create({
    email,
    name,
    password: hashedPassword,
    role: validRole,
    // isApproved defaults defined in User Schema: true for patient, false for doctor
  });

  return newUser;
}
