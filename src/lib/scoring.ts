import {
  NICHE_GROUPS,
  type CreatorData,
  type CampaignData,
} from "@/lib/server-matching";
import { semanticScoreFromSimilarity } from "@/lib/embedding-utils";

export const HYBRID_WEIGHTS = {
  semantic: 0.4,
  engagement: 0.2,
  budget: 0.25,
  niche: 0.15,
};

export function scoreEngagement(creator: CreatorData) {
  const reasons: string[] = [];
  let engagementScore = 0;

  if (creator.engagementRate >= 5) {
    engagementScore = 1.0;
    reasons.push("Exceptional engagement rate");
  } else if (creator.engagementRate >= 3) {
    engagementScore = 0.75;
    reasons.push("Strong engagement rate");
  } else if (creator.engagementRate >= 1.5) {
    engagementScore = 0.5;
    reasons.push("Good engagement rate");
  } else if (creator.engagementRate >= 0.5) {
    engagementScore = 0.25;
    reasons.push("Average engagement rate");
  }

  const viewRatio = creator.avgViews / Math.max(creator.followers, 1);
  if (viewRatio >= 0.3) {
    engagementScore = Math.min(1, engagementScore + 0.15);
    reasons.push("Highly active audience");
  } else if (viewRatio >= 0.15) {
    engagementScore = Math.min(1, engagementScore + 0.08);
    reasons.push("Active audience");
  }

  return { score: engagementScore, reasons };
}

export function scoreBudget(creator: CreatorData, campaign: CampaignData) {
  const reasons: string[] = [];
  let budgetScore = 0;

  if (creator.minRatePrivate <= campaign.budget) {
    const ratio = creator.minRatePrivate / Math.max(campaign.budget, 1);
    if (ratio >= 0.3 && ratio <= 0.8) {
      budgetScore = 1.0;
      reasons.push("Excellent budget fit");
    } else if (ratio < 0.3) {
      budgetScore = 0.6;
      reasons.push("Under budget");
    } else {
      budgetScore = 0.8;
      reasons.push("Budget compatible");
    }
  } else {
    const overRatio = creator.minRatePrivate / Math.max(campaign.budget, 1);
    if (overRatio <= 1.2) {
      budgetScore = 0.2;
      reasons.push("Slightly over budget");
    }
  }

  return { score: budgetScore, reasons };
}

export function scoreNiche(creator: CreatorData, campaign: CampaignData) {
  const reasons: string[] = [];
  let nicheScore = 0;

  if (campaign.niche === "Any" || creator.niche === campaign.niche) {
    nicheScore = 1.0;
    reasons.push("Perfect niche match");
  } else {
    const related = NICHE_GROUPS[campaign.niche] || [];
    if (related.includes(creator.niche)) {
      nicheScore = 0.5;
      reasons.push("Related niche");
    }
  }

  return { score: nicheScore, reasons };
}

export function computeHybridScore(
  semanticSimilarity: number,
  creator: CreatorData,
  campaign: CampaignData
) {
  const reasons: string[] = [];
  const semanticScore = semanticScoreFromSimilarity(semanticSimilarity);

  if (semanticScore >= 80) reasons.push("Highly relevant profile match");
  else if (semanticScore >= 60) reasons.push("Strong profile relevance");
  else if (semanticScore >= 40) reasons.push("Moderate profile relevance");

  const engagement = scoreEngagement(creator);
  const budget = scoreBudget(creator, campaign);
  const niche = scoreNiche(creator, campaign);

  reasons.push(...engagement.reasons, ...budget.reasons, ...niche.reasons);

  if (creator.verified) {
    reasons.push("Verified creator");
  }

  const totalScore =
    HYBRID_WEIGHTS.semantic * semanticSimilarity +
    HYBRID_WEIGHTS.engagement * engagement.score +
    HYBRID_WEIGHTS.budget * budget.score +
    HYBRID_WEIGHTS.niche * niche.score;

  let finalScore = Math.round(totalScore * 100);
  if (creator.verified) finalScore = Math.min(100, finalScore + 3);

  return { score: finalScore, semanticScore, reasons };
}
