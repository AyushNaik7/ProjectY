'use client';

import { motion } from 'framer-motion';
import DashboardShell from '@/components/DashboardShell';
import { SocialStatsCard } from '@/components/SocialStatsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Instagram, Youtube, TrendingUp, Users, Zap, BarChart3 } from 'lucide-react';

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
      icon: TrendingUp,
      color: 'bg-black',
    },
  ],
};

const analyticsData = [
  {
    label: 'Total Reach',
    value: '2.5M',
    change: '+12%',
    icon: Users,
    color: 'text-blue-600',
  },
  {
    label: 'Avg Engagement',
    value: '8.5%',
    change: '+2.3%',
    icon: BarChart3,
    color: 'text-green-600',
  },
  {
    label: 'Active Campaigns',
    value: '3',
    change: '+1',
    icon: Zap,
    color: 'text-primary',
  },
];

export default function CreatorDashboard() {
  return (
    <DashboardShell role="creator">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {creatorStats.name}</h1>
        </div>
        <p className="text-muted-foreground">
          Here's your analytics overview and performance metrics.
        </p>
      </motion.div>

      {/* Creator Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Niche</p>
                <p className="text-xl font-bold text-foreground">{creatorStats.niche}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Total Reach</p>
                <p className="text-xl font-bold text-foreground">
                  {(creatorStats.totalReach / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Avg Engagement</p>
                <p className="text-xl font-bold text-primary">{creatorStats.totalEngagement}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Platforms</p>
                <p className="text-xl font-bold text-foreground">
                  {creatorStats.platforms.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Performance Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                        <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 font-medium">{metric.change} this month</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Social Media Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your Social Media Stats</h2>
          <p className="text-sm text-muted-foreground">Connected accounts and their performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creatorStats.platforms.map((platform, index) => (
            <SocialStatsCard
              key={platform.platform}
              {...platform}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </DashboardShell>
  );
}
