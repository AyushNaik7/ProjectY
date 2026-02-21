'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageSquare, Bookmark, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface CreatorCardProps {
  id: string;
  name: string;
  niche: string;
  followers: number;
  engagement: number;
  avgViews: number;
  verified?: boolean;
  username?: string;
  onSendRequest: () => void;
  index: number;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function CreatorCard({
  id,
  name,
  niche,
  followers,
  engagement,
  avgViews,
  verified = false,
  username,
  onSendRequest,
  index,
  isSaved = false,
  onToggleSave,
}: CreatorCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const profileUrl = username ? `/creators/${username}` : `/creators/${id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                  {verified && (
                    <CheckCircle className="w-4 h-4 text-blue-600 fill-current" />
                  )}
                </div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {niche}
                </Badge>
              </div>
              {onToggleSave && (
                <button
                  onClick={onToggleSave}
                  className={`p-2 rounded-lg transition-colors ${
                    isSaved
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6 py-4 border-y border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Followers</p>
              <p className="text-sm font-semibold text-foreground">
                {formatNumber(followers)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Engagement</p>
              <p className="text-sm font-semibold text-primary">{engagement}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Views</p>
              <p className="text-sm font-semibold text-foreground">
                {formatNumber(avgViews)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={profileUrl} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                View Profile
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              onClick={onSendRequest}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            >
              <MessageSquare className="w-4 h-4" />
              Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
