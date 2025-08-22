import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  traceId: String,
  actor: { type: String, enum: ["system","agent","user"], default: "system" },
  action: String,
  meta: Object,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditSchema);
