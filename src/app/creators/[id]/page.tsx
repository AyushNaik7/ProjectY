"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { supabase } from "@/lib/supabase";
import { callSendCollaborationRequest } from "@/lib/functions";
import DashboardShell from "@/components/DashboardShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Instagram,
  Youtube,
  MessageSquare,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface CreatorData {
  id: string;
  name: string;
  niche: string;
  bio: string;
  instagram_handle: string;
  instagram_followers: number;
  youtube_followers: number;
  tiktok_followers: number;
  instagram_engagement: number;
  youtube_engagement: number;
  tiktok_engagement: number;
  avg_views: number;
}

export default function CreatorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user, role, loading: authLoading } = useSupabaseAuth();
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);

  const creatorId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!creatorId) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("creators")
          .select("*")
          .eq("id", creatorId)
          .single();
        if (error) throw error;
        setCreator(data as CreatorData);
      } catch (err) {
        console.error("Failed to load creator:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [creatorId]);

  const [sendingRequest, setSendingRequest] = useState(false);

  const handleSendRequest = async () => {
    if (!user || role !== "brand") {
      alert("Only brands can send collaboration requests.");
      return;
    }
    if (!creator) return;
    setSendingRequest(true);
    try {
      await callSendCollaborationRequest({
        creatorId: creator.id,
        message: `Hi ${creator.name}! We'd love to collaborate with you.`,
      });
      alert("Request sent successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  const fmt = (num: number) => {
    if (!num) return "0";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardShell role={role || "brand"}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    );
  }

  if (!creator) {
    return (
      <DashboardShell role={role || "brand"}>
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">Creator not found</p>
          <Link href="/creators">
            <Button variant="outline">Back to Creators</Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const totalFollowers =
    (creator.instagram_followers || 0) +
    (creator.youtube_followers || 0) +
    (creator.tiktok_followers || 0);
  const platforms = [
    ...(creator.instagram_followers > 0
      ? [
          {
            name: "Instagram",
            followers: creator.instagram_followers,
            engagement: creator.instagram_engagement || 0,
            icon: Instagram,
            color: "text-pink-600",
            bg: "bg-pink-50",
          },
        ]
      : []),
    ...(creator.youtube_followers > 0
      ? [
          {
            name: "YouTube",
            followers: creator.youtube_followers,
            engagement: creator.youtube_engagement || 0,
            icon: Youtube,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ]
      : []),
    ...(creator.tiktok_followers > 0
      ? [
          {
            name: "TikTok",
            followers: creator.tiktok_followers,
            engagement: creator.tiktok_engagement || 0,
            icon: TrendingUp,
            color: "text-slate-900",
            bg: "bg-slate-100",
          },
        ]
      : []),
  ];

  return (
    <DashboardShell role={role || "brand"}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-4"
      >
        <Link href="/creators">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{creator.name}</h1>
          <p className="text-muted-foreground">{creator.niche}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {creator.name?.charAt(0)}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {creator.name}
                </h2>
                <Badge className="mb-4">{creator.niche}</Badge>
                {creator.bio && (
                  <p className="text-muted-foreground mt-3 max-w-2xl">
                    {creator.bio}
                  </p>
                )}
                {creator.instagram_handle && (
                  <div className="flex items-center gap-2 mt-4 mb-6">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <a
                      href={`https://instagram.com/${creator.instagram_handle.replace(
                        "@",
                        ""
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {creator.instagram_handle.startsWith("@")
                        ? creator.instagram_handle
                        : `@${creator.instagram_handle}`}
                    </a>
                  </div>
                )}
                {role === "brand" && (
                  <Button
                    onClick={handleSendRequest}
                    disabled={sendingRequest}
                    size="lg"
                    className="gap-2 bg-primary hover:bg-primary/90 mt-2"
                  >
                    {sendingRequest ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-5 h-5" />
                    )}
                    {sendingRequest ? "Sending..." : "Send Collaboration Request"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Followers", value: fmt(totalFollowers) },
                {
                  label: "Engagement Rate",
                  value: `${creator.instagram_engagement || 0}%`,
                  highlight: true,
                },
                { label: "Avg Views", value: fmt(creator.avg_views || 0) },
                { label: "Platforms", value: String(platforms.length) },
              ].map((s, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      {s.label}
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        s.highlight ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {s.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {platforms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Platform Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {platforms.map((p) => {
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.name}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${p.bg}`}>
                            <Icon className={`w-5 h-5 ${p.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {fmt(p.followers)} followers
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            {p.engagement}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            engagement
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="border-0 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Followers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {fmt(totalFollowers)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">
                  Engagement Rate
                </p>
                <p className="text-2xl font-bold text-primary">
                  {creator.instagram_engagement || 0}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Avg Views</p>
                <p className="text-2xl font-bold text-foreground">
                  {fmt(creator.avg_views || 0)}
                </p>
              </div>
              {role === "brand" && (
                <Button
                  onClick={handleSendRequest}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  <MessageSquare className="w-4 h-4" /> Send Request
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
