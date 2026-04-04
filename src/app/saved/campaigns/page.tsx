"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardShell from "@/components/DashboardShell";
import { CampaignCard } from "@/components/CampaignCard";
import { useAuth } from "@/context/ClerkAuthContext";
import { supabase } from "@/lib/supabase";
import { Bookmark, Loader2 } from "lucide-react";

export default function SavedCampaignsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_campaigns")
        .select(
          `
          campaign_id,
          campaigns (*)
        `
        )
        .eq("creator_id", user?.id);

      if (error) throw error;

      const campaignsList = data?.map((item: any) => item.campaigns) || [];
      setCampaigns(campaignsList);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("saved_campaigns")) {
        console.error("Error fetching saved campaigns:", error);
      }
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== "creator") {
        router.push("/login");
        return;
      }
      fetchSavedCampaigns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, authLoading]);

  const handleUnsave = async (campaignId: string) => {
    try {
      await supabase
        .from("saved_campaigns")
        .delete()
        .eq("creator_id", user?.id)
        .eq("campaign_id", campaignId);

      setCampaigns(campaigns.filter((c) => c.id !== campaignId));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("saved_campaigns")) {
        console.error("Error unsaving campaign:", error);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Saved Campaigns</h1>
            <p className="text-muted-foreground">
              {"Campaigns you've bookmarked for later"}
            </p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No saved campaigns</h2>
            <p className="text-muted-foreground">
              {"Start bookmarking campaigns you're interested in!"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign, index) => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                brandName={campaign.title || "Unknown Brand"}
                category={campaign.niche || "General"}
                deliverable={
                  campaign.deliverable_type || campaign.description || ""
                }
                budgetMin={campaign.budget || 0}
                budgetMax={campaign.budget || 0}
                timeline={campaign.timeline || ""}
                matchScore={0}
                onApply={() => router.push(`/campaigns/${campaign.id}?action=apply`)}
                index={index}
                isSaved={true}
                onToggleSave={() => handleUnsave(campaign.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
