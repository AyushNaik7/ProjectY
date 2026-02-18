/**
 * Server-Side Matching Logic
 * Shared between API routes for consistent scoring.
 */

// Niche relationships for partial matching
export const NICHE_GROUPS: Record<string, string[]> = {
    "Fashion & Lifestyle": ["Beauty & Skincare", "Art & Design"],
    "Beauty & Skincare": ["Fashion & Lifestyle", "Fitness & Health"],
    "Tech & Gadgets": ["Gaming", "Education & Learning"],
    "Food & Cooking": ["Travel & Adventure", "Parenting"],
    "Travel & Adventure": ["Food & Cooking", "Fashion & Lifestyle"],
    "Fitness & Health": ["Beauty & Skincare", "Parenting"],
    "Education & Learning": ["Finance & Business", "Tech & Gadgets"],
    "Finance & Business": ["Education & Learning", "Tech & Gadgets"],
    "Entertainment & Comedy": ["Gaming", "Music"],
    "Gaming": ["Tech & Gadgets", "Entertainment & Comedy"],
    "Parenting": ["Food & Cooking", "Fitness & Health"],
    "Automotive": ["Tech & Gadgets", "Travel & Adventure"],
    "Art & Design": ["Fashion & Lifestyle", "Music"],
    "Music": ["Entertainment & Comedy", "Art & Design"],
};

export interface CreatorData {
    niche: string;
    followers: number;
    avgViews: number;
    engagementRate: number;
    minRatePrivate: number;
    verified: boolean;
}

export interface CampaignData {
    niche: string;
    budget: number;
}

export function computeMatchScore(creator: CreatorData, campaign: CampaignData) {
    let score = 0;
    const reasons: string[] = [];

    // Niche match (0-40)
    if (campaign.niche === "Any" || creator.niche === campaign.niche) {
        score += 40;
        reasons.push("Perfect niche match");
    } else {
        const related = NICHE_GROUPS[campaign.niche] || [];
        if (related.includes(creator.niche)) {
            score += 20;
            reasons.push("Related niche");
        }
    }

    // Budget compatibility (0-30)
    // Creator minimum rate vs Campaign budget
    if (creator.minRatePrivate <= campaign.budget) {
        const ratio = creator.minRatePrivate / campaign.budget;
        if (ratio >= 0.3 && ratio <= 0.8) {
            score += 30;
            reasons.push("Excellent budget fit");
        } else if (ratio < 0.3) {
            score += 15;
            reasons.push("Under budget");
        } else {
            score += 20;
            reasons.push("Budget compatible");
        }
    } else {
        const over = creator.minRatePrivate / campaign.budget;
        if (over <= 1.2) {
            score += 5;
            reasons.push("Slightly over budget");
        }
    }

    // Engagement (0-20)
    if (creator.engagementRate >= 5) { score += 20; reasons.push("Exceptional engagement"); }
    else if (creator.engagementRate >= 3) { score += 15; reasons.push("Strong engagement"); }
    else if (creator.engagementRate >= 1.5) { score += 10; reasons.push("Good engagement"); }
    else if (creator.engagementRate >= 0.5) { score += 5; reasons.push("Average engagement"); }

    // Audience quality (0-10)
    const viewRatio = creator.avgViews / Math.max(creator.followers, 1);
    if (viewRatio >= 0.3) { score += 10; reasons.push("Highly active audience"); }
    else if (viewRatio >= 0.15) { score += 7; reasons.push("Active audience"); }
    else if (viewRatio >= 0.05) { score += 4; reasons.push("Moderate audience"); }

    if (creator.verified) { score = Math.min(100, score + 5); reasons.push("Verified"); }

    return { score: Math.min(100, Math.round(score)), reasons };
}
