'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { SocialStatsCard } from '@/components/SocialStatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Instagram,
  Youtube,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { TikTok } from 'lucide-react';

// Mock creator data
const creatorStats = {
  name: 'Sarah Anderson',
  niche: 'Fashion & Lifestyle',
  totalReach: 2500000,
  totalEngagement: 8.5,
  platforms: [
    {
      platform: 'Instagram',
      followers: 850000,
      engagement: 8.2,
      icon: Instagram,
      color: 'bg-gradient-to-br from-pink-500 to-purple-600',
    },
    {
      platform: 'YouTube',
      followers: 1200000,
      engagement: 9.1,
      icon: Youtube,
      color: 'bg-red-600',
    },
    {
      platform: 'TikTok',
      followers: 450000,
      engagement: 12.5,
      icon: TikTok,
      color: 'bg-black',
    },
  ],
};

const opportunities = [
  {
    title: 'High-Value Deals',
    description: 'Get matched with premium brands offering ₹50K - ₹5L per collaboration',
    icon: Zap,
  },
  {
    title: 'Verified Brands',
    description: 'Work only with verified, legitimate brands in your niche',
    icon: CheckCircle,
  },
  {
    title: 'Instant Payouts',
    description: 'Get paid directly to your account within 48 hours of delivery',
    icon: TrendingUp,
  },
];

export default function CreatorOnboarding() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartMatching = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      router.push('/dashboard/creator');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Collabo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold tracking-tight hidden sm:block">Collabo</span>
          </Link>
          <Button variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-primary/20 text-primary border-0">Welcome</Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Hey {creatorStats.name}! 👋
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            We've analyzed your social media presence across all platforms. Here's your creator profile
            and the amazing opportunities waiting for you.
          </p>
        </motion.div>

        {/* Creator Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Niche</p>
                  <p className="text-2xl font-bold text-foreground">{creatorStats.niche}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Reach</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(creatorStats.totalReach / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Avg Engagement</p>
                  <p className="text-2xl font-bold text-primary">{creatorStats.totalEngagement}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Platforms</p>
                  <p className="text-2xl font-bold text-foreground">
                    {creatorStats.platforms.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Media Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Social Media Stats</h2>
            <p className="text-muted-foreground">
              Connected accounts and their performance metrics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creatorStats.platforms.map((platform, index) => (
              <SocialStatsCard
                key={platform.platform}
                {...platform}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Why Collabo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Why Collabo?</h2>
            <p className="text-muted-foreground">
              Get matched with brands that align with your audience and values
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunities.map((opp, index) => {
              const Icon = opp.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{opp.title}</h3>
                      <p className="text-sm text-muted-foreground">{opp.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Ready to start earning?
                  </h3>
                  <p className="text-muted-foreground">
                    Browse matched campaigns and apply to the ones that interest you.
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={handleStartMatching}
                  disabled={isLoading}
                  className="gap-2 bg-primary hover:bg-primary/90 whitespace-nowrap"
                >
                  {isLoading ? 'Loading...' : 'Start Matching'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Platform Breakdown</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creatorStats.platforms.map((platform, index) => (
              <Card key={platform.platform} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${platform.color}`}>
                      <platform.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground">{platform.platform}</h4>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Followers</p>
                      <p className="text-lg font-bold text-foreground">
                        {(platform.followers / 1000000).toFixed(2)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                      <p className="text-lg font-bold text-primary">{platform.engagement}%</p>
                    </div>
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        ✓ Connected & Verified
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
