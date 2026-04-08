interface TierBadgeProps {
  tier: "bronze" | "silver" | "gold" | "platinum";
}

const tierMap = {
  bronze: { bg: "#e2e8f0", fg: "#475569" },
  silver: { bg: "#f1f5f9", fg: "#475569" },
  gold: { bg: "#FAEEDA", fg: "#BA7517" },
  platinum: { bg: "#E6F1FB", fg: "#185FA5" },
} as const;

export function TierBadge({ tier }: TierBadgeProps) {
  const c = tierMap[tier];
  return (
    <span className="inline-flex rounded-full px-2 py-1 text-[11px] font-medium capitalize" style={{ backgroundColor: c.bg, color: c.fg }}>
      {tier}
    </span>
  );
}
