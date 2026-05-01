require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

/* ================= DB CONNECTION ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("DB Error:", err));

/* ================= SCHEMA ================= */

// Config per user
const configSchema = new mongoose.Schema({
  client: { type: String, required: true },
  username: { type: String, required: true },
  isValid: { type: Boolean, default: false },
});

configSchema.index({ client: 1, username: 1 }, { unique: true });
const Config = mongoose.model("Config", configSchema);


//User schema
const userSchema = new mongoose.Schema({
  client: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

userSchema.index({ client: 1, username: 1 }, { unique: true });
const User = mongoose.model("User", userSchema);


//Session schema
const sessionSchema = new mongoose.Schema({
  client: String,
  username: String,
  token: String,
});

const Session = mongoose.model("Session", sessionSchema);

/* ================= ROUTES ================= */



// ✅ CHECK API (per user)
app.get("/check", async (req, res) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  // ✅ handle Bearer automatically
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  const session = await Session.findOne({ token });

  if (!session) {
    return res.status(401).json({ success: false, message: "Invalid session" });
  }

  const data = await Config.findOne({
    client: session.client,
    username: session.username,
  });

  res.json({
    success: true,
    isValid: data?.isValid || false,
  });
});

// 🔁 UPDATE API (per user)
app.post("/update", async (req, res) => {
  const token = req.headers["authorization"];

  const session = await Session.findOne({ token });

  if (!session) {
    return res.status(401).json({ success: false });
  }

  const { isValid } = req.body;

  await Config.findOneAndUpdate(
    { client: session.client, 
      username: session.username,
    },
    { isValid },
    { upsert: true },
  );

  res.json({ success: true });
});

// 🔁 Login (per user)
const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {
  try {
    const { client, username, password } = req.body;

    // ✅ 1. Validate input
    if (!client || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ 2. STRICT match (client + username + password)
    const user = await User.findOne({
      client: client.trim(),
      username: username.trim(),
      password: password.trim(),
    });

    // ❌ If not found → reject
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid client / username / password",
      });
    }

    // ✅ 3. Generate token
    const token = require("jsonwebtoken").sign(
      { client: user.client, username: user.username },
      process.env.SECRET_KEY,
    );

    // ✅ 4. Save session
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
});

// 🔁 Logout (per user)
app.post("/logout", async (req, res) => {
  const token = req.headers["authorization"];

  await Session.deleteOne({ token });

  res.json({ success: true });
});

// 🔁 Logout (per user)
app.post("/register", async (req, res) => {
  try {
    const { client, username, password } = req.body;

    if (!client || !username || !password) {
      return res.json({ success: false, message: "Missing fields" });
    }

    // ❌ prevent duplicate user
    const existing = await User.findOne({ client, username });

    if (existing) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    // ✅ create user
    await User.create({ client, username, password });

    // ✅ create config default
    await Config.create({
      client,
      username,
      isValid: false,
    });

    // ✅ auto login (generate token)
    const token = require("crypto").randomBytes(24).toString("hex");

    await Session.create({
      client,
      username,
      token,
    });

    res.json({ success: true, token });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ success: false });
  }
});


// 🧪 HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

module.exports = app;
