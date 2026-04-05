-- ============================================
-- DATABASE DIAGNOSTIC SCRIPT
-- ============================================
-- Run this in Supabase SQL Editor to check current state

-- 1. Check if campaign_id is nullable
SELECT 
  'campaign_id nullable check' as test,
  column_name, 
  is_nullable,
  CASE 
    WHEN is_nullable = 'YES' THEN '✅ FIXED - campaign_id is nullable'
    ELSE '❌ NOT FIXED - campaign_id is still NOT NULL'
  END as status
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
  AND column_name = 'campaign_id';

-- 2. Check table structure
SELECT 
  'Table structure' as test,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests'
ORDER BY ordinal_position;

-- 3. Check existing requests
SELECT 
  'Existing requests count' as test,
  COUNT(*) as total_requests,
  COUNT(campaign_id) as requests_with_campaign,
  COUNT(*) - COUNT(campaign_id) as requests_without_campaign
FROM collaboration_requests;

-- 4. Check if index exists
SELECT 
  'Index check' as test,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'collaboration_requests'
  AND indexname = 'idx_collaboration_requests_campaign_id';
