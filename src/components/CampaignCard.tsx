'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface CampaignCardProps {
  id: string;
  brandName: string;
  category: string;
  deliverable: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  matchScore: number;
  onApply: () => void;
  index: number;
}

export function CampaignCard({
  id,
  brandName,
  category,
  deliverable,
  budgetMin,
  budgetMax,
  timeline,
  matchScore,
  onApply,
  index,
}: CampaignCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">{brandName}</h3>
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{deliverable}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
              <span className="text-sm font-bold text-primary">{matchScore}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Budget</p>
              <p className="text-sm font-semibold text-foreground">
                ₹{budgetMin.toLocaleString()} - ₹{budgetMax.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Timeline</p>
              <p className="text-sm font-semibold text-foreground">{timeline}</p>
            </div>
          </div>

          <Button
            onClick={onApply}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
