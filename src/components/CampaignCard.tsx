'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bookmark } from 'lucide-react';

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
  isSaved?: boolean;
  onToggleSave?: () => void;
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
  isSaved = false,
  onToggleSave,
}: CampaignCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 group">
        <CardContent className="p-6 relative">
          {/* Animated gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <motion.h3 
                    className="text-lg font-semibold text-foreground"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {brandName}
                  </motion.h3>
                  <Badge variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{deliverable}</p>
              </div>
              <div className="flex items-center gap-2">
                {onToggleSave && (
                  <motion.button
                    onClick={onToggleSave}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-lg transition-colors ${
                      isSaved
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <motion.div
                      animate={isSaved ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </motion.div>
                  </motion.button>
                )}
                <motion.div 
                  className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-sm font-bold text-primary">{matchScore}%</span>
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-border/50">
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-muted-foreground mb-1">Budget</p>
                <p className="text-sm font-semibold text-foreground">
                  ₹{budgetMin.toLocaleString()} - ₹{budgetMax.toLocaleString()}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                <p className="text-sm font-semibold text-foreground">{timeline}</p>
              </motion.div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onApply}
                className="w-full gap-2 bg-primary hover:bg-primary/90 group/btn"
              >
                Apply Now
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
