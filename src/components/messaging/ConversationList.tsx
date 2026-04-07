"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ConversationWithDetails } from "@/types/messaging";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
        <p className="text-sm text-muted-foreground">
          Start a conversation by connecting with creators or brands
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border/50",
                activeConversationId === conversation.id && "bg-muted"
              )}
            >
              {/* Avatar */}
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(conversation.other_party_name)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {conversation.other_party_name}
                    </h4>
                    {conversation.other_party_handle && (
                      <p className="text-xs text-muted-foreground">
                        @{conversation.other_party_handle}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatTimestamp(conversation.updated_at)}
                  </span>
                </div>

                {conversation.campaign_title && (
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    Campaign: {conversation.campaign_title}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm truncate",
                      conversation.unread_count > 0
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {conversation.last_message_preview || "No messages yet"}
                  </p>
                  {conversation.unread_count > 0 && (
                    <Badge
                      variant="default"
                      className="shrink-0 h-5 min-w-[20px] px-1.5 text-xs"
                    >
                      {conversation.unread_count > 9
                        ? "9+"
                        : conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
