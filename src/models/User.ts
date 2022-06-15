import mongoose from "mongoose";

/** User TS interface represent User document */
interface IUser {
  full_name: string;
  phone: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
}

/** Define User schema */
const userSchema = new mongoose.Schema<IUser>({
  full_name: {
    type: String,
    required: true,
  },
  /** @ts-ignore */
  phone: {
    type: String,
    required: [true, "Phone number is required!"],
    unique: [true, "Phone number has already been used!"],
    match: [/0[35789]\d{8}/, "Invalid phone number!"],
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
});

const User = mongoose.model("User", userSchema);

export default User;
