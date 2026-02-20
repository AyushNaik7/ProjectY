const EMBEDDING_COST_PER_1K_TOKENS_USD = 0.0001;

export function estimateEmbeddingCost(tokens: number) {
  if (!Number.isFinite(tokens) || tokens <= 0) return 0;
  const cost = (tokens / 1000) * EMBEDDING_COST_PER_1K_TOKENS_USD;
  return Number(cost.toFixed(6));
}

export function semanticScoreFromSimilarity(similarity: number) {
  if (!Number.isFinite(similarity)) return 0;
  const clamped = Math.min(1, Math.max(0, similarity));
  return Math.round(clamped * 100);
}
