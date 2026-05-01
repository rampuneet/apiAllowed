import { connectDB } from "../lib/db";
import { Session, Config } from "../lib/models";

export default async function handler(req, res) {
  await connectDB();

  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ success: false });
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  const session = await Session.findOne({ token });

  if (!session) {
    return res.status(401).json({ success: false });
  }

  const data = await Config.findOne({
    client: session.client,
    username: session.username,
  });

  res.json({
    success: true,
    isValid: data?.isValid || false,
  });
}
