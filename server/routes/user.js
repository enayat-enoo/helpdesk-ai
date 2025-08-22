import express from "express";
import User from "../models/User.js";
import {authMiddleware} from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all users (optionally filter by role)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can view users" });
    }

    const { role } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query).select("_id email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
