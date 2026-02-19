'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CollaborationRequest {
  id: string;
  creator_name: string;
  campaign_title: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

type TabType = 'all' | 'pending' | 'accepted' | 'rejected';

export default function RequestsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useSupabaseAuth();
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || role !== 'brand')) {
      router.push('/login');
    }
  }, [user, role, authLoading, router]);

  // Fetch requests from database
  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError('');

        const { data, error: fetchError } = await supabase
          .from('requests')
          .select('id, creator_name, campaign_title, status, created_at')
          .eq('brand_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        if (data) {
          const formattedRequests: CollaborationRequest[] = data.map((req: any) => ({
            id: req.id,
            creator_name: req.creator_name,
            campaign_title: req.campaign_title,
            status: req.status,
            created_at: req.created_at,
          }));
          setRequests(formattedRequests);
        } else {
          setRequests([]);
        }
      } catch (err) {
        console.error('Failed to load requests:', err);
        setError('Failed to load requests. Please try again.');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const handleOpenWhatsApp = (creatorName: string) => {
    window.open('https://wa.me/919876543210', '_blank');
  };

  const filteredRequests = requests.filter((request) => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All', count: requests.length },
    {
      id: 'pending',
      label: 'Pending',
      count: requests.filter((r) => r.status === 'pending').length,
    },
    {
      id: 'accepted',
      label: 'Accepted',
      count: requests.filter((r) => r.status === 'accepted').length,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: requests.filter((r) => r.status === 'rejected').length,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'accepted':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳ Pending';
      case 'accepted':
        return '✓ Accepted';
      case 'rejected':
        return '✕ Rejected';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Collaboration Requests</h1>
        <p className="text-muted-foreground">
          Track all your sent collaboration requests to creators
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Failed to load requests</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your requests...</p>
          </div>
        </div>
      )}

      {/* Tabs and Content */}
      {!loading && (
        <>
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex gap-2 border-b border-border/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-secondary px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Requests List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {request.creator_name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs border ${getStatusColor(request.status)}`}
                            >
                              {getStatusLabel(request.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Campaign: {request.campaign_title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sent on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {request.status === 'accepted' && (
                          <Button
                            onClick={() => handleOpenWhatsApp(request.creator_name)}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Continue on WhatsApp
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-2">No requests found</p>
                  <p className="text-sm text-muted-foreground">
                    {requests.length === 0
                      ? 'You haven\'t sent any collaboration requests yet. Visit the creators page to start.'
                      : 'No requests in this category'}
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
