/**
 * Calculate match score between creator and campaign
 * Returns a score from 0-100
 */

interface Creator {
  niche?: string;
  engagement_rate?: number;
  followers?: number;
}

interface Campaign {
  niche?: string;
  budget?: number;
  min_followers?: number;
  max_followers?: number;
}

export function calculateMatchScore(
  creator: Creator,
  campaign: Campaign
): number {
  let score = 0;
  let totalWeight = 0;

  // 1. Niche Similarity (40% weight)
  const nicheWeight = 40;
  if (creator.niche && campaign.niche) {
    const creatorNiche = creator.niche.toLowerCase().trim();
    const campaignNiche = campaign.niche.toLowerCase().trim();
    
    if (creatorNiche === campaignNiche) {
      score += nicheWeight;
    } else if (
      creatorNiche.includes(campaignNiche) ||
      campaignNiche.includes(creatorNiche)
    ) {
      score += nicheWeight * 0.7; // Partial match
    }
    totalWeight += nicheWeight;
  }

  // 2. Follower Count Compatibility (30% weight)
  const followerWeight = 30;
  if (creator.followers && campaign.min_followers !== undefined) {
    const followers = creator.followers;
    const minFollowers = campaign.min_followers || 0;
    const maxFollowers = campaign.max_followers || Infinity;

    if (followers >= minFollowers && followers <= maxFollowers) {
      score += followerWeight; // Perfect match
    } else if (followers >= minFollowers * 0.8 && followers <= maxFollowers * 1.2) {
      score += followerWeight * 0.7; // Close match
    } else if (followers >= minFollowers * 0.5) {
      score += followerWeight * 0.3; // Partial match
    }
    totalWeight += followerWeight;
  }

  // 3. Engagement Rate (30% weight)
  const engagementWeight = 30;
  if (creator.engagement_rate !== undefined) {
    const engagementRate = creator.engagement_rate;
    
    // High engagement is always good
    if (engagementRate >= 5) {
      score += engagementWeight; // Excellent
    } else if (engagementRate >= 3) {
      score += engagementWeight * 0.8; // Good
    } else if (engagementRate >= 1) {
      score += engagementWeight * 0.5; // Average
    } else {
      score += engagementWeight * 0.2; // Low
    }
    totalWeight += engagementWeight;
  }

  // Normalize score to 0-100 range
  const finalScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
  
  return Math.min(100, Math.max(0, finalScore));
}

/**
 * Get color class based on match score
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 bg-green-50";
  if (score >= 60) return "text-blue-600 bg-blue-50";
  if (score >= 40) return "text-yellow-600 bg-yellow-50";
  return "text-gray-600 bg-gray-50";
}

/**
 * Get match quality label
 */
export function getMatchQuality(score: number): string {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Fair Match";
  return "Low Match";
}
