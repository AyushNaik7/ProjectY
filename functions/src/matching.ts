import * as admin from "firebase-admin";

/**
 * Match Scoring Engine (Server-side only)
 *
 * Computes a match score between a creator and a campaign.
 * This MUST run server-side — never trust client-side scoring.
 *
 * Scoring factors:
 *  1. Niche match (40 points)
 *  2. Budget compatibility (30 points)
 *  3. Engagement quality (20 points)
 *  4. Follower relevance (10 points)
 */

interface CreatorData {
    uid: string;
    name: string;
    instagramHandle: string;
    niche: string;
    followers: number;
    avgViews: number;
    engagementRate: number;
    minRatePrivate: number;
    verified: boolean;
}

interface CampaignData {
    brandId: string;
    title: string;
    description: string;
    deliverableType: string;
    budget: number;
    timeline: string;
    niche: string;
    status: string;
}

interface MatchResult {
    creatorId: string;
    campaignId: string;
    score: number;
    reasons: string[];
}

// Related niche groups for partial matching
const NICHE_GROUPS: Record<string, string[]> = {
    "Fashion & Lifestyle": ["Beauty & Skincare", "Art & Design"],
    "Beauty & Skincare": ["Fashion & Lifestyle", "Fitness & Health"],
    "Tech & Gadgets": ["Gaming", "Education"],
    "Food & Cooking": ["Travel", "Parenting"],
    "Travel": ["Food & Cooking", "Fashion & Lifestyle"],
    "Fitness & Health": ["Beauty & Skincare", "Parenting"],
    "Education": ["Finance & Business", "Tech & Gadgets"],
    "Finance & Business": ["Education", "Tech & Gadgets"],
    "Entertainment & Comedy": ["Gaming", "Music"],
    "Gaming": ["Tech & Gadgets", "Entertainment & Comedy"],
    "Parenting": ["Food & Cooking", "Fitness & Health"],
    "Automotive": ["Tech & Gadgets", "Travel"],
    "Art & Design": ["Fashion & Lifestyle", "Music"],
    "Music": ["Entertainment & Comedy", "Art & Design"],
};

export function computeMatchScore(
    creator: CreatorData,
    campaign: CampaignData,
    campaignId: string
): MatchResult {
    let score = 0;
    const reasons: string[] = [];

    // ========================================
    // 1. NICHE MATCH (0-40 points)
    // ========================================
    if (campaign.niche === "Any" || creator.niche === campaign.niche) {
        score += 40;
        reasons.push("Perfect niche match");
    } else {
        const relatedNiches = NICHE_GROUPS[campaign.niche] || [];
        if (relatedNiches.includes(creator.niche)) {
            score += 20;
            reasons.push("Related niche");
        }
    }

    // ========================================
    // 2. BUDGET COMPATIBILITY (0-30 points)
    // ========================================
    // Creator's min rate must be within campaign budget
    if (creator.minRatePrivate <= campaign.budget) {
        const budgetRatio = creator.minRatePrivate / campaign.budget;
        if (budgetRatio >= 0.3 && budgetRatio <= 0.8) {
            // Sweet spot: creator rate is 30-80% of budget
            score += 30;
            reasons.push("Excellent budget fit");
        } else if (budgetRatio < 0.3) {
            // Creator is much cheaper — might indicate lower quality
            score += 15;
            reasons.push("Under budget");
        } else {
            // Creator rate is very close to budget
            score += 20;
            reasons.push("Budget compatible");
        }
    } else {
        // Creator's min rate exceeds campaign budget
        const overBudgetRatio = creator.minRatePrivate / campaign.budget;
        if (overBudgetRatio <= 1.2) {
            // Slightly over, might still negotiate
            score += 5;
            reasons.push("Slightly over budget");
        }
        // else: 0 points — clear budget mismatch
    }

    // ========================================
    // 3. ENGAGEMENT QUALITY (0-20 points)
    // ========================================
    if (creator.engagementRate >= 5) {
        score += 20;
        reasons.push("Exceptional engagement");
    } else if (creator.engagementRate >= 3) {
        score += 15;
        reasons.push("Strong engagement");
    } else if (creator.engagementRate >= 1.5) {
        score += 10;
        reasons.push("Good engagement");
    } else if (creator.engagementRate >= 0.5) {
        score += 5;
        reasons.push("Average engagement");
    }

    // ========================================
    // 4. FOLLOWER RELEVANCE (0-10 points)
    // ========================================
    // We prefer creators with meaningful reach but not just vanity metrics
    const viewToFollowerRatio = creator.avgViews / Math.max(creator.followers, 1);

    if (viewToFollowerRatio >= 0.3) {
        score += 10;
        reasons.push("Highly active audience");
    } else if (viewToFollowerRatio >= 0.15) {
        score += 7;
        reasons.push("Active audience");
    } else if (viewToFollowerRatio >= 0.05) {
        score += 4;
        reasons.push("Moderate audience activity");
    }

    // ========================================
    // VERIFICATION BONUS
    // ========================================
    if (creator.verified) {
        score = Math.min(100, score + 5);
        reasons.push("Verified creator");
    }

    return {
        creatorId: creator.uid,
        campaignId,
        score: Math.min(100, Math.round(score)),
        reasons,
    };
}

/**
 * Compute match scores for all eligible creators against a campaign
 */
export async function computeMatchesForCampaign(
    campaignId: string,
    campaign: CampaignData,
    firestore: admin.firestore.Firestore
): Promise<MatchResult[]> {
    // Fetch all creators (in production, paginate or filter by niche)
    const creatorsSnap = await firestore
        .collection("creators")
        .where("verified", "==", true)
        .limit(200)
        .get();

    const results: MatchResult[] = [];

    for (const doc of creatorsSnap.docs) {
        const creator = doc.data() as CreatorData;
        const match = computeMatchScore(creator, campaign, campaignId);

        // Only include matches with score > 20
        if (match.score > 20) {
            results.push(match);
        }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results;
}
