import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: String,
  body: String,
  tags: [String],
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Article || mongoose.model("Article", articleSchema);
