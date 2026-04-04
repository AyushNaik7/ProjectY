"use client";

import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 90)
    return {
      ring: "ring-emerald-500/30",
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      glow: "shadow-emerald-500/20",
    };
  if (score >= 75)
    return {
      ring: "ring-green-500/30",
      bg: "bg-green-500",
      text: "text-green-500",
      glow: "shadow-green-500/20",
    };
  if (score >= 60)
    return {
      ring: "ring-blue-500/30",
      bg: "bg-blue-500",
      text: "text-blue-500",
      glow: "shadow-blue-500/20",
    };
  if (score >= 40)
    return {
      ring: "ring-amber-500/30",
      bg: "bg-amber-500",
      text: "text-amber-500",
      glow: "shadow-amber-500/20",
    };
  return {
    ring: "ring-gray-400/30",
    bg: "bg-gray-400",
    text: "text-gray-400",
    glow: "shadow-gray-400/20",
  };
}

function getScoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Great";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
}

export function MatchBadge({
  score,
  size = "md",
  showLabel = false,
  className,
}: MatchBadgeProps) {
  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-18 h-18",
  };

  const textSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-muted/20"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(colors.text, "transition-all duration-700 ease-out")}
          />
        </svg>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold",
            textSizes[size],
            colors.text,
          )}
        >
          {score}%
        </div>
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium text-foreground/80">
          {getScoreLabel(score)} Match
        </span>
      )}
    </div>
  );
}

// ─── Tooltip version with breakdown ──────────────────────────────────────────

interface MatchScoreBreakdown {
  audienceOverlap: number;
  nicheMatch: number;
  engagementFit: number;
  budgetFit: number;
}

interface MatchTooltipProps {
  breakdown: MatchScoreBreakdown;
  className?: string;
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
  const colors = getScoreColor(value);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", colors.text)}>{value}%</span>
      </div>
      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colors.bg,
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function MatchTooltip({ breakdown, className }: MatchTooltipProps) {
  return (
    <div
      className={cn(
        "w-56 p-3 rounded-xl bg-popover border border-border shadow-xl space-y-2.5",
        className,
      )}
    >
      <p className="text-xs font-semibold text-foreground mb-2">
        Match Breakdown
      </p>
      <BreakdownBar
        label="Audience Overlap"
        value={breakdown.audienceOverlap}
      />
      <BreakdownBar label="Niche Match" value={breakdown.nicheMatch} />
      <BreakdownBar label="Engagement Fit" value={breakdown.engagementFit} />
      <BreakdownBar label="Budget Fit" value={breakdown.budgetFit} />
    </div>
  );
}
