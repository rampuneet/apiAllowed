import { connectDB } from "../lib/db";
import { Session, Config } from "../lib/models";

export default async function handler(req, res) {
  await connectDB();

  const token = req.headers.authorization;

  const session = await Session.findOne({ token });

  if (!session) {
    return res.status(401).json({ success: false });
  }

  const { isValid } = req.body;

  await Config.findOneAndUpdate(
    { client: session.client, username: session.username },
    { isValid },
    { upsert: true },
  );

  res.json({ success: true });
}
