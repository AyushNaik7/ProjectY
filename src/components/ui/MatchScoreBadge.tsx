import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { box: 32, stroke: 3, text: "text-[10px]" },
  md: { box: 40, stroke: 4, text: "text-[13px]" },
  lg: { box: 52, stroke: 5, text: "text-[15px]" },
} as const;

function colorForScore(score: number) {
  if (score >= 80) return "#3B6D11";
  if (score >= 60) return "#BA7517";
  return "#A32D2D";
}

export function MatchScoreBadge({ score, size = "md" }: MatchScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const cfg = sizeMap[size];
  const radius = (cfg.box - cfg.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const c = colorForScore(clamped);

  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: cfg.box, height: cfg.box }}>
      <svg width={cfg.box} height={cfg.box} viewBox={`0 0 ${cfg.box} ${cfg.box}`}>
        <circle
          cx={cfg.box / 2}
          cy={cfg.box / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={cfg.stroke}
          fill="none"
        />
        <circle
          cx={cfg.box / 2}
          cy={cfg.box / 2}
          r={radius}
          stroke={c}
          strokeWidth={cfg.stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cfg.box / 2} ${cfg.box / 2})`}
        />
      </svg>
      <span className={cn("absolute font-medium text-slate-800", cfg.text)}>{Math.round(clamped)}</span>
    </span>
  );
}
