'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { CreatorCard } from '@/components/CreatorCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, TrendingUp, Users, Zap } from 'lucide-react';

// Mock data
const mockCampaigns = [
  {
    id: '1',
    title: 'Summer Collection Launch',
    budget: 500000,
    deliverable: 'Instagram Reel',
    status: 'active' as const,
    applications: 12,
    createdAt: '2024-02-10',
  },
  {
    id: '2',
    title: 'Product Review Campaign',
    budget: 300000,
    deliverable: 'YouTube Video',
    status: 'active' as const,
    applications: 8,
    createdAt: '2024-02-08',
  },
  {
    id: '3',
    title: 'Brand Awareness Drive',
    budget: 750000,
    deliverable: 'TikTok Series',
    status: 'closed' as const,
    applications: 25,
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    title: 'Influencer Collaboration',
    budget: 400000,
    deliverable: 'Instagram Post',
    status: 'active' as const,
    applications: 5,
    createdAt: '2024-02-05',
  },
];

const mockCreators = [
  {
    id: '1',
    name: 'Sarah Anderson',
    niche: 'Fashion & Lifestyle',
    followers: 850000,
    engagement: 8.2,
    avgViews: 125000,
  },
  {
    id: '2',
    name: 'Alex Kumar',
    niche: 'Tech Reviews',
    followers: 620000,
    engagement: 9.5,
    avgViews: 95000,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    niche: 'Beauty & Makeup',
    followers: 1200000,
    engagement: 7.8,
    avgViews: 180000,
  },
  {
    id: '4',
    name: 'Raj Patel',
    niche: 'Fitness',
    followers: 450000,
    engagement: 10.2,
    avgViews: 65000,
  },
  {
    id: '5',
    name: 'Lisa Chen',
    niche: 'Food & Travel',
    followers: 780000,
    engagement: 8.9,
    avgViews: 110000,
  },
];

const stats = [
  {
    label: 'Active Campaigns',
    value: '3',
    icon: Zap,
    color: 'text-primary',
  },
  {
    label: 'Total Applications',
    value: '50',
    icon: Users,
    color: 'text-blue-600',
  },
  {
    label: 'Budget Spent',
    value: '₹19.5L',
    icon: TrendingUp,
    color: 'text-green-600',
  },
];

export default function BrandDashboard() {
  const router = useRouter();
  const { user, role, loading, signOut } = useSupabaseAuth();
  const [campaigns] = useState(mockCampaigns);
  const [creators] = useState(mockCreators);

  useEffect(() => {
    if (!loading && (!user || role !== 'brand')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== 'brand') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleSendRequest = (creatorId: string) => {
    console.log('Send request to creator:', creatorId);
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Nike</h1>
        <p className="text-muted-foreground">
          Manage your active campaigns and discover creators
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Primary CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <Link href="/campaigns/new">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Ready to find creators?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Post a new campaign and get matched with relevant creators instantly.
                  </p>
                </div>
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="w-5 h-5" />
                  Post Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Active Campaigns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8"
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>Manage and track all your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Campaign
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Budget
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Deliverable
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Applications
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow
                      key={campaign.id}
                      className="border-border/50 hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="font-medium text-sm">{campaign.title}</TableCell>
                      <TableCell className="text-sm">₹{(campaign.budget / 100000).toFixed(1)}L</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {campaign.deliverable}
                      </TableCell>
                      <TableCell className="text-sm font-medium">{campaign.applications}</TableCell>
                      <TableCell>
                        <Badge
                          variant={campaign.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {campaign.status === 'active' ? '🟢 Active' : '⚫ Closed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Suggested Creators */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-1">Suggested Creators</h2>
          <p className="text-sm text-muted-foreground">
            Creators matched to your campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.slice(0, 6).map((creator, index) => (
            <CreatorCard
              key={creator.id}
              {...creator}
              onSendRequest={() => handleSendRequest(creator.id)}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
