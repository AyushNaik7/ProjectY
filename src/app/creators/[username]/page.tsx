"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Instagram,
  Youtube,
  Users,
  Eye,
  TrendingUp,
  CheckCircle,
  Share2,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/ClerkAuthContext";
import { SendRequestDialog } from "@/components/SendRequestDialog";

interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  niche: string;
  bio?: string;
  followers: number;
  avg_views: number;
  engagement_rate: number;
  verified: boolean;
  instagram_handle?: string;
  youtube_handle?: string;
  past_collaborations?: string[];
}

export default function CreatorMediaKit() {
  const params = useParams<{ username?: string }>();
  const router = useRouter();
  const { user, role } = useAuth();
  const username = params?.username;

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const fetchCreatorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("creators")
        .select("*")
        .eq("username", username)
        .single();

      if (error) throw error;
      setCreator(data);
    } catch (error) {
      console.error("Error fetching creator:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchCreatorProfile();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${creator?.name} - Creator Media Kit`,
        text: `Check out ${creator?.name}'s profile on Collabo`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Creator Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This creator profile doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{creator.name}</h1>
                {creator.verified && (
                  <Badge className="bg-blue-600 text-white gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-4">
                @{creator.username}
              </p>
              <Badge variant="outline" className="text-sm">
                {creator.niche}
              </Badge>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {role === "brand" && (
                <Button onClick={() => setShowRequestDialog(true)}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Followers</p>
                  <p className="text-2xl font-bold">
                    {creator.followers.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Views</p>
                  <p className="text-2xl font-bold">
                    {creator.avg_views.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement</p>
                  <p className="text-2xl font-bold">
                    {creator.engagement_rate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bio Section */}
        {creator.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {creator.bio}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Social Channels</h2>
              <div className="flex flex-wrap gap-4">
                {creator.instagram_handle && (
                  <a
                    href={`https://instagram.com/${creator.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Instagram className="w-5 h-5" />@{creator.instagram_handle}
                  </a>
                )}
                {creator.youtube_handle && (
                  <a
                    href={`https://youtube.com/@${creator.youtube_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition"
                  >
                    <Youtube className="w-5 h-5" />@{creator.youtube_handle}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Past Collaborations */}
        {creator.past_collaborations &&
          creator.past_collaborations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">
                    Past Collaborations
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {creator.past_collaborations.map((brand, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm"
                      >
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
      </div>

      {/* Send Request Dialog */}
      {creator && (
        <SendRequestDialog
          open={showRequestDialog}
          onOpenChange={setShowRequestDialog}
          creatorName={creator.name}
          onConfirm={async () => {
            // TODO: implement actual request sending logic
          }}
        />
      )}
    </div>
  );
}
