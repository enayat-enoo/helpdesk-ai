import Article from "../models/Article.js";

export async function searchKB(query, limit = 3) {
  if (!query) return await Article.find({ status: "published" }).limit(limit);
  // create regex from keywords
  const tokens = query.split(/\s+/).filter(Boolean).map(t => t.replace(/[^\w]/g, ""));
  const regex = new RegExp(tokens.join("|"), "i");
  const results = await Article.find({ status: "published", $or: [{ title: regex }, { body: regex }, { tags: regex }] }).limit(50);
  // naive scoring: count matches in title/body
  const scored = results.map(r => {
    let score = 0;
    const text = (r.title + " " + r.body).toLowerCase();
    tokens.forEach(tok => { if (text.includes(tok.toLowerCase())) score += 1; });
    return { article: r, score };
  }).sort((a,b) => b.score - a.score).slice(0, limit).map(s=>s.article);
  return scored;
}
