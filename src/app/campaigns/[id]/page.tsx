"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/ClerkAuthContext";
import { createClient } from "@/lib/supabase-browser";
import DashboardShell from "@/components/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  IndianRupee,
  Calendar,
  Clock,
  Users,
  Flame,
  ShieldCheck,
  Star,
  CheckCircle2,
  Bookmark,
  Zap,
  Send,
  Loader2,
  Settings,
  Film,
  ImageIcon,
  MessageSquare,
  Globe,
  MapPin,
} from "lucide-react";
import type { MarketplaceCampaign } from "@/lib/marketplace-types";
import {
  PAYMENT_TYPE_LABELS,
  PAYMENT_TYPE_COLORS,
} from "@/lib/marketplace-types";
import { mapRowToMarketplaceCampaign } from "@/lib/marketplace-utils";
import { MatchBadge, MatchTooltip } from "@/components/marketplace/MatchBadge";
import { cn } from "@/lib/utils";

const deliverableIcons: Record<string, React.ReactNode> = {
  Reel: <Film className="w-5 h-5" />,
  Post: <ImageIcon className="w-5 h-5" />,
  Story: <MessageSquare className="w-5 h-5" />,
  YouTube: <Globe className="w-5 h-5" />,
  Blog: <Globe className="w-5 h-5" />,
};

