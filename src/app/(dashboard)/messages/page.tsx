"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ChatThread } from "@/components/messaging/ChatThread";
import { useAuth } from "@/context/ClerkAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";
import type {
  ConversationWithDetails,
  MessageWithSender,
} from "@/types/messaging";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MessagesPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<ConversationWithDetails[]>(
    []
  );
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagesCursor, setMessagesCursor] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [toast]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(
    async (conversationId: string, cursor?: string) => {
      setIsLoadingMessages(true);
      try {
        const url = new URL(
          `/api/conversations/${conversationId}/messages`,
          window.location.origin
        );
        if (cursor) url.searchParams.set("cursor", cursor);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Failed to fetch messages");

        const data = await response.json();
        
        if (cursor) {
          // Append older messages
          setMessages((prev) => [...prev, ...data.messages]);
        } else {
          // Replace with new messages
          setMessages(data.messages.reverse());
        }
        
        setHasMoreMessages(data.hasMore);
        setMessagesCursor(data.nextCursor);

        // Mark as read
        await fetch(`/api/conversations/${conversationId}/read`, {
          method: "PATCH",
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [toast]
  );

  // Send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId) return;

      try {
        const response = await fetch(
          `/api/conversations/${activeConversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          }
        );

        if (!response.ok) throw new Error("Failed to send message");

        const data = await response.json();
        // Message will be added via realtime subscription
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        throw error;
      }
    },
    [activeConversationId, toast]
  );

  // Select conversation
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId);
      setMessages([]);
      setMessagesCursor(null);
      fetchMessages(conversationId);
    },
    [fetchMessages]
  );

  // Load more messages
  const handleLoadMore = useCallback(() => {
    if (activeConversationId && messagesCursor && !isLoadingMessages) {
      fetchMessages(activeConversationId, messagesCursor);
    }
  }, [activeConversationId, messagesCursor, isLoadingMessages, fetchMessages]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: activeConversationId
            ? `conversation_id=eq.${activeConversationId}`
            : undefined,
        },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages((prev) => [...prev, newMessage]);
          
          // Update conversation list
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsChannel = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      conversationsChannel.unsubscribe();
    };
  }, [user, activeConversationId, fetchConversations]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <h1 className="text-2xl font-semibold">Messages</h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations list - desktop */}
        <div className="hidden md:block w-80 border-r border-border bg-background">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId || undefined}
              onSelectConversation={handleSelectConversation}
            />
          )}
        </div>

        {/* Chat thread */}
        <div className="flex-1 bg-background">
          {activeConversation ? (
            <div className="h-full flex flex-col">
              {/* Thread header */}
              <div className="border-b border-border px-6 py-4">
                <h2 className="font-medium">
                  {activeConversation.other_party_name}
                </h2>
                {activeConversation.campaign_title && (
                  <p className="text-sm text-muted-foreground">
                    {activeConversation.campaign_title}
                  </p>
                )}
              </div>

              {/* Messages */}
              <ChatThread
                conversationId={activeConversation.id}
                messages={messages}
                otherPartyName={activeConversation.other_party_name}
                onSendMessage={handleSendMessage}
                onLoadMore={handleLoadMore}
                hasMore={hasMoreMessages}
                isLoading={isLoadingMessages}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
