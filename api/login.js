import { connectDB } from "../lib/db";
import { User, Session } from "../lib/models";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    await connectDB();

    const { client, username, password } = req.body;

    if (!client || !username || !password) {
      return res.status(400).json({ success: false });
    }

    const user = await User.findOne({
      client: client.trim(),
      username: username.trim(),
      password: password.trim(),
    });

    if (!user) {
      return res.status(401).json({ success: false });
    }

    const token = jwt.sign(
      { client: user.client, username: user.username },
      process.env.SECRET_KEY,
    );

    await Session.findOneAndUpdate(
      { client: user.client, username: user.username },
      { token },
      { upsert: true },
    );

    res.json({ success: true, token });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ success: false });
  }
}
