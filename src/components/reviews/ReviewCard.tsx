"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import { CheckCircle2 } from "lucide-react";
import type { ReviewWithReviewer } from "@/types/reviews";

interface ReviewCardProps {
  review: ReviewWithReviewer;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(review.reviewer_name)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{review.reviewer_name}</h4>
                  {review.collaboration_verified && (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs bg-green-500/10 text-green-600"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Collab
                    </Badge>
                  )}
                </div>
                <StarRating rating={review.rating} readonly size="sm" />
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(review.created_at)}
              </span>
            </div>

            {review.review_text && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {review.review_text}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
