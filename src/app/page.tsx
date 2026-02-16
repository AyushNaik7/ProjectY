'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles, Zap, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';

// Mock data
const mockCampaigns = [
  {
    id: '1',
    brandName: 'Nike',
    category: 'Sports',
    deliverable: 'Instagram Reel',
    budgetMin: 50000,
    budgetMax: 100000,
    timeline: '7 days',
    matchScore: 92,
  },
  {
    id: '2',
    brandName: 'Zara',
    category: 'Fashion',
    deliverable: 'TikTok Video',
    budgetMin: 30000,
    budgetMax: 60000,
    timeline: '5 days',
    matchScore: 87,
  },
  {
    id: '3',
    brandName: 'Starbucks',
    category: 'F&B',
    deliverable: 'Instagram Post',
    budgetMin: 25000,
    budgetMax: 50000,
    timeline: '3 days',
    matchScore: 85,
  },
];

const mockRequests = [
  {
    id: '1',
    campaignTitle: 'Summer Collection Launch',
    brandName: 'H&M',
    status: 'pending' as const,
  },
  {
    id: '2',
    campaignTitle: 'Product Review Campaign',
    brandName: 'OnePlus',
    status: 'accepted' as const,
  },
];

const opportunities = [
  {
    title: 'Smart Matching',
    description: 'AI-powered algorithm connects you with brands perfect for your niche',
    icon: Sparkles,
  },
  {
    title: 'Verified Brands',
    description: 'Work only with verified, legitimate premium brands',
    icon: CheckCircle,
  },
  {
    title: 'Instant Payouts',
    description: 'Get paid directly to your account within 48 hours',
    icon: TrendingUp,
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, role, loading, signOut } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== 'creator') {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Collabo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold tracking-tight hidden sm:block">Collabo</span>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut} 
            className="gap-2 text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Find Your <span className="text-blue-600">Perfect</span> Brand Match
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Connect with premium brands, collaborate on authentic campaigns, and earn what you deserve. Your next opportunity is just one click away.
            </p>
            <div className="flex gap-4 mt-8">
              <Link href="/campaigns">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">
                  Explore Campaigns
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/creator">
                <Button variant="outline" className="gap-2 border-slate-300 text-slate-700 px-6 py-2.5">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Creators Love Collabo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {opportunities.map((opp, index) => {
                const Icon = opp.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-lg"
                  >
                    <div className="p-3 rounded-lg bg-blue-100 w-fit mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-2">{opp.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{opp.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Featured Campaigns */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Opportunities</h2>
                <p className="text-slate-600">Top matched campaigns for your niche</p>
              </div>
              <Link href="/campaigns">
                <Button variant="outline" className="gap-2 border-slate-300">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {mockCampaigns.slice(0, 3).map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">{campaign.brandName}</h3>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {campaign.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {campaign.matchScore}% match
                        </span>
                      </div>
                      <p className="text-slate-600 mb-3">{campaign.deliverable} • {campaign.timeline}</p>
                      <p className="font-semibold text-slate-900">
                        ₹{campaign.budgetMin.toLocaleString()} - ₹{campaign.budgetMax.toLocaleString()}
                      </p>
                    </div>
                    <Link href="/campaigns">
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-12 text-center"
          >
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Browse all available campaigns and find the perfect brand to collaborate with
            </p>
            <Link href="/campaigns">
              <Button className="gap-2 bg-white hover:bg-slate-100 text-blue-600 font-semibold px-8 py-2.5">
                Explore All Campaigns
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-slate-600">
            <p>© 2026 Collabo. Connecting creators with opportunities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
