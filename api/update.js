import { connectDB } from "../lib/db";
import { User } from "../lib/models";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { client, isValid } = req.body;

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Client required",
      });
    }

    await User.findOneAndUpdate({ client: client.trim() }, { isValid });

    return res.json({ success: true });
  } catch (err) {
    console.log("UPDATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
