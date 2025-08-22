import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No auth header" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change-me");
    // attach user (minimal)
    req.user = await User.findById(payload.id).select("-passwordHash");
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function roleGuard(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No user" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
