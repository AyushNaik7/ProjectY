-- URGENT: Make campaign_id nullable in collaboration_requests
-- This must be run immediately to fix the constraint violation

-- Check current constraint
SELECT 
  column_name, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
AND column_name = 'campaign_id';

-- Make campaign_id nullable
ALTER TABLE collaboration_requests
  ALTER COLUMN campaign_id DROP NOT NULL;

-- Verify the change
SELECT 
  column_name, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
AND column_name = 'campaign_id';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_campaign_id 
  ON collaboration_requests(campaign_id) 
  WHERE campaign_id IS NOT NULL;