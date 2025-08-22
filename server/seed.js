import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./models/User.js";
import Article from "./models/Article.js";
import Ticket from "./models/Ticket.js";
import Config from "./models/Config.js";

async function run() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/helpdesk");
  console.log("connected");

  await User.deleteMany({});
  await Article.deleteMany({});
  await Ticket.deleteMany({});
  await Config.deleteMany({});

  const admin = await User.create({ name: "Admin", email: "admin@example.com", passwordHash: await User.hashPassword("adminpass"), role: "admin" });
  const agent = await User.create({ name: "Agent", email: "agent@example.com", passwordHash: await User.hashPassword("agentpass"), role: "agent" });
  const user = await User.create({ name: "User", email: "user@example.com", passwordHash: await User.hashPassword("userpass"), role: "user" });

  await Article.create([
    { title: "How to update payment method", body: "Steps to update your card on profile > payments", tags: ["billing","payments"], status: "published" },
    { title: "Troubleshooting 500 errors", body: "If you see a 500 error, clear cookies or retry later.", tags: ["tech","errors"], status: "published" },
    { title: "Tracking your shipment", body: "Use this guide to track shipments using tracking ID.", tags: ["shipping","delivery"], status: "published" }
  ]);

  await Ticket.create([
    { title: "Refund for double charge", description: "I was charged twice for order #1234", category: "billing", createdBy: user._id },
    { title: "App shows 500 on login", description: "Stack trace mentions auth module", category: "tech", createdBy: user._id },
    { title: "Where is my package?", description: "Shipment delayed 5 days", category: "shipping", createdBy: user._id }
  ]);

  await Config.create({ autoCloseEnabled: true, confidenceThreshold: 0.78, slaHours: 24 });

  console.log("seeded");
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
