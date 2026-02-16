'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';

// Mock data
const mockRequests = [
  {
    id: '1',
    creatorName: 'Sarah Anderson',
    campaignTitle: 'Summer Collection Launch',
    status: 'pending' as const,
    sentDate: '2024-02-12',
  },
  {
    id: '2',
    creatorName: 'Alex Kumar',
    campaignTitle: 'Product Review Campaign',
    status: 'accepted' as const,
    sentDate: '2024-02-10',
  },
  {
    id: '3',
    creatorName: 'Emma Wilson',
    campaignTitle: 'Brand Awareness Drive',
    status: 'accepted' as const,
    sentDate: '2024-02-08',
  },
  {
    id: '4',
    creatorName: 'Raj Patel',
    campaignTitle: 'Influencer Collaboration',
    status: 'rejected' as const,
    sentDate: '2024-02-05',
  },
  {
    id: '5',
    creatorName: 'Lisa Chen',
    campaignTitle: 'Summer Collection Launch',
    status: 'pending' as const,
    sentDate: '2024-02-12',
  },
];

type TabType = 'all' | 'pending' | 'accepted' | 'rejected';

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const handleOpenWhatsApp = (creatorName: string) => {
    window.open('https://wa.me/919876543210', '_blank');
  };

  const filteredRequests = mockRequests.filter((request) => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const tabs = [
    { id: 'all', label: 'All', count: mockRequests.length },
    {
      id: 'pending',
      label: 'Pending',
      count: mockRequests.filter((r) => r.status === 'pending').length,
    },
    {
      id: 'accepted',
      label: 'Accepted',
      count: mockRequests.filter((r) => r.status === 'accepted').length,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: mockRequests.filter((r) => r.status === 'rejected').length,
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
                          {request.creatorName}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs border ${getStatusColor(request.status)}`}
                        >
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Campaign: {request.campaignTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sent on {new Date(request.sentDate).toLocaleDateString()}
                      </p>
                    </div>

                    {request.status === 'accepted' && (
                      <Button
                        onClick={() => handleOpenWhatsApp(request.creatorName)}
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
                Start by finding creators and sending collaboration requests
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
