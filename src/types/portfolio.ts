// Types for Creator Portfolio / Media Kit

export interface PortfolioItem {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  brand_worked_with?: string;
  campaign_type?: string;
  result_metric?: string;
  thumbnail_url?: string;
  content_url?: string;
  platform?: string;
  collab_month?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AudienceGenderSplit {
  male: number;
  female: number;
  other: number;
}

export interface CreatorPortfolio {
  id: string;
  name: string;
  instagram_handle?: string;
  niche: string;
  bio?: string;
  portfolio_headline?: string;
  portfolio_tagline?: string;
  instagram_followers?: number;
  youtube_followers?: number;
  tiktok_followers?: number;
  instagram_engagement?: number;
  youtube_engagement?: number;
  tiktok_engagement?: number;
  avg_views?: number;
  verified?: boolean;
  audience_age_range?: string;
  audience_gender_split?: AudienceGenderSplit;
  audience_top_cities?: string[];
  past_brands?: string[];
  content_themes?: string[];
  awards?: string[];
  avg_rating?: number;
  total_reviews?: number;
  tier?: string;
  portfolio_items?: PortfolioItem[];
}

export interface PortfolioMetadata {
  portfolio_headline?: string;
  portfolio_tagline?: string;
  audience_age_range?: string;
  audience_gender_split?: AudienceGenderSplit;
  audience_top_cities?: string[];
  past_brands?: string[];
  content_themes?: string[];
  awards?: string[];
}

export interface CreatePortfolioItemPayload {
  title: string;
  description?: string;
  brand_worked_with?: string;
  campaign_type?: string;
  result_metric?: string;
  thumbnail_url?: string;
  content_url?: string;
  platform?: string;
  collab_month?: string;
}

export interface UpdatePortfolioItemPayload extends Partial<CreatePortfolioItemPayload> {
  display_order?: number;
}

export interface ProfileView {
  id: string;
  creator_id: string;
  viewer_clerk_id?: string;
  viewer_role?: string;
  viewed_at: string;
  view_date: string;
}

export interface ProfileViewStats {
  view_date: string;
  view_count: number;
}
