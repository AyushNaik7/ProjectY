-- ============================================
-- Cleanup: Remove UUID defaults and orphaned data
-- ============================================

-- 1. Delete orphaned data with UUID-format IDs (only from existing tables)

-- Delete collaboration requests with UUID foreign keys
DELETE FROM collaboration_requests 
WHERE creator_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   OR brand_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Delete campaigns with UUID brand_id
DELETE FROM campaigns 
WHERE brand_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Delete creators with UUID id
DELETE FROM creators 
WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Delete brands with UUID id
DELETE FROM brands 
WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 2. Remove UUID default from all ID columns
ALTER TABLE creators 
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE brands 
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE campaigns 
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE collaboration_requests 
  ALTER COLUMN id DROP DEFAULT;

-- 3. Verify the changes
SELECT 'Creators' as table_name, COUNT(*) as remaining_rows FROM creators
UNION ALL
SELECT 'Brands', COUNT(*) FROM brands
UNION ALL
SELECT 'Campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'Collaboration requests', COUNT(*) FROM collaboration_requests;

-- Done! All UUID defaults removed and orphaned data cleaned up
