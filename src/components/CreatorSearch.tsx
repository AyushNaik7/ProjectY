'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface CreatorFilters {
  search: string;
  niche: string;
  minFollowers: number;
  maxFollowers: number;
  minEngagement: number;
  verified: boolean | null;
  location: string;
  sortBy: 'followers' | 'engagement' | 'rating' | 'match_score';
}

interface CreatorSearchProps {
  onSearch: (filters: CreatorFilters) => void;
  loading?: boolean;
}

const NICHES = [
  'Fashion',
  'Beauty',
  'Fitness',
  'Food',
  'Travel',
  'Tech',
  'Gaming',
  'Lifestyle',
  'Business',
  'Education',
];

const FOLLOWER_RANGES = [
  { label: 'Any', min: 0, max: 10000000 },
  { label: '1K - 10K (Nano)', min: 1000, max: 10000 },
  { label: '10K - 50K (Micro)', min: 10000, max: 50000 },
  { label: '50K - 100K', min: 50000, max: 100000 },
  { label: '100K - 500K', min: 100000, max: 500000 },
  { label: '500K+ (Macro)', min: 500000, max: 10000000 },
];

export function CreatorSearch({ onSearch, loading }: CreatorSearchProps) {
  const [filters, setFilters] = useState<CreatorFilters>({
    search: '',
    niche: '',
    minFollowers: 0,
    maxFollowers: 10000000,
    minEngagement: 0,
    verified: null,
    location: '',
    sortBy: 'match_score',
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: CreatorFilters = {
      search: '',
      niche: '',
      minFollowers: 0,
      maxFollowers: 10000000,
      minEngagement: 0,
      verified: null,
      location: '',
      sortBy: 'match_score',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const activeFiltersCount = [
    filters.niche,
    filters.minFollowers > 0,
    filters.minEngagement > 0,
    filters.verified !== null,
    filters.location,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search creators by name, niche, or bio..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Creators</SheetTitle>
              <SheetDescription>
                Refine your search with advanced filters
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Niche */}
              <div className="space-y-2">
                <Label>Niche</Label>
                <Select
                  value={filters.niche}
                  onValueChange={(value) => setFilters({ ...filters, niche: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Niches</SelectItem>
                    {NICHES.map((niche) => (
                      <SelectItem key={niche} value={niche}>
                        {niche}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Followers */}
              <div className="space-y-2">
                <Label>Follower Count</Label>
                <Select
                  value={`${filters.minFollowers}-${filters.maxFollowers}`}
                  onValueChange={(value) => {
                    const [min, max] = value.split('-').map(Number);
                    setFilters({ ...filters, minFollowers: min, maxFollowers: max });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOLLOWER_RANGES.map((range) => (
                      <SelectItem key={range.label} value={`${range.min}-${range.max}`}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Engagement Rate */}
              <div className="space-y-2">
                <Label>Minimum Engagement Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={filters.minEngagement}
                  onChange={(e) =>
                    setFilters({ ...filters, minEngagement: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Mumbai, Delhi"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                />
              </div>

              {/* Verified */}
              <div className="space-y-2">
                <Label>Verification Status</Label>
                <Select
                  value={filters.verified === null ? 'all' : filters.verified.toString()}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      verified: value === 'all' ? null : value === 'true',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Creators</SelectItem>
                    <SelectItem value="true">Verified Only</SelectItem>
                    <SelectItem value="false">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match_score">Best Match</SelectItem>
                    <SelectItem value="followers">Followers (High to Low)</SelectItem>
                    <SelectItem value="engagement">Engagement Rate</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={() => {
                    handleSearch();
                    setIsOpen(false);
                  }}
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </div>
  );
}
