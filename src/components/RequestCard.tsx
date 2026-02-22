'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, CheckCircle, Clock, Loader2, Trophy } from 'lucide-react';

interface RequestCardProps {
  id: string;
  campaignTitle: string;
  brandName: string;
  status: 'pending' | 'accepted' | 'rejected';
  dealStatus?: 'requested' | 'accepted' | 'in_progress' | 'completed';
  onAccept?: () => void;
  onReject?: () => void;
  onMessage?: () => void;
  onUpdateDealStatus?: (newStatus: 'in_progress' | 'completed') => void;
  index: number;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const },
  accepted: { label: 'Accepted', variant: 'success' as const },
  rejected: { label: 'Rejected', variant: 'destructive' as const },
};

const dealStatusConfig = {
  requested: { label: 'Requested', icon: Clock, color: 'text-gray-600 bg-gray-50' },
  accepted: { label: 'Accepted', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  in_progress: { label: 'In Progress', icon: Loader2, color: 'text-yellow-600 bg-yellow-50' },
  completed: { label: 'Completed', icon: Trophy, color: 'text-green-600 bg-green-50' },
};

export function RequestCard({
  id,
  campaignTitle,
  brandName,
  status,
  dealStatus = 'requested',
  onAccept,
  onReject,
  onMessage,
  onUpdateDealStatus,
  index,
}: RequestCardProps) {
  const config = statusConfig[status];
  const dealConfig = dealStatus ? dealStatusConfig[dealStatus] : null;
  const DealIcon = dealConfig?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground text-sm">{campaignTitle}</h4>
              <p className="text-xs text-muted-foreground">{brandName}</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge variant={config.variant} className="text-xs">
                {config.label}
              </Badge>
              {dealConfig && DealIcon && status === 'accepted' && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${dealConfig.color}`}>
                  <DealIcon className="w-3 h-3" />
                  {dealConfig.label}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar for accepted deals */}
          {status === 'accepted' && dealStatus && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {dealStatus === 'requested' && '0%'}
                  {dealStatus === 'accepted' && '25%'}
                  {dealStatus === 'in_progress' && '75%'}
                  {dealStatus === 'completed' && '100%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    dealStatus === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{
                    width:
                      dealStatus === 'requested'
                        ? '0%'
                        : dealStatus === 'accepted'
                        ? '25%'
                        : dealStatus === 'in_progress'
                        ? '75%'
                        : '100%',
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={onAccept}
                  className="flex-1 text-xs"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReject}
                  className="flex-1 text-xs"
                >
                  Reject
                </Button>
              </>
            )}
            {status === 'accepted' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onMessage}
                  className="flex-1 gap-2 text-xs"
                >
                  <MessageCircle className="w-3 h-3" />
                  Message
                </Button>
                {onUpdateDealStatus && dealStatus !== 'completed' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() =>
                      onUpdateDealStatus(
                        dealStatus === 'in_progress' ? 'completed' : 'in_progress'
                      )
                    }
                    className="flex-1 text-xs"
                  >
                    {dealStatus === 'in_progress' ? 'Mark Complete' : 'Start Work'}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
