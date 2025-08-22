import express from "express";
import Ticket from "../models/Ticket.js";
import AgentSuggestion from "../models/AgentSuggestion.js";
import AuditLog from "../models/AuditLog.js";
import { authMiddleware, roleGuard } from "../middleware/auth.js";
import { runTriage } from "../services/agentWorkflow.js";

const router = express.Router();

// ✅ Assign a ticket to an agent (Admin only)
router.put("/:id/assign", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can assign tickets" });
    }

    const { agentId } = req.body;
    if (!agentId) return res.status(400).json({ error: "agentId required" });

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: agentId },
      { new: true }
    ).populate("assignedTo", "email role");

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/assigned/me", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ error: "Only agents can view this" });
    }

    const tickets = await Ticket.find({ assignedTo: req.user.id });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update ticket status (agent only)
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ error: "Only agents can update status" });
    }

    const { status } = req.body;
    if (!["open", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user.id }, // 👈 ensure agent only updates their own tickets
      { status },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ error: "Ticket not found or not assigned to you" });

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign ticket to an agent (Admin only)
router.put("/:id/assign", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can assign tickets" });
    }

    const { agentId } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: agentId },
      { new: true }
    ).populate("assignedTo", "email role");

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tickets assigned to logged-in agent
router.get("/assigned/me", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "agent") {
      return res.status(403).json({ error: "Only agents can view this" });
    }

    const tickets = await Ticket.find({ assignedTo: req.user.id });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create ticket (user)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const ticket = await Ticket.create({ title, description, category, createdBy: req.user._id });
    await AuditLog.create({ ticketId: ticket._id, traceId: ticket._id.toString(), actor: "user", action: "TICKET_CREATED", meta: { user: req.user._id } });
    // start triage asynchronously (but persist suggestion)
    runTriage(ticket._id).catch(err => console.error("triage error:", err));
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// list tickets - admin sees all, user sees only their own, agent sees waiting_human
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, mine } = req.query;
    let q = {};
    if (req.user.role === "admin") {
      // admins can filter
      if (status) q.status = status;
    } else if (req.user.role === "agent") {
      if (status) q.status = status;
      else q.status = "waiting_human";
    } else {
      // normal user
      q.createdBy = req.user._id;
      if (status) q.status = status;
    }
    const tickets = await Ticket.find(q).populate("createdBy").sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get ticket detail (including suggestion + audit)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("createdBy");
    if (!ticket) return res.status(404).json({ error: "Not found" });
    const suggestion = ticket.agentSuggestionId ? await AgentSuggestion.findById(ticket.agentSuggestionId) : null;
    const audit = await AuditLog.find({ ticketId: ticket._id }).sort({ timestamp: 1 });
    res.json({ ticket, suggestion, audit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// agent accepts/edits draft and sends reply
router.post("/:id/reply", authMiddleware, roleGuard(["agent","admin"]), async (req, res) => {
  try {
    const { message, close } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Not found" });
    await AuditLog.create({ ticketId: ticket._id, traceId: ticket._id.toString(), actor: "agent", action: "REPLY_SENT", meta: { message } });
    if (close) {
      ticket.status = "resolved";
      await AuditLog.create({ ticketId: ticket._id, traceId: ticket._id.toString(), actor: "agent", action: "MANUAL_CLOSED", meta: {} });
    } else {
      ticket.status = "triaged";
    }
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// admin/agent assign
router.post("/:id/assign", authMiddleware, roleGuard(["admin","agent"]), async (req, res) => {
  try {
    const { assigneeId } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { assignee: assigneeId }, { new: true });
    await AuditLog.create({ ticketId: ticket._id, traceId: ticket._id.toString(), actor: "system", action: "ASSIGNED_TO_USER", meta: { assigneeId } });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
