"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Instagram,
  Youtube,
  TrendingUp,
  Eye,
  Users,
  MapPin,
  Award,
  Share2,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreatorPortfolio } from "@/types/portfolio";
import { PublicPageShell } from "@/components/layout/PublicPageShell";

interface CreatorPublicProfileProps {
  creator: CreatorPortfolio;
}

export function CreatorPublicProfile({ creator }: CreatorPublicProfileProps) {
  useEffect(() => {
    // Track profile view
    fetch("/api/profile-views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creator_id: creator.id }),
    }).catch(() => {});
  }, [creator.id]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${creator.name} - ${creator.niche} Creator`,
      text: `Check out ${creator.name}'s portfolio on InstaCollab`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to copy
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <PublicPageShell>
      <div className="bg-background">
        {/* Hero Section */}
        <div className="relative h-64 bg-slate-100">
          <div className="absolute inset-0 bg-grid-white/10" />
        </div>

      <div className="container max-w-6xl -mt-32 pb-16">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {getInitials(creator.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold">{creator.name}</h1>
                      {creator.verified && (
                        <Badge variant="default" className="gap-1">
                          <Award className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      {creator.tier && creator.tier !== "bronze" && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            creator.tier === "platinum" && "bg-blue-500/10 text-blue-500",
                            creator.tier === "gold" && "bg-amber-500/10 text-amber-500",
                            creator.tier === "silver" && "bg-gray-400/10 text-gray-600"
                          )}
                        >
                          {creator.tier.charAt(0).toUpperCase() + creator.tier.slice(1)}
                        </Badge>
                      )}
                    </div>
                    {creator.instagram_handle && (
                      <p className="text-muted-foreground mb-2">
                        @{creator.instagram_handle}
                      </p>
                    )}
                    <Badge variant="outline">{creator.niche}</Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Request Collab
                    </Button>
                  </div>
                </div>

                {creator.portfolio_headline && (
                  <h2 className="text-xl font-semibold mb-2">
                    {creator.portfolio_headline}
                  </h2>
                )}
                {creator.portfolio_tagline && (
                  <p className="text-muted-foreground mb-4">
                    {creator.portfolio_tagline}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {creator.instagram_followers && (
                    <div className="flex items-center gap-2">
                      <Instagram className="w-5 h-5 text-pink-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Followers</p>
                        <p className="font-semibold">
                          {formatNumber(creator.instagram_followers)}
                        </p>
                      </div>
                    </div>
                  )}
                  {creator.instagram_engagement && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Engagement</p>
                        <p className="font-semibold">
                          {creator.instagram_engagement.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                  {creator.avg_views && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Views</p>
                        <p className="font-semibold">
                          {formatNumber(creator.avg_views)}
                        </p>
                      </div>
                    </div>
                  )}
                  {creator.youtube_followers && (
                    <div className="flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">YouTube</p>
                        <p className="font-semibold">
                          {formatNumber(creator.youtube_followers)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* About Section */}
        {creator.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">About</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {creator.bio}
                </p>

                {creator.content_themes && creator.content_themes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Content Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.content_themes.map((theme, i) => (
                        <Badge key={i} variant="secondary">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Audience Insights */}
        {(creator.audience_age_range ||
          creator.audience_top_cities?.length ||
          creator.audience_gender_split) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Audience Insights</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {creator.audience_age_range && (
                    <div>
                      <p className="text-sm font-medium mb-2">Age Range</p>
                      <p className="text-2xl font-bold text-primary">
                        {creator.audience_age_range}
                      </p>
                    </div>
                  )}
                  {creator.audience_top_cities &&
                    creator.audience_top_cities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Top Cities</p>
                        <div className="space-y-1">
                          {creator.audience_top_cities.slice(0, 3).map((city, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm">{city}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {creator.audience_gender_split && (
                    <div>
                      <p className="text-sm font-medium mb-2">Gender Split</p>
                      <div className="space-y-1 text-sm">
                        <div>Male: {creator.audience_gender_split.male}%</div>
                        <div>Female: {creator.audience_gender_split.female}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Past Brands */}
        {creator.past_brands && creator.past_brands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Worked With</h3>
                <div className="flex flex-wrap gap-2">
                  {creator.past_brands.map((brand, i) => (
                    <Badge key={i} variant="outline" className="text-sm">
                      {brand}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Portfolio Grid */}
        {creator.portfolio_items && creator.portfolio_items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <h3 className="text-2xl font-bold mb-6">Portfolio</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creator.portfolio_items.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {item.thumbnail_url && (
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      {item.campaign_type && (
                        <Badge variant="secondary" className="mb-2">
                          {item.campaign_type}
                        </Badge>
                      )}
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      {item.brand_worked_with && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.brand_worked_with}
                        </p>
                      )}
                      {item.result_metric && (
                        <p className="text-sm font-medium text-primary">
                          {item.result_metric}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PublicPageShell>
  );
}

