import express from "express";
import Config from "../models/Config.js";
import { authMiddleware, roleGuard } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, roleGuard(["admin"]), async (req, res) => {
  let cfg = await Config.findOne();
  if (!cfg) cfg = await Config.create({});
  res.json(cfg);
});

router.put("/", authMiddleware, roleGuard(["admin"]), async (req, res) => {
  let cfg = await Config.findOne();
  if (!cfg) cfg = await Config.create(req.body);
  else {
    cfg.autoCloseEnabled = !!req.body.autoCloseEnabled;
    cfg.confidenceThreshold = Number(req.body.confidenceThreshold);
    cfg.slaHours = Number(req.body.slaHours || cfg.slaHours);
    await cfg.save();
  }
  res.json(cfg);
});

export default router;
