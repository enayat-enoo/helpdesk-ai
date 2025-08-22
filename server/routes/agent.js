import express from "express";
import { authMiddleware, roleGuard } from "../middleware/auth.js";
import { runTriage } from "../services/agentWorkflow.js";

const router = express.Router();

router.post("/triage", authMiddleware, roleGuard(["admin","agent"]), async (req, res) => {
  try {
    const { ticketId } = req.body;
    const out = await runTriage(ticketId);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
