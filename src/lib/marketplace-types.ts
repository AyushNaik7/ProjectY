// Marketplace types for the AI-powered campaign matching interface

export type PaymentType = "negotiable" | "fixed" | "performance_based";
export type DeliverableType = "Reel" | "Post" | "Story" | "YouTube" | "Blog";
export type CampaignStatus = "active" | "closed" | "draft";
export type ViewMode = "grid" | "list";

// ─── Match Score Breakdown ───────────────────────────────────────────────────

export interface MatchScoreBreakdown {
  audienceOverlap: number; // 0–100
  nicheMatch: number; // 0–100
  engagementFit: number; // 0–100
  budgetFit: number; // 0–100
}

// ─── Brand Info ──────────────────────────────────────────────────────────────

export interface BrandInfo {
  id: string;
  name: string;
  logoUrl?: string;
  rating: number; // 0.0 – 5.0
  totalRatings: number;
  isVerified: boolean;
  creatorsWorkedWith: number;
  industry?: string;
}

// ─── Marketplace Campaign (fully enriched for the UI) ────────────────────────

export interface MarketplaceCampaign {
  id: string;
  brandId: string;
  brand: BrandInfo;
  title: string;
  description: string;
  deliverableType: DeliverableType;
  budget: number;
  budgetMax?: number;
  timeline: string;
  niche: string;
  status: CampaignStatus;
  platform: string;
  createdAt: string;

  // AI match data
  matchScore: number; // 0–100
  matchReasons: string[]; // e.g. ["Your audience is 68% Gen Z", ...]
  matchBreakdown: MatchScoreBreakdown;

  // Urgency / FOMO
  endDate?: string; // ISO date
  spotsLeft?: number;
  spotsTotal?: number;
  isHighDemand?: boolean;

  // Payment
  paymentType: PaymentType;

  // Feature flag
  isFeatured?: boolean;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface MarketplaceFilters {
  budgetMin: number;
  budgetMax: number;
  platforms: string[];
  categories: string[];
  highMatchOnly: boolean; // >= 80%
  negotiableOnly: boolean;
  searchQuery: string;
}

export const DEFAULT_FILTERS: MarketplaceFilters = {
  budgetMin: 0,
  budgetMax: 500000,
  platforms: [],
  categories: [],
  highMatchOnly: false,
  negotiableOnly: false,
  searchQuery: "",
};

// ─── Available filter options ────────────────────────────────────────────────

export const PLATFORM_OPTIONS = [
  "Reel",
  "YouTube",
  "Story",
  "Post",
  "Blog",
] as const;

export const CATEGORY_OPTIONS = [
  "Fashion & Lifestyle",
  "Beauty & Skincare",
  "Tech & Gadgets",
  "Food & Beverage",
  "Health & Fitness",
  "Travel & Adventure",
  "Gaming & Esports",
  "Finance & Business",
  "Education & Learning",
  "Entertainment",
  "Home & Decor",
  "Parenting & Family",
  "Automotive",
  "Music & Arts",
] as const;

// ─── Helper: payment type display label ──────────────────────────────────────

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  negotiable: "Negotiable",
  fixed: "Fixed Budget",
  performance_based: "Performance-based",
};

export const PAYMENT_TYPE_COLORS: Record<PaymentType, string> = {
  negotiable: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  fixed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  performance_based: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};
