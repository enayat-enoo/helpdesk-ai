import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // 👈 NEW
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
