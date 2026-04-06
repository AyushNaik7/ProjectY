import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      search = '',
      niche = '',
      minFollowers = 0,
      maxFollowers = 10000000,
      minEngagement = 0,
      verified = null,
      location = '',
      sortBy = 'match_score',
      limit = 50,
    } = body;

    let query = supabaseAdmin
      .from('creators')
      .select('*');

    // Text search
    if (search) {
      query = query.or(`name.ilike.%${search}%,niche.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    // Niche filter
    if (niche) {
      query = query.eq('niche', niche);
    }

    // Follower range
    query = query
      .gte('instagram_followers', minFollowers)
      .lte('instagram_followers', maxFollowers);

    // Engagement rate
    if (minEngagement > 0) {
      query = query.gte('engagement_rate', minEngagement);
    }

    // Verified status
    if (verified !== null) {
      query = query.eq('verified', verified);
    }

    // Location
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Sorting
    switch (sortBy) {
      case 'followers':
        query = query.order('instagram_followers', { ascending: false });
        break;
      case 'engagement':
        query = query.order('engagement_rate', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false, nullsFirst: false });
        break;
      case 'match_score':
      default:
        // For match score, we'll calculate it client-side or use a default order
        query = query.order('engagement_rate', { ascending: false });
        break;
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Failed to search creators' },
        { status: 500 }
      );
    }

    return NextResponse.json({ creators: data || [] });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
