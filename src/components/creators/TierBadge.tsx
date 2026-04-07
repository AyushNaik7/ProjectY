"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Award, Star, Crown, Gem } from "lucide-react";

type Tier = "bronze" | "silver" | "gold" | "platinum";

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const TIER_CONFIG: Record<
  Tier,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    colors: string;
  }
> = {
  bronze: {
    label: "Bronze",
    icon: Award,
    colors: "bg-stone-500/10 text-stone-700 border-stone-500/20",
  },
  silver: {
    label: "Silver",
    icon: Star,
    colors: "bg-slate-500/10 text-slate-700 border-slate-500/20",
  },
  gold: {
    label: "Gold",
    icon: Crown,
    colors: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  platinum: {
    label: "Platinum",
    icon: Gem,
    colors: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
};

const SIZE_CONFIG = {
  sm: {
    badge: "text-xs px-2 py-0.5",
    icon: "w-3 h-3",
  },
  md: {
    badge: "text-sm px-2.5 py-1",
    icon: "w-3.5 h-3.5",
  },
  lg: {
    badge: "text-base px-3 py-1.5",
    icon: "w-4 h-4",
  },
};

export function TierBadge({
  tier,
  size = "md",
  showIcon = true,
  className,
}: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        config.colors,
        sizeConfig.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeConfig.icon} />}
      {config.label}
    </Badge>
  );
}
