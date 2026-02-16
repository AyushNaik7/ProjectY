'use client';

import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Instagram, MessageSquare } from 'lucide-react';
import Link from 'next/link';

// Mock creator data
const creatorData = {
  id: '1',
  name: 'Sarah Anderson',
  niche: 'Fashion & Lifestyle',
  instagramHandle: '@sarahfashion',
  followers: 850000,
  engagement: 8.2,
  avgViews: 125000,
  bio: 'Fashion enthusiast, lifestyle blogger, and content creator. Passionate about sustainable fashion and empowering women through style.',
  audience: {
    ageGroup: '18-35',
    gender: '85% Female, 15% Male',
    location: 'India, USA, UK',
  },
  stats: [
    { label: 'Followers', value: '850K' },
    { label: 'Engagement Rate', value: '8.2%' },
    { label: 'Avg Views', value: '125K' },
    { label: 'Posts/Month', value: '12' },
  ],
};

export default function CreatorProfilePage() {
  const router = useRouter();
  const params = useParams();

  const handleSendRequest = () => {
    console.log('Send collaboration request to:', creatorData.name);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-4"
      >
        <Link href="/creators">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{creatorData.name}</h1>
          <p className="text-muted-foreground">{creatorData.niche}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {creatorData.name}
                    </h2>
                    <Badge className="mb-4">{creatorData.niche}</Badge>
                    <p className="text-muted-foreground max-w-2xl">{creatorData.bio}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <a
                    href={`https://instagram.com/${creatorData.instagramHandle.slice(1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {creatorData.instagramHandle}
                  </a>
                </div>

                <Button
                  onClick={handleSendRequest}
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Collaboration Request
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {creatorData.stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Audience Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
                <CardDescription>Creator's audience breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Age Group</p>
                  <p className="text-sm font-semibold text-foreground">
                    {creatorData.audience.ageGroup}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gender</p>
                  <p className="text-sm font-semibold text-foreground">
                    {creatorData.audience.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Primary Locations</p>
                  <p className="text-sm font-semibold text-foreground">
                    {creatorData.audience.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="border-0 shadow-sm sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Total Followers</p>
                <p className="text-2xl font-bold text-foreground">
                  {(creatorData.followers / 1000000).toFixed(2)}M
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                <p className="text-2xl font-bold text-primary">{creatorData.engagement}%</p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Avg Views</p>
                <p className="text-2xl font-bold text-foreground">
                  {(creatorData.avgViews / 1000).toFixed(0)}K
                </p>
              </div>

              <Button
                onClick={handleSendRequest}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                <MessageSquare className="w-4 h-4" />
                Send Request
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
