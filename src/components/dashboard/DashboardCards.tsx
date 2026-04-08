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
  blue: "from-blue-500/20 to-sky-400/20 text-blue-700",
  purple: "from-violet-500/20 to-indigo-400/20 text-violet-700",
  green: "from-emerald-500/20 to-teal-400/20 text-emerald-700",
  amber: "from-amber-500/20 to-orange-400/20 text-amber-700",
};

export function DashboardCards({ metrics, loading = false }: DashboardCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl border border-white/40 bg-white/70 shadow-sm"
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
            className="group rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_8px_30px_rgba(20,30,80,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(37,60,153,0.12)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{metric.value}</h3>
              </div>
              <div
                className={`rounded-2xl bg-gradient-to-br p-3 ${toneStyles[metric.tone || "blue"]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="flex items-center text-sm text-slate-500">
              <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-600" />
              <span>{metric.delta || "Updated 5 min ago"}</span>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
