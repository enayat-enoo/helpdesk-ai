import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import   userRoutes  from './routes/user.js'

dotenv.config();
const app = express();

import authRoutes from "./routes/auth.js";
import kbRoutes from "./routes/kb.js";
import ticketRoutes from "./routes/tickets.js";
import agentRoutes from "./routes/agent.js";
import configRoutes from "./routes/config.js";
import auditRoutes from "./routes/audit.js";

app.use(express.json({ limit: "2mb" }));
app.use(cors());
app.use(morgan("dev"));

// API
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/kb", kbRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/config", configRoutes);
app.use("/api/audit", auditRoutes);

// health checks
app.get("/healthz", (_, res) => res.json({ status: "ok" }));
app.get("/readyz", (_, res) => res.json({ ready: true }));

const PORT = process.env.PORT || 8080;
const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/helpdesk";

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("Mongo connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  });

export default app;
