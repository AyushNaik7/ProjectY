import { describe, expect, it } from "vitest";
import {
  computeHybridScore,
  scoreBudget,
  scoreEngagement,
} from "@/lib/scoring";
import { semanticScoreFromSimilarity } from "@/lib/embedding-utils";
import type { CreatorData, CampaignData } from "@/lib/server-matching";

const baseCreator: CreatorData = {
  niche: "Tech & Gadgets",
  followers: 100000,
  avgViews: 25000,
  engagementRate: 3.5,
  minRatePrivate: 20000,
  verified: false,
};

const baseCampaign: CampaignData = {
  niche: "Tech & Gadgets",
  budget: 50000,
};

describe("scoring", () => {
  it("scores engagement consistently", () => {
    const result = scoreEngagement(baseCreator);
    expect(result.score).toBeGreaterThan(0.5);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("scores budget fit", () => {
    const result = scoreBudget(baseCreator, baseCampaign);
    expect(result.score).toBeGreaterThan(0.5);
  });

  it("computes hybrid score and reasons", () => {
    const result = computeHybridScore(0.78, baseCreator, baseCampaign);
    expect(result.score).toBeGreaterThan(0);
    expect(result.semanticScore).toBe(78);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("wraps embedding similarity into score", () => {
    expect(semanticScoreFromSimilarity(1)).toBe(100);
    expect(semanticScoreFromSimilarity(0.5)).toBe(50);
    expect(semanticScoreFromSimilarity(-1)).toBe(0);
  });
});
