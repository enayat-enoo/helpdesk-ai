import { v4 as uuidv4 } from "uuid";
import AgentSuggestion from "../models/AgentSuggestion.js";
import AuditLog from "../models/AuditLog.js";
import Ticket from "../models/Ticket.js";
import Config from "../models/Config.js";
import * as stub from "../utils/stubLLM.js";
import { searchKB } from "./kbSearch.js";

async function getConfig() {
  let cfg = await Config.findOne();
  if (!cfg) cfg = await Config.create({});
  return cfg;
}

export async function runTriage(ticketId) {
  const traceId = uuidv4();
  const ticket = await Ticket.findById(ticketId).populate("createdBy");
  if (!ticket) throw new Error("Ticket not found");

  await AuditLog.create({ ticketId, traceId, actor: "system", action: "TICKET_TRIAGE_STARTED", meta: {} });

  // classify
  const { predictedCategory, confidence } = stub.classify(ticket.title + " " + ticket.description);
  await AuditLog.create({ ticketId, traceId, actor: "system", action: "AGENT_CLASSIFIED", meta: { predictedCategory, confidence } });

  // retrieve KB
  const kbResults = await searchKB(ticket.title + " " + ticket.description, 3);
  await AuditLog.create({ ticketId, traceId, actor: "system", action: "KB_RETRIEVED", meta: { count: kbResults.length, ids: kbResults.map(a=>a._id) } });

  // draft reply
  const { draftReply, citations } = stub.draftReply(ticket, kbResults);
  await AuditLog.create({ ticketId, traceId, actor: "system", action: "DRAFT_GENERATED", meta: { citations } });

  // decision
  const cfg = await getConfig();
  const envAuto = process.env.AUTO_CLOSE_ENABLED;
  const autoCloseEnabled = (envAuto === undefined ? cfg.autoCloseEnabled : (envAuto === "true"));
  const envThreshold = process.env.CONFIDENCE_THRESHOLD;
  const threshold = (envThreshold === undefined ? cfg.confidenceThreshold : parseFloat(envThreshold));
  const autoClosed = (autoCloseEnabled && confidence >= threshold);

  const suggestion = await AgentSuggestion.create({
    ticketId,
    predictedCategory,
    articleIds: kbResults.map(a=>a._id.toString()),
    draftReply,
    confidence,
    autoClosed,
    modelInfo: { provider: process.env.STUB_MODE === "true" ? "STUB" : "OPENAI", model: "stub-v1", promptVersion: "v1", latencyMs: 0 }
  });

  ticket.agentSuggestionId = suggestion._id;
  ticket.updatedAt = new Date();
  if (autoClosed) {
    ticket.status = "resolved";
    await AuditLog.create({ ticketId, traceId, actor: "system", action: "AUTO_CLOSED", meta: { suggestionId: suggestion._id } });
  } else {
    ticket.status = "waiting_human";
    await AuditLog.create({ ticketId, traceId, actor: "system", action: "ASSIGNED_TO_HUMAN", meta: { suggestionId: suggestion._id } });
  }

  await ticket.save();
  return { traceId, suggestion, ticket };
}
