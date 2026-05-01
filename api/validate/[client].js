import { connectDB } from "../../lib/db";
import { Config } from "../../lib/models";

export default async function handler(req, res) {
  try {
    await connectDB();

    const { client } = req.query;

    const data = await Config.findOne({ client });

    res.json({
      success: true,
      isValid: data?.isValid || false,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
}
