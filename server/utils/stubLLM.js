export function classify(text) {
  const t = (text || "").toLowerCase();
  let predictedCategory = "other";
  let confidence = 0.5;

  if (/\b(refund|invoice|charge|billing)\b/.test(t)) {
    predictedCategory = "billing"; confidence = 0.9;
  } else if (/\b(error|bug|stack|exception|crash|500)\b/.test(t)) {
    predictedCategory = "tech"; confidence = 0.85;
  } else if (/\b(delivery|shipment|package|tracking|courier)\b/.test(t)) {
    predictedCategory = "shipping"; confidence = 0.88;
  }

  // pseudo-randomize small amount based on length
  confidence = Math.min(0.99, confidence + Math.min(0.05, (t.length % 5) * 0.01));
  return { predictedCategory, confidence };
}

export function draftReply(ticket, articles) {
  const header = `Hi — we reviewed your ticket: "${ticket.title}".\n\n`;
  const body = articles.length ? 
    ("Please see the following KB articles that may help:\n" +
     articles.map((a, i) => `${i+1}. ${a.title}`).join("\n\n"))
    : "We couldn't find a relevant KB article to resolve this. We'll escalate to a human.";
  const footer = `\n\nIf this doesn't solve it, reply and we'll have an agent help you.\n\n— Support Bot`;
  return { draftReply: header + body + footer, citations: articles.map(a => a._id?.toString?.() || a._id) };
}
