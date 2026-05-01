import { connectDB } from "../lib/db";
import { User } from "../lib/models";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { client, username, password } = req.body;

    // ✅ 1. VALIDATION
    if (!client || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    // ✅ 2. CHECK DUPLICATE CLIENT (PUT HERE 👇)
    const existing = await User.findOne({ client });

    if (existing) {
      return res.json({
        success: false,
        message: "Client already exists",
      });
    }

    // ✅ 3. CREATE USER
    await User.create({
      client,
      username,
      password,
      isValid: false,
    });

    res.json({ success: true });
  } catch (err) {
    console.log("REGISTER ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
