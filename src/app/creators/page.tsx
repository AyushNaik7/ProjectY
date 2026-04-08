"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/ClerkAuthContext";
import { createClient } from "@/lib/supabase-browser";
import { callSendCollaborationRequest } from "@/lib/functions";
import DashboardShell from "@/components/DashboardShell";
import { CreatorCard } from "@/components/CreatorCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Loader2, Sparkles, RefreshCw } from "lucide-react";

interface CreatorItem {
  id: string;
  username?: string;
  name: string;
  niche: string;
  followers: number;
  engagement: number;
  avgViews: number;
}

interface CreatorRow {
  id: string;
  username: string | null;
  name: string | null;
  niche: string | null;
  instagram_followers: number | null;
  instagram_engagement: number | null;
  avg_views: number | null;
}

type SortKey = "followers" | "engagement" | "views";

export default function FindCreatorsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFollowers, setSelectedFollowers] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("followers");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch creators from Supabase
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setPageError(null);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("creators")
          .select(
            "id, username, name, niche, instagram_followers, instagram_engagement, avg_views"
          )
          .order("instagram_followers", { ascending: false });

        if (error) throw error;

        const mapped: CreatorItem[] = ((data as CreatorRow[] | null) || []).map((c) => ({
          id: c.id,
          username: c.username || undefined,
          name: c.name || "Unknown Creator",
          niche: c.niche || "General",
          followers: c.instagram_followers || 0,
          engagement: c.instagram_engagement || 0,
          avgViews: c.avg_views || 0,
        }));

        setCreators(mapped);
      } catch (err) {
        console.error("Failed to load creators:", err);
        setPageError("We could not load creators right now. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const handleSendRequest = async (creatorId: string) => {
    if (!user || role !== "brand") {
      alert(
        "Only brands can send collaboration requests. Please log in as a brand."
      );
      return;
    }
    setSendingTo(creatorId);
    try {
      await callSendCollaborationRequest({
        creatorId,
        message: "Hi! We'd love to collaborate with you on our next campaign.",
      });
      alert("Request sent successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to send request");
    } finally {
      setSendingTo(null);
    }
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      !searchQuery ||
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.niche.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      creator.niche.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesFollowers =
      selectedFollowers === "all" ||
      (selectedFollowers === "10k-100k" &&
        creator.followers >= 10000 &&
        creator.followers < 100000) ||
      (selectedFollowers === "100k-500k" &&
        creator.followers >= 100000 &&
        creator.followers < 500000) ||
      (selectedFollowers === "500k-1m" &&
        creator.followers >= 500000 &&
        creator.followers < 1000000) ||
      (selectedFollowers === "1m+" && creator.followers >= 1000000);

    return matchesSearch && matchesCategory && matchesFollowers;
  }).sort((a, b) => {
    if (sortBy === "engagement") {
      return b.engagement - a.engagement;
    }
    if (sortBy === "views") {
      return b.avgViews - a.avgViews;
    }
    return b.followers - a.followers;
  });

  const avgFollowers =
    creators.length === 0
      ? 0
      : Math.round(
          creators.reduce((total, creator) => total + creator.followers, 0) /
            creators.length,
        );

  const highEngagementCount = creators.filter(
    (creator) => creator.engagement >= 5,
  ).length;

  const activeCategoryCount = new Set(
    creators.map((creator) => creator.niche.toLowerCase()),
  ).size;

  const reloadPage = () => {
    setLoading(true);
    router.refresh();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <DashboardShell role={role || "brand"}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Users className="w-7 h-7 text-primary" />
          Find Creators
        </h1>
        <p className="text-muted-foreground">
          Discover high-fit creators and send collaboration requests in one flow.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total creators</p>
            <p className="text-2xl font-semibold">{creators.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg followers</p>
            <p className="text-2xl font-semibold">
              {Intl.NumberFormat("en-IN").format(avgFollowers)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">High engagement (5%+)</p>
            <p className="text-2xl font-semibold">{highEngagementCount}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Across {activeCategoryCount} active niches
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or niche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="fashion">
                        Fashion & Lifestyle
                      </SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                      <SelectItem value="beauty">Beauty & Skincare</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="food">Food & Travel</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Followers
                  </label>
                  <Select
                    value={selectedFollowers}
                    onValueChange={setSelectedFollowers}
                  >
                    <SelectTrigger className="border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Followers</SelectItem>
                      <SelectItem value="10k-100k">10K - 100K</SelectItem>
                      <SelectItem value="100k-500k">100K - 500K</SelectItem>
                      <SelectItem value="500k-1m">500K - 1M</SelectItem>
                      <SelectItem value="1m+">1M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Sort By
                  </label>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as SortKey)}
                  >
                    <SelectTrigger className="border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="followers">Followers</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="views">Average Views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {pageError && (
        <Card className="mb-6 border-red-200 bg-red-50/60">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-red-700">Could not load creator directory</p>
              <p className="text-xs text-red-600">{pageError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={reloadPage} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4 flex items-center justify-between"
      >
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading creators..."
            : `Showing ${filteredCreators.length} creator${
                filteredCreators.length !== 1 ? "s" : ""
              }`}
        </p>
        {!loading && filteredCreators.length > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Sorted by {sortBy}
          </span>
        )}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading creators...</p>
          </div>
        </div>
      ) : filteredCreators.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCreators.map((creator, index) => (
              <CreatorCard
                key={creator.id}
                {...creator}
                onSendRequest={() => handleSendRequest(creator.id)}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground mb-2">No creators found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedFollowers("all");
              }}
            >
              Reset filters
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
