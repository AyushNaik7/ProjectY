"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, IndianRupee, Sparkles } from "lucide-react";

export interface PreviewCampaign {
  id: string;
  title: string;
  brand: string;
  budget: string;
  timeline: string;
  fit?: string;
  status?: "active" | "draft" | "ending-soon";
  href?: string;
}

interface CampaignCardProps {
  campaign: PreviewCampaign;
  index: number;
  ctaLabel?: string;
  secondaryCtaLabel?: string;
  onPrimaryAction?: (campaignId: string) => void;
  onSecondaryAction?: (campaignId: string) => void;
}

const statusMap: Record<NonNullable<PreviewCampaign["status"]>, string> = {
  active: "bg-emerald-400/20 text-emerald-200 border border-emerald-300/30",
  draft: "bg-slate-500/20 text-slate-200 border border-slate-300/25",
  "ending-soon": "bg-amber-400/20 text-amber-200 border border-amber-300/30",
};

export function CampaignCard({
  campaign,
  index,
  ctaLabel = "View",
  secondaryCtaLabel = "Quick Apply",
  onPrimaryAction,
  onSecondaryAction,
}: CampaignCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.35 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_16px_40px_rgba(6,10,30,0.5)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_20px_46px_rgba(68,60,190,0.3)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-sm text-slate-400">{campaign.brand}</p>
          <h3 className="text-lg font-semibold text-slate-100">{campaign.title}</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[campaign.status || "active"]}`}
        >
          {(campaign.status || "active").replace("-", " ")}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-white/5 p-3 text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <IndianRupee className="h-4 w-4" />
          <span>{campaign.budget}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <CalendarDays className="h-4 w-4" />
          <span>{campaign.timeline}</span>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-blue-300/25 bg-blue-500/10 px-3 py-2 text-sm text-blue-200">
        <Sparkles className="h-4 w-4" />
        <span>{campaign.fit || "High fit based on your audience"}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onPrimaryAction?.(campaign.id)}
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:brightness-110"
        >
          {ctaLabel}
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </button>
        {campaign.href ? (
          <Link
            href={campaign.href}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-300/30 hover:text-blue-200"
          >
            Open
          </Link>
        ) : null}
        <button
          onClick={() => onSecondaryAction?.(campaign.id)}
          className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-300/30 hover:text-blue-200"
        >
          {secondaryCtaLabel}
        </button>
      </div>
    </motion.article>
  );
}
