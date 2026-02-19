# Supabase Quick Start Guide

## Your Credentials Are Set! ✅

Your Supabase credentials have been added to `.env.local`:
- **Project URL**: https://ysbaxsczgauyslcbmazy.supabase.co
- **Anon Key**: Configured

## Step 1: Create Database Tables

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire content from `supabase/migrations/001_create_tables.sql`
6. Click **Run** (or press Ctrl+Enter)

The script will create:
- ✅ `creators` table
- ✅ `brands` table
- ✅ `campaigns` table
- ✅ `collaboration_requests` table
- ✅ Indexes for performance
- ✅ Row Level Security policies

## Step 2: Verify Tables Were Created

1. Go to **Table Editor** (left sidebar)
2. You should see all 4 tables listed
3. Click on each table to verify the columns

## Step 3: Test the Connection

Restart your dev server:
```bash
npm run dev
```

The app should now connect to Supabase without errors.

## Step 4: Insert Sample Data (Optional)

Go to **SQL Editor** and run:

```sql
-- Insert sample creators
INSERT INTO creators (name, email, niche, instagram_handle, instagram_followers, instagram_engagement, avg_views) VALUES
('Sarah Anderson', 'sarah@example.com', 'Fashion & Lifestyle', '@sarahfashion', 850000, 8.2, 125000),
('Alex Kumar', 'alex@example.com', 'Tech Reviews', '@alextech', 620000, 9.5, 95000),
('Emma Wilson', 'emma@example.com', 'Beauty & Makeup', '@emmamakeup', 1200000, 7.8, 180000);

-- Insert sample brands
INSERT INTO brands (name, email, industry, description) VALUES
('Nike', 'contact@nike.com', 'Sports', 'Leading sports brand'),
('Zara', 'contact@zara.com', 'Fashion', 'Fashion retailer'),
('Apple', 'contact@apple.com', 'Technology', 'Tech company');
```

## Available Services

Now you can use these services in your code:

```typescript
import { 
  getAllCreators, 
  getCreatorsByNiche,
  getAllBrands,
  getAllCampaigns,
  createCampaign,
  getRequestsByBrand
} from '@/lib/services';

// Example: Get all creators
const creators = await getAllCreators();

// Example: Get creators by niche
const fashionCreators = await getCreatorsByNiche('Fashion & Lifestyle');

// Example: Create a campaign
const campaign = await createCampaign({
  brand_id: 'your-brand-uuid',
  title: 'Summer Campaign',
  description: 'Launch our summer collection',
  deliverable_type: 'Instagram Reel',
  budget: 50000,
  timeline: '7 days',
  status: 'active'
});
```

## Troubleshooting

### Tables not showing up?
- Make sure you ran the SQL query completely
- Check for any error messages in the SQL Editor
- Refresh the page

### Connection errors?
- Verify `.env.local` has the correct credentials
- Restart your dev server
- Check your internet connection

### Need to reset?
Go to **SQL Editor** and run:
```sql
DROP TABLE IF EXISTS collaboration_requests CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS creators CASCADE;
```

Then run the migration again.

## Next Steps

1. ✅ Tables created
2. ✅ Services ready to use
3. 🔄 Integrate services into your pages
4. 🔄 Replace mock data with real database calls
5. 🔄 Set up authentication (optional)

Happy coding! 🚀
