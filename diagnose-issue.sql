-- ============================================
-- COMPLETE DIAGNOSTIC - Run this FIRST
-- ============================================
-- Copy this entire SQL and run in Supabase SQL Editor
-- This will tell you exactly what's wrong

-- ============================================
-- 1. CHECK DATABASE CONSTRAINT (Send Request Error)
-- ============================================
SELECT 
  '🔍 CONSTRAINT CHECK' as test_name,
  column_name, 
  is_nullable,
  CASE 
    WHEN is_nullable = 'YES' THEN '✅ FIXED - campaign_id can be NULL'
    ELSE '❌ NOT FIXED - Run: ALTER TABLE collaboration_requests ALTER COLUMN campaign_id DROP NOT NULL;'
  END as status
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
  AND column_name = 'campaign_id';

-- ============================================
-- 2. CHECK CAMPAIGNS EXIST
-- ============================================
SELECT 
  '🔍 CAMPAIGNS CHECK' as test_name,
  COUNT(*) as total_campaigns,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_campaigns,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_campaigns,
  CASE 
    WHEN COUNT(CASE WHEN status = 'active' THEN 1 END) > 0 
    THEN '✅ Active campaigns exist'
    ELSE '❌ NO ACTIVE CAMPAIGNS - Run DEMO_DATA_CAMPAIGNS.sql'
  END as status
FROM campaigns;

-- ============================================
-- 3. CHECK CREATORS EXIST
-- ============================================
SELECT 
  '🔍 CREATORS CHECK' as test_name,
  COUNT(*) as total_creators,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Creators exist'
    ELSE '❌ NO CREATORS - Run DEMO_DATA_CREATORS.sql'
  END as status
FROM creators;

-- ============================================
-- 4. CHECK BRANDS EXIST
-- ============================================
SELECT 
  '🔍 BRANDS CHECK' as test_name,
  COUNT(*) as total_brands,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Brands exist'
    ELSE '❌ NO BRANDS - Create a brand account'
  END as status
FROM brands;

-- ============================================
-- 5. CHECK EMBEDDINGS (For AI Matching)
-- ============================================
SELECT 
  '🔍 CAMPAIGN EMBEDDINGS' as test_name,
  COUNT(*) as total_campaigns,
  COUNT(embedding) as campaigns_with_embedding,
  COUNT(*) - COUNT(embedding) as campaigns_without_embedding,
  CASE 
    WHEN COUNT(embedding) > 0 THEN '✅ Some campaigns have embeddings'
    WHEN COUNT(*) = 0 THEN '⚠️ No campaigns exist'
    ELSE '⚠️ No embeddings - AI matching may not work optimally'
  END as status
FROM campaigns
WHERE status = 'active';

SELECT 
  '🔍 CREATOR EMBEDDINGS' as test_name,
  COUNT(*) as total_creators,
  COUNT(embedding) as creators_with_embedding,
  COUNT(*) - COUNT(embedding) as creators_without_embedding,
  CASE 
    WHEN COUNT(embedding) > 0 THEN '✅ Some creators have embeddings'
    WHEN COUNT(*) = 0 THEN '⚠️ No creators exist'
    ELSE '⚠️ No embeddings - AI matching may not work optimally'
  END as status
FROM creators;

-- ============================================
-- 6. SAMPLE ACTIVE CAMPAIGNS
-- ============================================
SELECT 
  '📋 SAMPLE CAMPAIGNS' as info,
  id,
  title,
  niche,
  budget,
  status,
  CASE WHEN embedding IS NOT NULL THEN '✅' ELSE '❌' END as has_embedding
FROM campaigns
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 7. SUMMARY & NEXT STEPS
-- ============================================
SELECT 
  '📊 SUMMARY' as section,
  (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
  (SELECT COUNT(*) FROM creators) as total_creators,
  (SELECT COUNT(*) FROM brands) as total_brands,
  (SELECT is_nullable FROM information_schema.columns 
   WHERE table_name = 'collaboration_requests' AND column_name = 'campaign_id') as campaign_id_nullable;

-- ============================================
-- INTERPRETATION:
-- ============================================
-- ✅ campaign_id_nullable = 'YES' → Send Request will work
-- ❌ campaign_id_nullable = 'NO' → Run: ALTER TABLE collaboration_requests ALTER COLUMN campaign_id DROP NOT NULL;
--
-- ✅ active_campaigns > 0 → Campaigns exist
-- ❌ active_campaigns = 0 → Run DEMO_DATA_CAMPAIGNS.sql
--
-- ✅ total_creators > 0 → Creators exist
-- ❌ total_creators = 0 → Run DEMO_DATA_CREATORS.sql
--
-- For "Matched Campaigns" to work:
-- 1. You must be logged in as a CREATOR (not brand)
-- 2. Active campaigns must exist
-- 3. Your creator profile must be complete
-- ============================================
