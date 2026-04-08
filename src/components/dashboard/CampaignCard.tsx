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
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-200 text-slate-600",
  "ending-soon": "bg-amber-100 text-amber-700",
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
      className="group rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_10px_35px_rgba(17,27,71,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(54,78,184,0.14)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-sm text-slate-500">{campaign.brand}</p>
          <h3 className="text-lg font-semibold text-slate-900">{campaign.title}</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[campaign.status || "active"]}`}
        >
          {(campaign.status || "active").replace("-", " ")}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-100/70 p-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <IndianRupee className="h-4 w-4" />
          <span>{campaign.budget}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <CalendarDays className="h-4 w-4" />
          <span>{campaign.timeline}</span>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 text-sm text-blue-700">
        <Sparkles className="h-4 w-4" />
        <span>{campaign.fit || "High fit based on your audience"}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onPrimaryAction?.(campaign.id)}
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:brightness-110"
        >
          {ctaLabel}
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </button>
        {campaign.href ? (
          <Link
            href={campaign.href}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
          >
            Open
          </Link>
        ) : null}
        <button
          onClick={() => onSecondaryAction?.(campaign.id)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:text-blue-700"
        >
          {secondaryCtaLabel}
        </button>
      </div>
    </motion.article>
  );
}
