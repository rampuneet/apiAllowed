import { connectDB } from "../lib/db";
import { User } from "../lib/models";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    await connectDB();

    const { client, username, password } = req.body;

    if (!client || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const user = await User.findOne({
      client: client.trim(),
      username: username.trim(),
    });

    if (!user || user.password !== password.trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    res.json({
      success: true,
      user: {
        client: user.client,
        username: user.username,
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
