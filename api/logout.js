import { connectDB } from "../lib/db";
import { Session } from "../lib/models";

export default async function handler(req, res) {
  await connectDB();

  const token = req.headers.authorization;

  await Session.deleteOne({ token });

  res.json({ success: true });
}
