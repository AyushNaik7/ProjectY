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
import { Search, Users, Loader2 } from "lucide-react";

interface CreatorItem {
  id: string;
  username?: string;
  name: string;
  niche: string;
  followers: number;
  engagement: number;
  avgViews: number;
}

export default function FindCreatorsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFollowers, setSelectedFollowers] = useState("all");

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
        const supabase = createClient();
        const { data, error } = await supabase
          .from("creators")
          .select(
            "id, username, name, niche, instagram_followers, instagram_engagement, avg_views"
          )
          .order("instagram_followers", { ascending: false });

        if (error) throw error;

        const mapped: CreatorItem[] = (data || []).map((c: any) => ({
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
  });

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
          Browse and discover creators that match your brand
        </p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4"
      >
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading creators..."
            : `Showing ${filteredCreators.length} creator${
                filteredCreators.length !== 1 ? "s" : ""
              }`}
        </p>
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
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
