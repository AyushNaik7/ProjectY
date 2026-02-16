'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface SocialStatsCardProps {
  platform: string;
  followers: number;
  engagement: number;
  icon: LucideIcon;
  color: string;
  index: number;
}

export function SocialStatsCard({
  platform,
  followers,
  engagement,
  icon: Icon,
  color,
  index,
}: SocialStatsCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{platform}</p>
              <h3 className="text-2xl font-bold text-foreground">
                {formatNumber(followers)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Followers</p>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Engagement Rate</span>
              <span className="text-sm font-semibold text-primary">{engagement}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${engagement}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
