import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
  },
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
