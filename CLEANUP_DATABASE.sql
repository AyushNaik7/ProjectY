-- ============================================
-- Cleanup: Remove UUID defaults and orphaned data
-- ============================================

-- 1. Delete all existing rows with UUID-format IDs (orphaned data)
DELETE FROM collaboration_requests 
WHERE creator_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   OR brand_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

DELETE FROM campaigns 
WHERE brand_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

DELETE FROM saved_campaigns
WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

DELETE FROM saved_creators
WHERE user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

DELETE FROM creators 
WHERE id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

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
SELECT 'Creators count' as table_name, COUNT(*) as remaining_rows FROM creators
UNION ALL
SELECT 'Brands count', COUNT(*) FROM brands
UNION ALL
SELECT 'Campaigns count', COUNT(*) FROM campaigns
UNION ALL
SELECT 'Collaboration requests count', COUNT(*) FROM collaboration_requests;

-- Done! All UUID defaults removed and orphaned data cleaned up
