# Supabase Setup Guide for CreatorDeal

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `creatordeal`
   - Database Password: Create a strong password
   - Region: Choose closest to your users
5. Click "Create new project" and wait for it to initialize

## Step 2: Get Your Credentials

1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Add Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Paste your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Step 4: Create Database Tables

Go to Supabase Dashboard → SQL Editor and run these queries:

### Create Creators Table
```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  niche TEXT NOT NULL,
  bio TEXT,
  instagram_handle TEXT,
  instagram_followers INTEGER,
  youtube_followers INTEGER,
  tiktok_followers INTEGER,
  instagram_engagement DECIMAL,
  youtube_engagement DECIMAL,
  tiktok_engagement DECIMAL,
  avg_views INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Create Brands Table
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Create Campaigns Table
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  budget INTEGER NOT NULL,
  timeline TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Create Collaboration Requests Table
```sql
CREATE TABLE collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Step 5: Enable Row Level Security (RLS)

For each table, go to Authentication → Policies and set up RLS:

1. Enable RLS on all tables
2. Create policies for:
   - Creators can read their own data
   - Brands can read their own data
   - Public read access for browsing (optional)

## Step 6: Test Connection

Run your app:
```bash
npm run dev
```

The Supabase client should initialize without errors.

## Available Services

### Creators Service (`src/lib/services/creators.ts`)
- `getAllCreators()` - Get all creators
- `getCreatorById(id)` - Get specific creator
- `getCreatorsByNiche(niche)` - Filter by niche
- `createCreator(data)` - Create new creator
- `updateCreator(id, updates)` - Update creator
- `deleteCreator(id)` - Delete creator
- `searchCreators(query)` - Search creators

### Brands Service (`src/lib/services/brands.ts`)
- `getAllBrands()` - Get all brands
- `getBrandById(id)` - Get specific brand
- `createBrand(data)` - Create new brand
- `updateBrand(id, updates)` - Update brand
- `deleteBrand(id)` - Delete brand

### Campaigns Service (`src/lib/services/campaigns.ts`)
- `getAllCampaigns()` - Get all campaigns
- `getCampaignsByBrand(brandId)` - Get brand's campaigns
- `getCampaignById(id)` - Get specific campaign
- `getActiveCampaigns()` - Get active campaigns only
- `createCampaign(data)` - Create new campaign
- `updateCampaign(id, updates)` - Update campaign
- `deleteCampaign(id)` - Delete campaign

### Requests Service (`src/lib/services/requests.ts`)
- `getAllRequests()` - Get all requests
- `getRequestsByBrand(brandId)` - Get brand's requests
- `getRequestsByCreator(creatorId)` - Get creator's requests
- `createRequest(data)` - Create new request
- `updateRequestStatus(id, status)` - Update request status
- `deleteRequest(id)` - Delete request
- `getPendingRequestsForCreator(creatorId)` - Get pending requests

## Usage Example

```typescript
import { getAllCreators, createCampaign } from '@/lib/services';

// Get all creators
const creators = await getAllCreators();

// Create a campaign
const campaign = await createCampaign({
  brand_id: 'brand-uuid',
  title: 'Summer Campaign',
  description: 'Launch our summer collection',
  deliverable_type: 'Instagram Reel',
  budget: 50000,
  timeline: '7 days',
  status: 'active'
});
```

## Troubleshooting

### Missing environment variables
- Make sure `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding env vars

### Connection errors
- Check your Supabase project is active
- Verify credentials are correct
- Check network connectivity

### RLS policy errors
- Make sure RLS policies are set up correctly
- Check user authentication is working
- Verify policy conditions match your use case
