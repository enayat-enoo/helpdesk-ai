import express from "express";
import Article from "../models/Article.js";
import { authMiddleware, roleGuard } from "../middleware/auth.js";
import { searchKB } from "../services/kbSearch.js";

const router = express.Router();

// public-ish search (requires auth)
router.get("/", authMiddleware, async (req, res) => {
  const q = req.query.query || "";
  try {
    const results = await searchKB(q, 50);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// admin CRUD
router.post("/", authMiddleware, roleGuard(["admin"]), async (req, res) => {
  const { title, body, tags, status } = req.body;
  const a = await Article.create({ title, body, tags, status: status || "draft" });
  res.json(a);
});

router.put("/:id", authMiddleware, roleGuard(["admin"]), async (req, res) => {
  const a = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(a);
});

router.delete("/:id", authMiddleware, roleGuard(["admin"]), async (req, res) => {
  await Article.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export default router;
