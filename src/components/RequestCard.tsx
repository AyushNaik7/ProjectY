'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

interface RequestCardProps {
  id: string;
  campaignTitle: string;
  brandName: string;
  status: 'pending' | 'accepted' | 'rejected';
  onAccept?: () => void;
  onReject?: () => void;
  onMessage?: () => void;
  index: number;
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'outline' as const },
  accepted: { label: 'Accepted', variant: 'success' as const },
  rejected: { label: 'Rejected', variant: 'destructive' as const },
};

export function RequestCard({
  id,
  campaignTitle,
  brandName,
  status,
  onAccept,
  onReject,
  onMessage,
  index,
}: RequestCardProps) {
  const config = statusConfig[status];

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
            <Badge variant={config.variant} className="text-xs">
              {config.label}
            </Badge>
          </div>

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
              <Button
                size="sm"
                variant="outline"
                onClick={onMessage}
                className="w-full gap-2 text-xs"
              >
                <MessageCircle className="w-3 h-3" />
                Message
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
