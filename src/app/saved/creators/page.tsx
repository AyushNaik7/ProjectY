"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardShell from "@/components/DashboardShell";
import { CreatorCard } from "@/components/CreatorCard";
import { useAuth } from "@/context/ClerkAuthContext";
import { supabase } from "@/lib/supabase";
import { Bookmark, Loader2 } from "lucide-react";

export default function SavedCreatorsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_creators")
        .select(
          `
          creator_id,
          creators (*)
        `
        )
        .eq("brand_id", user?.id);

      if (error) throw error;

      const creatorsList = data?.map((item: any) => item.creators) || [];
      setCreators(creatorsList);
    } catch (error) {
      console.error("Error fetching saved creators:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== "brand") {
        router.push("/login");
        return;
      }
      fetchSavedCreators();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, authLoading]);

  const handleUnsave = async (creatorId: string) => {
    try {
      await supabase
        .from("saved_creators")
        .delete()
        .eq("brand_id", user?.id)
        .eq("creator_id", creatorId);

      setCreators(creators.filter((c) => c.id !== creatorId));
    } catch (error) {
      console.error("Error unsaving creator:", error);
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
            <h1 className="text-3xl font-bold">Saved Creators</h1>
            <p className="text-muted-foreground">
              {"Creators you've bookmarked for collaboration"}
            </p>
          </div>
        </div>

        {creators.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No saved creators</h2>
            <p className="text-muted-foreground">
              Start bookmarking creators you want to work with!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator, index) => (
              <CreatorCard
                key={creator.id}
                id={creator.id}
                name={creator.name || "Unknown Creator"}
                niche={creator.niche || "General"}
                followers={
                  creator.instagram_followers || creator.youtube_followers || 0
                }
                engagement={
                  creator.instagram_engagement ||
                  creator.youtube_engagement ||
                  0
                }
                avgViews={creator.avg_views || 0}
                verified={creator.verified || false}
                username={creator.username}
                onSendRequest={() => {}}
                index={index}
                isSaved={true}
                onToggleSave={() => handleUnsave(creator.id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
