require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

/* ================= DB CONNECTION ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("DB Error:", err));

/* ================= SCHEMA ================= */
const configSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  isValid: { type: Boolean, default: true },
});

const Config = mongoose.model("Config", configSchema);

/* ================= INIT DB ================= */
// Auto-create default flag if not exists
const initDB = async () => {
  const exists = await Config.findOne({ key: "apiAllowed" });

  if (!exists) {
    await Config.create({
      key: "apiAllowed",
      isValid: true,
    });
    console.log("Default config created ✅");
  }
};

initDB();

/* ================= ROUTES ================= */

// ✅ GET API (frontend use)
app.get("/check", async (req, res) => {
  try {
    const data = await Config.findOne({ key: "apiAllowed" });

    res.json({
      success: true,
      isValid: data?.isValid || false,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// 🔁 UPDATE API (admin control)
app.post("/update", async (req, res) => {
  try {
    const { isValid } = req.body;

    const updated = await Config.findOneAndUpdate(
      { key: "apiAllowed" },
      { isValid },
      { new: true, upsert: true },
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ================= SERVER ================= */
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
