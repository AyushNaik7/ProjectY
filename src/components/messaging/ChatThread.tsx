"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Send, Paperclip, Loader2 } from "lucide-react";
import type { MessageWithSender } from "@/types/messaging";
import { useAuth } from "@/context/ClerkAuthContext";

interface ChatThreadProps {
  conversationId: string;
  messages: MessageWithSender[];
  otherPartyName: string;
  onSendMessage: (content: string) => Promise<void>;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function ChatThread({
  conversationId,
  messages,
  otherPartyName,
  onSendMessage,
  onLoadMore,
  hasMore,
  isLoading,
}: ChatThreadProps) {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(messageText.trim());
      setMessageText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    // Auto-grow textarea
    e.target.style.height = "auto";
    const newHeight = Math.min(e.target.scrollHeight, 120); // Max 4 lines
    e.target.style.height = `${newHeight}px`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const groupedMessages = messages.reduce((groups, message, index) => {
    const prevMessage = messages[index - 1];
    const isNewGroup =
      !prevMessage || prevMessage.sender_id !== message.sender_id;
    
    if (isNewGroup) {
      groups.push([message]);
    } else {
      groups[groups.length - 1].push(message);
    }
    
    return groups;
  }, [] as MessageWithSender[][]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}

        <AnimatePresence initial={false}>
          {groupedMessages.map((group, groupIndex) => {
            const isOwnMessage = group[0].sender_id === user?.id;
            
            return (
              <motion.div
                key={group[0].id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                className={cn(
                  "flex gap-3",
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar - only show for first message in group */}
                {!isOwnMessage && (
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-muted text-xs">
                      {getInitials(group[0].sender_name)}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Messages */}
                <div
                  className={cn(
                    "flex flex-col gap-1 max-w-[70%]",
                    isOwnMessage && "items-end"
                  )}
                >
                  {/* Sender name - only for first message in group */}
                  {!isOwnMessage && (
                    <span className="text-xs text-muted-foreground px-3">
                      {group[0].sender_name}
                    </span>
                  )}

                  {group.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "rounded-2xl px-4 py-2",
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  ))}

                  {/* Timestamp - only for last message in group */}
                  <span className="text-xs text-muted-foreground px-3">
                    {formatTimestamp(group[group.length - 1].created_at)}
                  </span>
                </div>

                {/* Spacer for own messages */}
                {isOwnMessage && <div className="w-8 shrink-0" />}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            disabled
            title="File attachment (coming soon)"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />

          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            size="icon"
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
