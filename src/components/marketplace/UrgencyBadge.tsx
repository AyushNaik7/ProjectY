"use client";

import { cn } from "@/lib/utils";
import { Clock, Flame, Users } from "lucide-react";

interface UrgencyBadgeProps {
  endDate?: string;
  spotsLeft?: number;
  spotsTotal?: number;
  isHighDemand?: boolean;
  className?: string;
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.max(
    0,
    Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export function UrgencyBadge({
  endDate,
  spotsLeft,
  spotsTotal,
  isHighDemand,
  className,
}: UrgencyBadgeProps) {
  const badges: React.ReactNode[] = [];

  if (endDate) {
    const days = getDaysRemaining(endDate);
    if (days <= 7) {
      badges.push(
        <div
          key="deadline"
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
            days <= 2
              ? "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
              : "bg-amber-500/10 text-amber-600 border border-amber-500/20",
          )}
        >
          <Clock className="w-3 h-3" />
          {days === 0
            ? "Ending today"
            : `Ending in ${days} day${days > 1 ? "s" : ""}`}
        </div>,
      );
    }
  }

  if (spotsLeft != null && spotsTotal != null && spotsLeft <= 5) {
    badges.push(
      <div
        key="spots"
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
          spotsLeft <= 2
            ? "bg-red-500/10 text-red-500 border border-red-500/20"
            : "bg-orange-500/10 text-orange-500 border border-orange-500/20",
        )}
      >
        <Users className="w-3 h-3" />
        Only {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
      </div>,
    );
  }

  if (isHighDemand) {
    badges.push(
      <div
        key="demand"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20"
      >
        <Flame className="w-3 h-3" />
        High demand
      </div>,
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>{badges}</div>
  );
}
