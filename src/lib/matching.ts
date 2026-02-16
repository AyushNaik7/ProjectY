// Client-side matching utilities (display only — actual scoring is done in Cloud Functions)

export interface Campaign {
    id: string;
    brandId: string;
    title: string;
    description: string;
    deliverableType: "Reel" | "Post" | "Story";
    budget: number;
    timeline: string;
    niche?: string;
    status: "active" | "paused" | "completed";
    createdAt: Date;
}

export interface CreatorProfile {
    uid: string;
    name: string;
    instagramHandle: string;
    niche: string;
    followers: number;
    avgViews: number;
    engagementRate: number;
    verified: boolean;
}

export interface MatchedCampaign extends Campaign {
    matchScore: number;
    matchReasons: string[];
}

// Client-side display helper: pre-sort campaigns by match score
export function sortByMatchScore(campaigns: MatchedCampaign[]): MatchedCampaign[] {
    return [...campaigns].sort((a, b) => b.matchScore - a.matchScore);
}

// Format match score for display
export function formatMatchScore(score: number): string {
    if (score >= 90) return "Excellent Match";
    if (score >= 75) return "Great Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Low Match";
}

export function getMatchColor(score: number): string {
    if (score >= 90) return "text-emerald-400";
    if (score >= 75) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-gray-400";
}
