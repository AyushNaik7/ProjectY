'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Instagram, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface CreatorData {
  id: string;
  name: string;
  niche: string;
  instagram_handle: string;
  followers: number;
  engagement_rate: number;
  avg_views: number;
  bio: string;
  audience_age_group?: string;
  audience_gender?: string;
  audience_location?: string;
}

export default function CreatorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user, role, loading: authLoading } = useSupabaseAuth();
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const creatorId = params?.id as string;

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || role !== 'brand')) {
      router.push('/login');
    }
  }, [user, role, authLoading, router]);

  // Load creator data
  useEffect(() => {
    if (!creatorId) return;

    const loadCreator = async () => {
      try {
        setLoading(true);
        setError('');

        const { data, error: fetchError } = await supabase
          .from('creators')
          .select('id, name, niche, instagram_handle, followers, engagement_rate, avg_views, bio, audience_age_group, audience_gender, audience_location')
          .eq('id', creatorId)
          .single();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Creator not found');
          return;
        }

        setCreatorData(data);
      } catch (err) {
        console.error('Failed to load creator:', err);
        setError('Failed to load creator profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCreator();
  }, [creatorId]);

  const handleSendRequest = () => {
    if (!creatorData) return;
    console.log('Send collaboration request to:', creatorData.name);
    // TODO: Implement request modal/dialog
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
          {loading ? (
            <>
              <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </>
          ) : error ? (
            <>
              <h1 className="text-3xl font-bold text-foreground">Creator Not Found</h1>
              <p className="text-muted-foreground">{error}</p>
            </>
          ) : creatorData ? (
            <>
              <h1 className="text-3xl font-bold text-foreground">{creatorData.name}</h1>
              <p className="text-muted-foreground">{creatorData.niche}</p>
            </>
          ) : null}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading creator profile...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-6">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Error loading creator</p>
            <p className="text-sm text-destructive/80">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      )}

      {/* Profile Content */}
      {creatorData && !loading && (
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
                      <p className="text-muted-foreground max-w-2xl">{creatorData.bio || 'No bio available'}</p>
                    </div>
                  </div>

                  {creatorData.instagram_handle && (
                    <div className="flex items-center gap-2 mb-6">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <a
                        href={`https://instagram.com/${creatorData.instagram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {creatorData.instagram_handle}
                      </a>
                    </div>
                  )}

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
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Followers</p>
                    <p className="text-xl font-bold text-foreground">
                      {creatorData.followers >= 1000000
                        ? `${(creatorData.followers / 1000000).toFixed(1)}M`
                        : creatorData.followers >= 1000
                        ? `${(creatorData.followers / 1000).toFixed(0)}K`
                        : creatorData.followers}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                    <p className="text-xl font-bold text-foreground">{creatorData.engagement_rate}%</p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Avg Views</p>
                    <p className="text-xl font-bold text-foreground">
                      {creatorData.avg_views >= 1000000
                        ? `${(creatorData.avg_views / 1000000).toFixed(1)}M`
                        : creatorData.avg_views >= 1000
                        ? `${(creatorData.avg_views / 1000).toFixed(0)}K`
                        : creatorData.avg_views}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Verified</p>
                    <p className="text-xl font-bold text-primary">✓</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Audience Info */}
            {(creatorData.audience_age_group || creatorData.audience_gender || creatorData.audience_location) && (
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
                    {creatorData.audience_age_group && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Age Group</p>
                        <p className="text-sm font-semibold text-foreground">
                          {creatorData.audience_age_group}
                        </p>
                      </div>
                    )}
                    {creatorData.audience_gender && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Gender</p>
                        <p className="text-sm font-semibold text-foreground">
                          {creatorData.audience_gender}
                        </p>
                      </div>
                    )}
                    {creatorData.audience_location && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Primary Locations</p>
                        <p className="text-sm font-semibold text-foreground">
                          {creatorData.audience_location}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
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
                    {creatorData.followers >= 1000000
                      ? `${(creatorData.followers / 1000000).toFixed(2)}M`
                      : `${(creatorData.followers / 1000).toFixed(0)}K`}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Engagement Rate</p>
                  <p className="text-2xl font-bold text-primary">{creatorData.engagement_rate}%</p>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Avg Views</p>
                  <p className="text-2xl font-bold text-foreground">
                    {creatorData.avg_views >= 1000000
                      ? `${(creatorData.avg_views / 1000000).toFixed(1)}M`
                      : `${(creatorData.avg_views / 1000).toFixed(0)}K`}
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
      )}
