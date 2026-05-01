import { connectDB } from "../lib/db";
import { User, Config, Session } from "../lib/models";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { client, username, password } = req.body;

    if (!client || !username || !password) {
      return res.json({ success: false });
    }

    const existing = await User.findOne({ client, username });

    if (existing) {
      return res.json({ success: false, message: "User exists" });
    }

    await User.create({ client, username, password });

    await Config.create({
      client,
      username,
      isValid: false,
    });

    const token = crypto.randomBytes(24).toString("hex");

    await Session.create({ client, username, token });

    res.json({ success: true, token });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ success: false });
  }
}
