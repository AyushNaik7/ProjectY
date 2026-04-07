// Types for Reviews & Ratings System

export type ReviewerRole = "brand" | "creator";
export type TargetType = "creator" | "brand";

export interface Review {
  id: string;
  reviewer_clerk_id: string;
  reviewer_role: ReviewerRole;
  target_id: string;
  target_type: TargetType;
  collaboration_request_id?: string;
  rating: number;
  review_text?: string;
  is_public: boolean;
  created_at: string;
}

export interface ReviewWithReviewer extends Review {
  reviewer_name: string;
  reviewer_avatar?: string;
  collaboration_verified: boolean;
}

export interface CreateReviewPayload {
  collaboration_request_id: string;
  rating: number;
  review_text?: string;
  is_public?: boolean;
}

export interface RatingStats {
  avg_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
