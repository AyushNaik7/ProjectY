"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { IndianRupee, Calendar, CheckCircle2, Eye, Settings } from "lucide-react";
import type { MarketplaceCampaign } from "@/lib/marketplace-types";
import {
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPE_COLORS,
} from "@/lib/marketplace-types";
import { MatchBadge, MatchTooltip } from "./MatchBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { BrandInfoCard } from "./BrandInfoCard";
import { ActionButtons } from "./ActionButtons";
import { Button } from "@/components/ui/button";

interface MarketplaceCampaignCardProps {
  campaign: MarketplaceCampaign;
  isSaved: boolean;
  onViewDetails: (id: string) => void;
  onSendProposal: (id: string) => void;
  onToggleSave: (id: string) => void;
  onQuickApply: (id: string) => void;
  index: number;
  viewMode: "grid" | "list";
  /** Brand role hides creator-only UI (match score, save, apply) */
  isBrandView?: boolean;
}

export function MarketplaceCampaignCard({
  campaign,
  isSaved,
  onViewDetails,
  onSendProposal,
  onToggleSave,
  onQuickApply,
  index,
  viewMode,
  isBrandView = false,
}: MarketplaceCampaignCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const budgetDisplay = campaign.budgetMax
    ? `₹${campaign.budget.toLocaleString("en-IN")} – ₹${campaign.budgetMax.toLocaleString("en-IN")}`
    : `₹${campaign.budget.toLocaleString("en-IN")}`;

  // ─── List layout ──────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
      >
        <Card
          className="border-border/50 hover:border-primary/30 transition-all duration-300 group"
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-5">
              {/* Match badge — creator only */}
              {!isBrandView && (
                <div
                  className="relative shrink-0"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <MatchBadge score={campaign.matchScore} size="md" showLabel />
                  {showTooltip && (
                    <div className="absolute left-full top-0 ml-2 z-50">
                      <MatchTooltip breakdown={campaign.matchBreakdown} />
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                        {campaign.title}
                      </h3>
                    </div>
                    <BrandInfoCard brand={campaign.brand} compact />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Payment type badge */}
                    <Badge
                      className={cn(
                        "text-[10px] shrink-0",
                        PAYMENT_TYPE_COLORS[campaign.paymentType],
                      )}
                    >
                      {PAYMENT_TYPE_LABELS[campaign.paymentType]}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {campaign.platform}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-1">
                  {campaign.description}
                </p>

                {/* Urgency */}
                <UrgencyBadge
                  endDate={campaign.endDate}
                  spotsLeft={campaign.spotsLeft}
                  spotsTotal={campaign.spotsTotal}
                  isHighDemand={campaign.isHighDemand}
                />

                {/* Match reasons — creator only */}
                {!isBrandView && campaign.matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {campaign.matchReasons.slice(0, 3).map((reason, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {budgetDisplay}
                    </span>
                    {campaign.timeline && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                        <Calendar className="w-3 h-3" />
                        {campaign.timeline}
                      </span>
                    )}
                    {campaign.niche && (
                      <Badge variant="outline" className="text-[10px]">
                        {campaign.niche}
                      </Badge>
                    )}
                  </div>
                  {isBrandView ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onViewDetails(campaign.id)}>
                        <Eye className="w-3.5 h-3.5" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onSendProposal(campaign.id)}>
                        <Settings className="w-3.5 h-3.5" /> Manage
                      </Button>
                    </div>
                  ) : (
                    <ActionButtons
                      campaignId={campaign.id}
                      isSaved={isSaved}
                      onViewDetails={() => onViewDetails(campaign.id)}
                      onSendProposal={() => onSendProposal(campaign.id)}
                      onToggleSave={() => onToggleSave(campaign.id)}
                      onQuickApply={() => onQuickApply(campaign.id)}
                      compact
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ─── Grid layout ──────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card
        className="border-border/50 hover:border-primary/30 transition-all duration-300 h-full flex flex-col group relative overflow-hidden"
      >

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <CardContent className="p-5 flex-1 flex flex-col relative z-[1]">
          {/* Top row: Status + Match score */}
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="success" className="text-[10px]">
                  Active
                </Badge>
                <Badge
                  className={cn(
                    "text-[10px]",
                    PAYMENT_TYPE_COLORS[campaign.paymentType],
                  )}
                >
                  {PAYMENT_TYPE_LABELS[campaign.paymentType]}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {campaign.platform}
                </Badge>
              </div>
            </div>

            {/* Match score with tooltip — creator only */}
            {!isBrandView && (
              <div
                className="relative shrink-0"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <MatchBadge score={campaign.matchScore} size="md" />
                {showTooltip && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <MatchTooltip breakdown={campaign.matchBreakdown} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {campaign.title}
          </h3>

          {/* Brand info */}
          <BrandInfoCard brand={campaign.brand} className="mb-3" />

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {campaign.description}
          </p>

          {/* Urgency badges */}
          <UrgencyBadge
            endDate={campaign.endDate}
            spotsLeft={campaign.spotsLeft}
            spotsTotal={campaign.spotsTotal}
            isHighDemand={campaign.isHighDemand}
            className="mb-3"
          />

          {/* Why Recommended — creator only */}
          {!isBrandView && campaign.matchReasons.length > 0 && (
            <div className="space-y-1 mb-3 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Why recommended
              </p>
              {campaign.matchReasons.slice(0, 3).map((reason, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-tight">
                    {reason}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Budget / Timeline */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50 mb-3">
            <div className="flex items-center gap-1 font-semibold text-sm">
              <IndianRupee className="w-3.5 h-3.5" />
              {budgetDisplay}
            </div>
            {campaign.timeline && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {campaign.timeline}
              </div>
            )}
          </div>

          {campaign.niche && (
            <Badge variant="outline" className="w-fit mb-3 text-[10px]">
              {campaign.niche}
            </Badge>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions */}
          {isBrandView ? (
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => onViewDetails(campaign.id)}>
                <Eye className="w-3.5 h-3.5" /> View Details
              </Button>
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => onSendProposal(campaign.id)}>
                <Settings className="w-3.5 h-3.5" /> Manage
              </Button>
            </div>
          ) : (
            <ActionButtons
              campaignId={campaign.id}
              isSaved={isSaved}
              onViewDetails={() => onViewDetails(campaign.id)}
              onSendProposal={() => onSendProposal(campaign.id)}
              onToggleSave={() => onToggleSave(campaign.id)}
              onQuickApply={() => onQuickApply(campaign.id)}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
