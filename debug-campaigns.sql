-- ============================================
-- DEBUG: Check Campaigns and User Data
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. Check total campaigns
SELECT 
  'Total Campaigns' as check_type,
  COUNT(*) as count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_count
FROM campaigns;

-- 2. List all active campaigns
SELECT 
  'Active Campaigns List' as check_type,
  id,
  title,
  niche,
  budget,
  status,
  created_at
FROM campaigns
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check creators
SELECT 
  'Total Creators' as check_type,
  COUNT(*) as count
FROM creators;

-- 4. Check if embeddings exist
SELECT 
  'Campaigns with embeddings' as check_type,
  COUNT(*) as total_campaigns,
  COUNT(embedding) as campaigns_with_embedding,
  COUNT(*) - COUNT(embedding) as campaigns_without_embedding
FROM campaigns;

SELECT 
  'Creators with embeddings' as check_type,
  COUNT(*) as total_creators,
  COUNT(embedding) as creators_with_embedding,
  COUNT(*) - COUNT(embedding) as creators_without_embedding
FROM creators;

-- 5. Check brands
SELECT 
  'Total Brands' as check_type,
  COUNT(*) as count
FROM brands;

-- 6. Sample data check
SELECT 
  'Sample Campaign' as check_type,
  c.id,
  c.title,
  c.status,
  c.niche,
  b.name as brand_name
FROM campaigns c
LEFT JOIN brands b ON c.brand_id = b.id
LIMIT 5;
