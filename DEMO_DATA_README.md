# Demo Data Setup for InstaCollab

This guide explains how to populate your InstaCollab database with realistic demo data for testing and demonstration purposes.

## Overview

The demo data includes:
- **50 Demo Creators** - Diverse Instagram influencers across multiple niches
- **50 Demo Campaigns** - Realistic brand campaigns from 20 different brands
- **20 Demo Brands** - Various companies across different industries

## Files

1. `DEMO_DATA_CREATORS.sql` - 50 Instagram creators with realistic profiles
2. `DEMO_DATA_CAMPAIGNS.sql` - 20 brands + 50 active campaigns

## Creator Demographics

### By Niche:
- **Fashion & Lifestyle**: 10 creators (250K - 580K followers)
- **Beauty & Skincare**: 10 creators (155K - 520K followers)
- **Fitness & Health**: 10 creators (145K - 420K followers)
- **Food & Travel**: 10 creators (185K - 550K followers)
- **Tech & Lifestyle**: 10 creators (145K - 620K followers)

### Follower Distribution:
- **Micro (50K-100K)**: 5 creators
- **Mid-tier (100K-250K)**: 20 creators
- **Macro (250K-500K)**: 20 creators
- **Mega (500K+)**: 5 creators

### Engagement Rates:
- Range: 3.2% - 6.4%
- Average: ~4.8%
- All realistic for Instagram influencers

### Verification Status:
- **Verified**: 35 creators (70%)
- **Unverified**: 15 creators (30%)

## Campaign Demographics

### By Industry:
- **Fashion**: 10 campaigns (₹45K - ₹150K)
- **Beauty**: 10 campaigns (₹40K - ₹120K)
- **Fitness**: 10 campaigns (₹55K - ₹120K)
- **Food & Travel**: 10 campaigns (₹45K - ₹250K)
- **Tech & Lifestyle**: 10 campaigns (₹50K - ₹200K)

### Budget Distribution:
- **Small (₹40K-60K)**: 15 campaigns
- **Medium (₹60K-100K)**: 20 campaigns
- **Large (₹100K-150K)**: 10 campaigns
- **Premium (₹150K+)**: 5 campaigns

### Deliverable Types:
- Instagram Post + Story
- Instagram Reel
- Instagram Reel + Post
- Instagram Story Series
- Mixed combinations

## Installation Instructions

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `DEMO_DATA_CREATORS.sql`
5. Click **Run** to execute
6. Create another new query
7. Copy and paste the contents of `DEMO_DATA_CAMPAIGNS.sql`
8. Click **Run** to execute

### Option 2: Using Supabase CLI

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run the SQL files
supabase db execute --file DEMO_DATA_CREATORS.sql
supabase db execute --file DEMO_DATA_CAMPAIGNS.sql
```

### Option 3: Using psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# Run the SQL files
\i DEMO_DATA_CREATORS.sql
\i DEMO_DATA_CAMPAIGNS.sql
```

## Verification

After running the scripts, verify the data was inserted correctly:

```sql
-- Check creators count
SELECT COUNT(*) FROM creators WHERE id LIKE 'demo-creator-%';
-- Expected: 50

-- Check brands count
SELECT COUNT(*) FROM brands WHERE id LIKE 'demo-brand-%';
-- Expected: 20

-- Check campaigns count
SELECT COUNT(*) FROM campaigns WHERE id LIKE 'demo-campaign-%';
-- Expected: 50

-- View creator distribution by niche
SELECT niche, COUNT(*) as count, 
       AVG(instagram_followers) as avg_followers,
       AVG(instagram_engagement) as avg_engagement
FROM creators 
WHERE id LIKE 'demo-creator-%'
GROUP BY niche
ORDER BY count DESC;

-- View campaign distribution by niche
SELECT niche, COUNT(*) as count,
       AVG(budget) as avg_budget
FROM campaigns 
WHERE id LIKE 'demo-campaign-%'
GROUP BY niche
ORDER BY count DESC;

-- View active campaigns with brand info
SELECT c.title, b.name as brand_name, c.budget, c.niche, c.deliverable_type
FROM campaigns c
JOIN brands b ON c.brand_id = b.id
WHERE c.id LIKE 'demo-campaign-%'
ORDER BY c.budget DESC
LIMIT 10;
```

## Demo Data Features

### Realistic Creator Profiles
- ✅ Authentic Indian names
- ✅ Realistic Instagram handles
- ✅ Diverse locations across India
- ✅ Varied follower counts and engagement rates
- ✅ Niche-appropriate bios
- ✅ Mix of verified and unverified accounts

### Realistic Campaigns
- ✅ Industry-appropriate campaign titles
- ✅ Detailed descriptions with clear requirements
- ✅ Realistic budgets based on deliverables
- ✅ Proper target audience definitions
- ✅ Varied timelines (1 week to 1 month)
- ✅ All campaigns set to "active" status

### Brand Diversity
- ✅ 20 different brands across industries
- ✅ Fashion, Beauty, Fitness, Tech, Travel, Food, Lifestyle
- ✅ Mix of D2C, retail, and service brands
- ✅ Realistic company names and websites

## Testing Scenarios

With this demo data, you can test:

1. **Creator Discovery**
   - Search by niche
   - Filter by follower count
   - Filter by engagement rate
   - Filter by verification status

2. **Campaign Matching**
   - AI matching algorithm
   - Budget-based filtering
   - Niche alignment
   - Follower requirement matching

3. **User Flows**
   - Brand browsing creators
   - Creator browsing campaigns
   - Sending collaboration requests
   - Campaign application process

4. **Analytics & Reporting**
   - Campaign performance metrics
   - Creator statistics
   - Budget analysis
   - Niche distribution

## Cleanup

To remove all demo data:

```sql
-- Remove demo campaigns
DELETE FROM campaigns WHERE id LIKE 'demo-campaign-%';

-- Remove demo brands
DELETE FROM brands WHERE id LIKE 'demo-brand-%';

-- Remove demo creators
DELETE FROM creators WHERE id LIKE 'demo-creator-%';
```

## Notes

- All demo emails use `@demo.com` domain
- All IDs are prefixed with `demo-` for easy identification
- Creator passwords are NOT set (these are data-only records)
- All campaigns are set to "active" status
- Timestamps use `NOW()` for current insertion time

## Support

If you encounter any issues:
1. Check that your database schema matches the expected structure
2. Verify you have the required tables: `creators`, `brands`, `campaigns`
3. Ensure you have proper permissions to insert data
4. Check for any foreign key constraints that might need adjustment

## Next Steps

After loading demo data:
1. Test the creator discovery page
2. Test the campaign listing page
3. Test the AI matching functionality
4. Create test collaboration requests
5. Verify the dashboard displays correctly

---

**Note**: This is demo data for testing purposes only. Do not use in production with real users.
