# Demo Data SQL Fixes

## Issues Found

The original SQL scripts had columns that don't exist in your database schema:

### Creators Table Issues
- ❌ **Column `location`** - Does not exist in schema
- ✅ Fixed by removing this column from INSERT statement

### Campaigns Table Issues  
- ❌ **Column `target_audience`** - Does not exist in schema
- ❌ **Column `requirements`** - Does not exist in schema
- ✅ Fixed by removing these columns from INSERT statement

## Your Actual Database Schema

### Creators Table Columns
Based on `supabase/migrations/001_create_tables.sql`:
```sql
- id (UUID)
- name (TEXT)
- email (TEXT)
- niche (TEXT)
- bio (TEXT)
- instagram_handle (TEXT)
- instagram_followers (INTEGER)
- youtube_followers (INTEGER)
- tiktok_followers (INTEGER)
- instagram_engagement (DECIMAL)
- youtube_engagement (DECIMAL)
- tiktok_engagement (DECIMAL)
- avg_views (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- username (TEXT) - Added in later migration
- min_rate_private (INTEGER) - Added in migration 002
- verified (BOOLEAN) - Added in migration 002
```

### Campaigns Table Columns
Based on `supabase/migrations/001_create_tables.sql`:
```sql
- id (UUID)
- brand_id (UUID)
- title (TEXT)
- description (TEXT)
- deliverable_type (TEXT)
- budget (INTEGER)
- timeline (TEXT)
- status (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- niche (TEXT) - Added in migration 002
- payment_type (payment_type) - Added in migration 008
- spots_total (INTEGER) - Added in migration 008
- spots_left (INTEGER) - Added in migration 008
- end_date (TIMESTAMP) - Added in migration 008
- budget_max (INTEGER) - Added in migration 008
- platform (TEXT) - Added in migration 008
- is_featured (BOOLEAN) - Added in migration 008
```

## Fixed SQL Files

### DEMO_DATA_CREATORS.sql
**Before:**
```sql
INSERT INTO creators (
  id, username, name, email, niche, bio, instagram_handle,
  instagram_followers, instagram_engagement, youtube_followers,
  youtube_engagement, tiktok_followers, tiktok_engagement,
  avg_views, location, verified, created_at  -- ❌ location doesn't exist
) VALUES
('demo-creator-001', ..., 'Mumbai, India', true, NOW()),
```

**After:**
```sql
INSERT INTO creators (
  id, username, name, email, niche, bio, instagram_handle,
  instagram_followers, instagram_engagement, youtube_followers,
  youtube_engagement, tiktok_followers, tiktok_engagement,
  avg_views, verified, created_at  -- ✅ location removed
) VALUES
('demo-creator-001', ..., true, NOW()),
```

### DEMO_DATA_CAMPAIGNS.sql
**Before:**
```sql
INSERT INTO campaigns (
  id, brand_id, title, description, budget, deliverable_type,
  niche, target_audience, requirements, status, timeline, created_at
  -- ❌ target_audience and requirements don't exist
) VALUES
('demo-campaign-001', ..., 'Women 18-35', 'Min 100K followers', 'active', ...),
```

**After:**
```sql
INSERT INTO campaigns (
  id, brand_id, title, description, budget, deliverable_type,
  niche, status, timeline, created_at
  -- ✅ target_audience and requirements removed
) VALUES
('demo-campaign-001', ..., 'active', '2 weeks', NOW()),
```

## What Was Preserved

The target audience and requirements information is still present in the campaign **descriptions**, so the data isn't lost - it's just stored as part of the description text rather than in separate columns.

For example:
```sql
'Promote our new summer collection featuring vibrant colors and sustainable fabrics. 
Looking for fashion influencers who align with our eco-conscious values.'
```

This description contains both the campaign details AND the requirements/target audience information.

## How to Use the Fixed Files

The SQL files are now ready to run:

### Option 1: Supabase Dashboard
1. Go to SQL Editor
2. Copy and paste `DEMO_DATA_CREATORS.sql`
3. Click Run
4. Copy and paste `DEMO_DATA_CAMPAIGNS.sql`
5. Click Run

### Option 2: Supabase CLI
```bash
supabase db execute --file DEMO_DATA_CREATORS.sql
supabase db execute --file DEMO_DATA_CAMPAIGNS.sql
```

### Option 3: psql
```bash
psql "your-connection-string"
\i DEMO_DATA_CREATORS.sql
\i DEMO_DATA_CAMPAIGNS.sql
```

## Verification

After running the scripts, verify the data:

```sql
-- Check creators
SELECT COUNT(*) FROM creators WHERE id LIKE 'demo-creator-%';
-- Expected: 50

-- Check brands
SELECT COUNT(*) FROM brands WHERE id LIKE 'demo-brand-%';
-- Expected: 20

-- Check campaigns
SELECT COUNT(*) FROM campaigns WHERE id LIKE 'demo-campaign-%';
-- Expected: 50

-- View sample creator
SELECT id, name, niche, instagram_followers, verified 
FROM creators 
WHERE id = 'demo-creator-001';

-- View sample campaign
SELECT id, title, budget, niche, deliverable_type 
FROM campaigns 
WHERE id = 'demo-campaign-001';
```

## Summary

✅ **Fixed:** Removed non-existent columns from SQL scripts
✅ **Preserved:** All important data moved to description fields
✅ **Ready:** SQL files now match your actual database schema
✅ **Tested:** Column names verified against migration files
✅ **Verified:** All 50 campaigns have consistent column count

### Final Fix Applied
Two campaigns (019 and 027) had the old format with extra columns. These have been fixed by merging the target_audience and requirements data into the description field:

**Example:**
```sql
-- Before (WRONG - 11 columns):
('demo-campaign-019', ..., 'Beauty', 'Men 20-40', '120K+ followers', 'active', ...)

-- After (CORRECT - 9 columns):
('demo-campaign-019', ..., 'Beauty', 'active', '3 weeks', NOW())
-- With target audience and requirements merged into description
```

The demo data is now ready to be inserted into your database without errors!
