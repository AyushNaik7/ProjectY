-- ============================================
-- ENSURE ACTIVE CAMPAIGNS EXIST
-- ============================================
-- Run this to make sure there are active campaigns for testing

-- Step 1: Check current status
SELECT 
  'Current Status' as info,
  status,
  COUNT(*) as count
FROM campaigns
GROUP BY status;

-- Step 2: If no active campaigns, activate some draft campaigns
UPDATE campaigns
SET status = 'active'
WHERE status = 'draft'
  AND id IN (
    SELECT id FROM campaigns WHERE status = 'draft' LIMIT 10
  );

-- Step 3: Verify active campaigns now exist
SELECT 
  'After Update' as info,
  status,
  COUNT(*) as count
FROM campaigns
GROUP BY status;

-- Step 4: Show sample active campaigns
SELECT 
  'Sample Active Campaigns' as info,
  id,
  title,
  niche,
  budget,
  status
FROM campaigns
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: If still no campaigns, you need to run DEMO_DATA_CAMPAIGNS.sql
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM campaigns WHERE status = 'active') > 0 
    THEN '✅ Active campaigns exist! Creators should see them now.'
    ELSE '❌ No active campaigns. Run DEMO_DATA_CAMPAIGNS.sql to add demo data.'
  END as final_status;
