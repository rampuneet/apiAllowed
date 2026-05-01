import { connectDB } from "../../lib/db";
import { User } from "../../lib/models";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { client } = req.query;

    if (!client) {
      return res.status(400).json({
        success: false,
        message: "Client missing",
      });
    }

    const user = await User.findOne({ client: client.trim() });

    return res.json({
      success: true,
      isValid: user?.isValid || false,
    });
  } catch (err) {
    console.log("VALIDATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
