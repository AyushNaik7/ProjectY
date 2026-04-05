'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/ClerkAuthContext';
import { supabase } from '@/lib/supabase';
import { MessageThread } from '@/components/MessageThread';

interface Conversation {
  id: string;
  campaign_id: string;
  creator_id: string;
  brand_id: string;
  last_message_at: string;
  campaign?: {
    title: string;
  };
  creator?: {
    name: string;
  };
  brand?: {
    company_name: string;
  };
  unread_count?: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && role) {
      fetchConversations();
    }
  }, [user, role, authLoading, router]);

  const fetchConversations = async () => {
    if (!user || !role) return;

    try {
      const column = role === 'creator' ? 'creator_id' : 'brand_id';
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          campaign:campaigns(title),
          creator:creators(name),
          brand:brands(company_name)
        `)
        .eq(column, user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get unread counts
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user.id);

          return { ...conv, unread_count: count || 0 };
        })
      );

      setConversations(conversationsWithUnread);
      
      // Auto-select first conversation
      if (conversationsWithUnread.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsWithUnread[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const otherUserName =
    role === 'creator'
      ? selectedConv?.brand?.company_name || 'Brand'
      : selectedConv?.creator?.name || 'Creator';

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-4 bg-muted/50 border-b">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const displayName =
                  role === 'creator'
                    ? conv.brand?.company_name
                    : conv.creator?.name;
                const isSelected = conv.id === selectedConversation;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">{displayName}</p>
                      {conv.unread_count! > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.campaign?.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="md:col-span-2">
          {selectedConversation ? (
            <MessageThread
              conversationId={selectedConversation}
              otherUserName={otherUserName}
            />
          ) : (
            <div className="flex items-center justify-center h-[600px] border rounded-lg">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
