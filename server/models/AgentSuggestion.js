import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  predictedCategory: String,
  articleIds: [String],
  draftReply: String,
  confidence: Number,
  autoClosed: Boolean,
  modelInfo: {
    provider: String,
    model: String,
    promptVersion: String,
    latencyMs: Number
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.AgentSuggestion || mongoose.model("AgentSuggestion", suggestionSchema);
