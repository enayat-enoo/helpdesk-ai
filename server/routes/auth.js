import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email exists" });
    const passwordHash = await User.hashPassword(password);
    const u = await User.create({ name, email, passwordHash, role: role || "user" });
    const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET || "change-me", { expiresIn: "7d" });
    res.json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });
    const u = await User.findOne({ email });
    if (!u) return res.status(401).json({ error: "Invalid" });
    const ok = await u.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid" });
    const token = jwt.sign({ id: u._id }, process.env.JWT_SECRET || "change-me", { expiresIn: "7d" });
    res.json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
