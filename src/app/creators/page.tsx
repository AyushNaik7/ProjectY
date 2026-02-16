'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreatorCard } from '@/components/CreatorCard';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

// Mock data
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
  {
    id: '6',
    name: 'Marcus Johnson',
    niche: 'Gaming',
    followers: 920000,
    engagement: 11.3,
    avgViews: 150000,
  },
  {
    id: '7',
    name: 'Priya Singh',
    niche: 'Fashion & Lifestyle',
    followers: 680000,
    engagement: 8.7,
    avgViews: 105000,
  },
  {
    id: '8',
    name: 'David Brown',
    niche: 'Tech Reviews',
    followers: 540000,
    engagement: 9.1,
    avgViews: 82000,
  },
];

export default function FindCreatorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFollowers, setSelectedFollowers] = useState('all');

  const handleSendRequest = (creatorId: string) => {
    console.log('Send request to creator:', creatorId);
  };

  const filteredCreators = mockCreators.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.niche.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      creator.niche.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesFollowers =
      selectedFollowers === 'all' ||
      (selectedFollowers === '100k-500k' &&
        creator.followers >= 100000 &&
        creator.followers < 500000) ||
      (selectedFollowers === '500k-1m' &&
        creator.followers >= 500000 &&
        creator.followers < 1000000) ||
      (selectedFollowers === '1m+' && creator.followers >= 1000000);

    return matchesSearch && matchesCategory && matchesFollowers;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Find Creators</h1>
        <p className="text-muted-foreground">
          Browse and discover creators that match your brand
        </p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or niche..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border/50"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="fashion">Fashion & Lifestyle</SelectItem>
                      <SelectItem value="tech">Tech Reviews</SelectItem>
                      <SelectItem value="beauty">Beauty & Makeup</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="food">Food & Travel</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Followers
                  </label>
                  <Select value={selectedFollowers} onValueChange={setSelectedFollowers}>
                    <SelectTrigger className="border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Followers</SelectItem>
                      <SelectItem value="100k-500k">100K - 500K</SelectItem>
                      <SelectItem value="500k-1m">500K - 1M</SelectItem>
                      <SelectItem value="1m+">1M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <p className="text-sm text-muted-foreground">
          Showing {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Creator Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCreators.map((creator, index) => (
              <CreatorCard
                key={creator.id}
                {...creator}
                onSendRequest={() => handleSendRequest(creator.id)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-2">No creators found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
