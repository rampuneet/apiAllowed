import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  client: { type: String, unique: true },
  username: String,
  password: String,
  isValid: { type: Boolean, default: false },
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
