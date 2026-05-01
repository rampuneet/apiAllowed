import mongoose from "mongoose";

/* Config */
const configSchema = new mongoose.Schema({
  client: String,
  username: String,
  isValid: { type: Boolean, default: false },
});
configSchema.index({ client: 1, username: 1 }, { unique: true });

/* User */
const userSchema = new mongoose.Schema({
  client: String,
  username: String,
  password: String,
});
userSchema.index({ client: 1, username: 1 }, { unique: true });

/* Session */
const sessionSchema = new mongoose.Schema({
  client: String,
  username: String,
  token: String,
});

export const Config =
  mongoose.models.Config || mongoose.model("Config", configSchema);

export const User = mongoose.models.User || mongoose.model("User", userSchema);

export const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
