"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, LucideIcon } from "lucide-react";

export interface DashboardMetric {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "blue" | "purple" | "green" | "amber";
}

interface DashboardCardsProps {
  metrics: DashboardMetric[];
  loading?: boolean;
}

const toneStyles: Record<NonNullable<DashboardMetric["tone"]>, string> = {
  blue: "from-blue-500/30 to-sky-500/25 text-blue-200",
  purple: "from-violet-500/30 to-indigo-500/25 text-violet-200",
  green: "from-emerald-500/30 to-teal-500/25 text-emerald-200",
  amber: "from-amber-500/30 to-orange-500/25 text-amber-200",
};

export function DashboardCards({ metrics, loading = false }: DashboardCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-white/10 bg-white/5 shadow-lg shadow-slate-950/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <motion.article
            key={metric.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_16px_36px_rgba(8,12,36,0.55)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(72,56,190,0.35)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-400">{metric.label}</p>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-100">{metric.value}</h3>
              </div>
              <div
                className={`rounded-2xl bg-gradient-to-br p-3 ${toneStyles[metric.tone || "blue"]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-center text-sm text-slate-400">
              <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-300" />
              <span>{metric.delta || "Updated 5 min ago"}</span>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
