"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Eye, Send, Bookmark, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ActionButtonsProps {
  campaignId: string;
  isSaved: boolean;
  onViewDetails: () => void;
  onSendProposal: () => void;
  onToggleSave: () => void;
  onQuickApply: () => void;
  compact?: boolean;
  className?: string;
}

export function ActionButtons({
  campaignId,
  isSaved,
  onViewDetails,
  onSendProposal,
  onToggleSave,
  onQuickApply,
  compact = false,
  className,
}: ActionButtonsProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button size="sm" onClick={onQuickApply} className="gap-1.5 flex-1">
          <Zap className="w-3.5 h-3.5" />
          Quick Apply
        </Button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSave}
          className={cn(
            "p-2 rounded-lg border transition-colors shrink-0",
            isSaved
              ? "bg-primary/10 border-primary/20 text-primary"
              : "border-border text-muted-foreground hover:bg-muted/50",
          )}
        >
          <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="gap-1.5 text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSendProposal}
          className="gap-1.5 text-xs"
        >
          <Send className="w-3.5 h-3.5" />
          Send Proposal
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" onClick={onQuickApply} className="gap-1.5 text-xs">
          <Zap className="w-3.5 h-3.5" />
          Quick Apply
        </Button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleSave}
          className={cn(
            "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
            isSaved
              ? "bg-primary/10 border-primary/20 text-primary"
              : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
          {isSaved ? "Saved" : "Save"}
        </motion.button>
      </div>
    </div>
  );
}
