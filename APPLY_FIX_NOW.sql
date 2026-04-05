-- ============================================
-- URGENT FIX: Make campaign_id nullable
-- ============================================
-- Copy this entire SQL and run it in Supabase Dashboard > SQL Editor
-- This will fix the "null value violates not-null constraint" error

-- Step 1: Make campaign_id nullable
ALTER TABLE collaboration_requests 
  ALTER COLUMN campaign_id DROP NOT NULL;

-- Step 2: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_campaign_id 
  ON collaboration_requests(campaign_id) 
  WHERE campaign_id IS NOT NULL;

-- Step 3: Verify the change
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
  AND column_name = 'campaign_id';

-- You should see: is_nullable = 'YES'