export default function CampaignDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  const campaignId = params.id as string;
  const actionParam = searchParams.get("action"); // "proposal" | "apply" | null

  const [campaign, setCampaign] = useState<MarketplaceCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Proposal / Apply state
  const [showProposalForm, setShowProposalForm] = useState(actionParam === "proposal");
  const [showApplyForm, setShowApplyForm] = useState(actionParam === "apply");
  const [proposalMessage, setProposalMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isBrand = role === "brand";

  // ─── Auth guard ──────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [user, authLoading, router]);

  // ─── Fetch campaign + saved state ────────────────────────────────
  const fetchCampaign = useCallback(async () => {
    if (!user || !campaignId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, brands(*)")
        .eq("id", campaignId)
        .single();

      if (error || !data) {
        console.error("Campaign fetch error:", error);
        setCampaign(null);
        setLoading(false);
        return;
      }

      setCampaign(mapRowToMarketplaceCampaign(data));

      // Check if saved (creator only)
      if (role === "creator") {
        const { data: savedRows } = await supabase
          .from("saved_campaigns")
          .select("id")
          .eq("creator_id", user.id)
          .eq("campaign_id", campaignId)
          .limit(1);
        setIsSaved(!!savedRows && savedRows.length > 0);
      }
    } catch (err) {
      console.error("Error loading campaign:", err);
    } finally {
      setLoading(false);
    }
  }, [user, campaignId, role]);

  useEffect(() => {
    if (user) fetchCampaign();
  }, [user, fetchCampaign]);

  // ─── Toggle save ─────────────────────────────────────────────────
  const handleToggleSave = async () => {
    if (!user || !campaign || isBrand) return;
    setSavingToggle(true);
    try {
      const supabase = createClient();
      if (isSaved) {
        await supabase
          .from("saved_campaigns")
          .delete()
          .eq("creator_id", user.id)
          .eq("campaign_id", campaign.id);
        setIsSaved(false);
      } else {
        await supabase
          .from("saved_campaigns")
          .insert({ creator_id: user.id, campaign_id: campaign.id });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Save toggle error:", err);
    } finally {
      setSavingToggle(false);
    }
  };

  // ─── Quick Apply ─────────────────────────────────────────────────
  const handleQuickApply = async () => {
    if (!user || !campaign) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const supabase = createClient();
      // Check for duplicate
      const { data: existing } = await supabase
        .from("collaboration_requests")
        .select("id")
        .eq("creator_id", user.id)
        .eq("campaign_id", campaign.id)
        .eq("status", "pending")
        .limit(1);

      if (existing && existing.length > 0) {
        setSubmitError("You've already applied to this campaign.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("collaboration_requests").insert({
        brand_id: campaign.brandId,
        creator_id: user.id,
        campaign_id: campaign.id,
        status: "pending",
        message: "Quick apply — I'd love to collaborate on this campaign!",
      });

      if (error) throw error;
      setSubmitSuccess("Application sent! The brand will review your profile.");
      setShowApplyForm(false);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Send Proposal ──────────────────────────────────────────────
  const handleSendProposal = async () => {
    if (!user || !campaign || !proposalMessage.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("collaboration_requests")
        .select("id")
        .eq("creator_id", user.id)
        .eq("campaign_id", campaign.id)
        .eq("status", "pending")
        .limit(1);

      if (existing && existing.length > 0) {
        setSubmitError("You've already sent a proposal for this campaign.");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("collaboration_requests").insert({
        brand_id: campaign.brandId,
        creator_id: user.id,
        campaign_id: campaign.id,
        status: "pending",
        message: proposalMessage.trim(),
      });

      if (error) throw error;
      setSubmitSuccess("Proposal sent! The brand will review it shortly.");
      setShowProposalForm(false);
      setProposalMessage("");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to send proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Renders ─────────────────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardShell role={role || "creator"}>
        <div className="space-y-6">
          <div className="h-8 bg-muted/30 rounded-lg animate-pulse w-48" />
          <div className="h-64 bg-muted/30 rounded-2xl animate-pulse" />
          <div className="h-48 bg-muted/30 rounded-2xl animate-pulse" />
        </div>
      </DashboardShell>
    );
  }

  if (!campaign) {
    return (
      <DashboardShell role={role || "creator"}>
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-4">Campaign not found.</p>
          <Button variant="outline" onClick={() => router.push("/campaigns")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaigns
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const budgetDisplay = campaign.budgetMax
    ? `₹${campaign.budget.toLocaleString("en-IN")} – ₹${campaign.budgetMax.toLocaleString("en-IN")}`
    : `₹${campaign.budget.toLocaleString("en-IN")}`;

  const daysLeft = campaign.endDate
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <DashboardShell role={role || "creator"}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ─── Back button ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" size="sm" onClick={() => router.push("/campaigns")} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </Button>
        </motion.div>

        {/* ─── Main Card ───────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant={campaign.status === "active" ? "success" : campaign.status === "draft" ? "warning" : "secondary"}>
                      {campaign.status}
                    </Badge>
                    <Badge className={cn("text-xs", PAYMENT_TYPE_COLORS[campaign.paymentType])}>
                      {PAYMENT_TYPE_LABELS[campaign.paymentType]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {campaign.platform}
                    </Badge>
                    {campaign.isFeatured && (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                    {campaign.title}
                  </h1>
                </div>

                {/* Match score — creator only */}
                {!isBrand && (
                  <div
                    className="relative shrink-0"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <MatchBadge score={campaign.matchScore} size="lg" showLabel />
                    {showTooltip && (
                      <div className="absolute right-0 top-full mt-2 z-50">
                        <MatchTooltip breakdown={campaign.matchBreakdown} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Brand info */}
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-muted/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {campaign.brand.logoUrl ? (
                    <img src={campaign.brand.logoUrl} alt={campaign.brand.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    campaign.brand.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">{campaign.brand.name}</span>
                    {campaign.brand.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {campaign.brand.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {campaign.brand.rating.toFixed(1)}
                        {campaign.brand.totalRatings > 0 && <span className="text-xs">({campaign.brand.totalRatings})</span>}
                      </span>
                    )}
                    {campaign.brand.creatorsWorkedWith > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {campaign.brand.creatorsWorkedWith} creators worked with
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-foreground mb-2">Description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/30 text-center">
                  <IndianRupee className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground mb-0.5">Budget</p>
                  <p className="font-semibold text-sm">{budgetDisplay}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 text-center">
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground mb-0.5">Timeline</p>
                  <p className="font-semibold text-sm">{campaign.timeline || "Flexible"}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 text-center">
                  {deliverableIcons[campaign.deliverableType] || <Film className="w-5 h-5 mx-auto mb-1 text-primary" />}
                  <p className="text-xs text-muted-foreground mb-0.5 mt-1">Deliverable</p>
                  <p className="font-semibold text-sm">{campaign.deliverableType}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 text-center">
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground mb-0.5">Niche</p>
                  <p className="font-semibold text-sm">{campaign.niche || "General"}</p>
                </div>
              </div>

              {/* Urgency indicators */}
              {(daysLeft !== null || campaign.spotsLeft != null || campaign.isHighDemand) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {daysLeft !== null && daysLeft <= 7 && (
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                      daysLeft <= 2 ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                    )}>
                      <Clock className="w-4 h-4" />
                      {daysLeft === 0 ? "Ending today!" : `Ending in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`}
                    </div>
                  )}
                  {campaign.spotsLeft != null && campaign.spotsTotal != null && campaign.spotsLeft <= 5 && (
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                      campaign.spotsLeft <= 2 ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20",
                    )}>
                      <Users className="w-4 h-4" />
                      Only {campaign.spotsLeft} spot{campaign.spotsLeft !== 1 ? "s" : ""} left
                    </div>
                  )}
                  {campaign.isHighDemand && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      <Flame className="w-4 h-4" />
                      High demand
                    </div>
                  )}
                </div>
              )}

              {/* Why Recommended — creator only */}
              {!isBrand && campaign.matchReasons.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                    Why this is recommended for you
                  </p>
                  <div className="space-y-1.5">
                    {campaign.matchReasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-emerald-700 dark:text-emerald-300">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success / Error messages */}
              {submitSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  {submitSuccess}
                </div>
              )}
              {submitError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                  {submitError}
                </div>
              )}

              {/* Proposal form */}
              {showProposalForm && !isBrand && (
                <div className="mb-6 p-4 rounded-xl border border-border space-y-3">
                  <h3 className="font-semibold text-sm">Send a Proposal</h3>
                  <Textarea
                    placeholder="Tell the brand why you're a great fit for this campaign..."
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSendProposal} disabled={submitting || !proposalMessage.trim()} className="gap-2">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Proposal
                    </Button>
                    <Button variant="ghost" onClick={() => setShowProposalForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
                {isBrand ? (
                  <>
                    <Button className="gap-2" onClick={() => router.push(`/campaigns/new?edit=${campaign.id}`)}>
                      <Settings className="w-4 h-4" /> Edit Campaign
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => router.push(`/creators?campaign=${campaign.id}`)}>
                      <Users className="w-4 h-4" /> Find Creators
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => router.push(`/requests?campaign=${campaign.id}`)}>
                      <MessageSquare className="w-4 h-4" /> View Applications
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="gap-2" onClick={handleQuickApply} disabled={submitting || !!submitSuccess}>
                      {submitting && showApplyForm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                      Quick Apply
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setShowProposalForm(true)} disabled={!!submitSuccess}>
                      <Send className="w-4 h-4" /> Send Proposal
                    </Button>
                    <Button
                      variant="outline"
                      className={cn("gap-2", isSaved && "bg-primary/10 border-primary/20 text-primary")}
                      onClick={handleToggleSave}
                      disabled={savingToggle}
                    >
                      {savingToggle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />}
                      {isSaved ? "Saved" : "Save"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
