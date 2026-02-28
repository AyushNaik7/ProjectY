-- ============================================
-- Supabase Migration: Support Clerk User IDs
-- ============================================
-- This migration changes ID columns from UUID to TEXT
-- to support Clerk's user ID format (e.g., user_xxxxx)

-- 1. Drop existing foreign key constraints
ALTER TABLE IF EXISTS campaigns 
  DROP CONSTRAINT IF EXISTS campaigns_brand_id_fkey;

ALTER TABLE IF EXISTS collaboration_requests 
  DROP CONSTRAINT IF EXISTS collaboration_requests_creator_id_fkey,
  DROP CONSTRAINT IF EXISTS collaboration_requests_brand_id_fkey;

ALTER TABLE IF EXISTS saved_campaigns
  DROP CONSTRAINT IF EXISTS saved_campaigns_user_id_fkey,
  DROP CONSTRAINT IF EXISTS saved_campaigns_campaign_id_fkey;

ALTER TABLE IF EXISTS saved_creators
  DROP CONSTRAINT IF EXISTS saved_creators_user_id_fkey,
  DROP CONSTRAINT IF EXISTS saved_creators_creator_id_fkey;

-- 2. Change ID columns to TEXT
ALTER TABLE creators 
  ALTER COLUMN id TYPE TEXT;

ALTER TABLE brands 
  ALTER COLUMN id TYPE TEXT;

-- 3. Change foreign key columns to TEXT
ALTER TABLE campaigns 
  ALTER COLUMN brand_id TYPE TEXT;

ALTER TABLE collaboration_requests 
  ALTER COLUMN creator_id TYPE TEXT,
  ALTER COLUMN brand_id TYPE TEXT;

ALTER TABLE saved_campaigns
  ALTER COLUMN user_id TYPE TEXT,
  ALTER COLUMN campaign_id TYPE TEXT;

ALTER TABLE saved_creators
  ALTER COLUMN user_id TYPE TEXT,
  ALTER COLUMN creator_id TYPE TEXT;

-- 4. Recreate foreign key constraints
ALTER TABLE campaigns 
  ADD CONSTRAINT campaigns_brand_id_fkey 
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

ALTER TABLE collaboration_requests 
  ADD CONSTRAINT collaboration_requests_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE,
  ADD CONSTRAINT collaboration_requests_brand_id_fkey 
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

ALTER TABLE saved_campaigns
  ADD CONSTRAINT saved_campaigns_campaign_id_fkey 
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

ALTER TABLE saved_creators
  ADD CONSTRAINT saved_creators_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES creators(id) ON DELETE CASCADE;

-- 5. Update RLS policies if needed
-- Make sure your RLS policies use auth.uid() or allow public access as needed
-- Example: Allow users to read their own data
-- CREATE POLICY "Users can read own creator profile" ON creators
--   FOR SELECT USING (true);  -- Adjust based on your security needs

-- 6. Clean up any existing Supabase Auth users (optional)
-- Only run this if you want to remove old Supabase auth data
-- DELETE FROM auth.users;

-- Done! Your database now supports Clerk user IDs
