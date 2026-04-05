-- Verification Queries for Demo Data
-- Run these after inserting the demo data to verify everything worked correctly

-- 1. Check total counts
SELECT 'Creators' as table_name, COUNT(*) as count FROM creators WHERE id LIKE 'demo-creator-%'
UNION ALL
SELECT 'Brands' as table_name, COUNT(*) as count FROM brands WHERE id LIKE 'demo-brand-%'
UNION ALL
SELECT 'Campaigns' as table_name, COUNT(*) as count FROM campaigns WHERE id LIKE 'demo-campaign-%';

-- Expected results:
-- Creators: 50
-- Brands: 20
-- Campaigns: 50

-- 2. Check creator distribution by niche
SELECT 
  niche,
  COUNT(*) as creator_count,
  ROUND(AVG(instagram_followers)) as avg_followers,
  ROUND(AVG(instagram_engagement), 2) as avg_engagement,
  COUNT(CASE WHEN verified = true THEN 1 END) as verified_count
FROM creators 
WHERE id LIKE 'demo-creator-%'
GROUP BY niche
ORDER BY creator_count DESC;

-- 3. Check campaign distribution by niche
SELECT 
  niche,
  COUNT(*) as campaign_count,
  ROUND(AVG(budget)) as avg_budget,
  MIN(budget) as min_budget,
  MAX(budget) as max_budget
FROM campaigns 
WHERE id LIKE 'demo-campaign-%'
GROUP BY niche
ORDER BY campaign_count DESC;

-- 4. Check brand distribution by industry
SELECT 
  industry,
  COUNT(*) as brand_count
FROM brands 
WHERE id LIKE 'demo-brand-%'
GROUP BY industry
ORDER BY brand_count DESC;

-- 5. View top 10 creators by followers
SELECT 
  name,
  niche,
  instagram_followers,
  instagram_engagement,
  verified
FROM creators 
WHERE id LIKE 'demo-creator-%'
ORDER BY instagram_followers DESC
LIMIT 10;

-- 6. View top 10 campaigns by budget
SELECT 
  c.title,
  b.name as brand_name,
  c.budget,
  c.niche,
  c.deliverable_type
FROM campaigns c
JOIN brands b ON c.brand_id = b.id
WHERE c.id LIKE 'demo-campaign-%'
ORDER BY c.budget DESC
LIMIT 10;

-- 7. Check for any data issues
-- All campaigns should have status 'active'
SELECT COUNT(*) as active_campaigns 
FROM campaigns 
WHERE id LIKE 'demo-campaign-%' AND status = 'active';
-- Expected: 50

-- All creators should have valid email addresses
SELECT COUNT(*) as valid_emails 
FROM creators 
WHERE id LIKE 'demo-creator-%' AND email LIKE '%@demo.com';
-- Expected: 50

-- All brands should have valid email addresses
SELECT COUNT(*) as valid_emails 
FROM brands 
WHERE id LIKE 'demo-brand-%' AND email LIKE '%@%.com';
-- Expected: 20

-- 8. Sample data check - verify a specific creator
SELECT * FROM creators WHERE id = 'demo-creator-001';
-- Should return: Priya Sharma, Fashion niche, 250K followers

-- 9. Sample data check - verify a specific campaign
SELECT 
  c.*,
  b.name as brand_name
FROM campaigns c
JOIN brands b ON c.brand_id = b.id
WHERE c.id = 'demo-campaign-001';
-- Should return: Summer Collection Launch 2026, StyleHub Fashion

-- 10. Check engagement rate distribution
SELECT 
  CASE 
    WHEN instagram_engagement < 3 THEN 'Low (< 3%)'
    WHEN instagram_engagement < 5 THEN 'Medium (3-5%)'
    WHEN instagram_engagement < 7 THEN 'High (5-7%)'
    ELSE 'Very High (7%+)'
  END as engagement_tier,
  COUNT(*) as creator_count
FROM creators 
WHERE id LIKE 'demo-creator-%'
GROUP BY engagement_tier
ORDER BY MIN(instagram_engagement);

-- 11. Check budget distribution
SELECT 
  CASE 
    WHEN budget < 60000 THEN 'Small (< 60K)'
    WHEN budget < 100000 THEN 'Medium (60K-100K)'
    WHEN budget < 150000 THEN 'Large (100K-150K)'
    ELSE 'Premium (150K+)'
  END as budget_tier,
  COUNT(*) as campaign_count
FROM campaigns 
WHERE id LIKE 'demo-campaign-%'
GROUP BY budget_tier
ORDER BY MIN(budget);

-- 12. Verify all foreign keys are valid
SELECT COUNT(*) as campaigns_with_valid_brands
FROM campaigns c
WHERE c.id LIKE 'demo-campaign-%'
AND EXISTS (SELECT 1 FROM brands b WHERE b.id = c.brand_id);
-- Expected: 50 (all campaigns should have valid brand references)

-- 13. Check for duplicate usernames
SELECT username, COUNT(*) as count
FROM creators
WHERE id LIKE 'demo-creator-%'
GROUP BY username
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)

-- 14. Check for duplicate emails
SELECT email, COUNT(*) as count
FROM creators
WHERE id LIKE 'demo-creator-%'
GROUP BY email
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)

-- 15. Summary statistics
SELECT 
  'Total Demo Creators' as metric,
  COUNT(*) as value
FROM creators WHERE id LIKE 'demo-creator-%'
UNION ALL
SELECT 
  'Total Demo Brands' as metric,
  COUNT(*) as value
FROM brands WHERE id LIKE 'demo-brand-%'
UNION ALL
SELECT 
  'Total Demo Campaigns' as metric,
  COUNT(*) as value
FROM campaigns WHERE id LIKE 'demo-campaign-%'
UNION ALL
SELECT 
  'Total Campaign Budget' as metric,
  SUM(budget) as value
FROM campaigns WHERE id LIKE 'demo-campaign-%'
UNION ALL
SELECT 
  'Average Campaign Budget' as metric,
  ROUND(AVG(budget)) as value
FROM campaigns WHERE id LIKE 'demo-campaign-%'
UNION ALL
SELECT 
  'Total Creator Reach' as metric,
  SUM(instagram_followers) as value
FROM creators WHERE id LIKE 'demo-creator-%'
UNION ALL
SELECT 
  'Average Creator Followers' as metric,
  ROUND(AVG(instagram_followers)) as value
FROM creators WHERE id LIKE 'demo-creator-%';
