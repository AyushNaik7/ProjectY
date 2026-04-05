-- IMMEDIATE FIX FOR COLLABORATION REQUESTS CONSTRAINT ERROR
-- This fixes the null ID issue without requiring vector extension

-- ============================================
-- 1. FIX COLLABORATION_REQUESTS ID CONSTRAINT
-- ============================================

-- Ensure the id column has proper UUID default
ALTER TABLE collaboration_requests 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make campaign_id nullable (for general requests without specific campaigns)
ALTER TABLE collaboration_requests
  ALTER COLUMN campaign_id DROP NOT NULL;

-- ============================================
-- 2. VERIFY AND CREATE MISSING INDEXES
-- ============================================

-- Performance indexes for collaboration_requests
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_brand_id 
  ON collaboration_requests(brand_id);

CREATE INDEX IF NOT EXISTS idx_collaboration_requests_creator_id 
  ON collaboration_requests(creator_id);

CREATE INDEX IF NOT EXISTS idx_collaboration_requests_campaign_id 
  ON collaboration_requests(campaign_id) 
  WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_collaboration_requests_status 
  ON collaboration_requests(status);

-- ============================================
-- 3. VERIFICATION QUERIES
-- ============================================

-- Check collaboration_requests table structure
SELECT 
  column_name,
  is_nullable,
  column_default,
  data_type
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
  AND column_name IN ('id', 'campaign_id')
ORDER BY column_name;

-- Check if we have active campaigns
SELECT COUNT(*) as active_campaigns_count
FROM campaigns 
WHERE status = 'active';

-- Check if we have creators
SELECT COUNT(*) as creators_count
FROM creators;

-- ============================================
-- 4. SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Collaboration requests fixes applied successfully!';
  RAISE NOTICE '✅ collaboration_requests.id now has UUID default';
  RAISE NOTICE '✅ collaboration_requests.campaign_id is now nullable';
  RAISE NOTICE '✅ Performance indexes ensured';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test creating a collaboration request';
  RAISE NOTICE '2. For AI functionality, you need to install pgvector extension';
END $$;