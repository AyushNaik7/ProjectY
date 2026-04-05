-- Make campaign_id nullable in collaboration_requests
-- This allows brands to send general collaboration requests without a specific campaign

ALTER TABLE collaboration_requests
  ALTER COLUMN campaign_id DROP NOT NULL;

-- Add index for queries filtering by null campaign_id
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_campaign_id 
  ON collaboration_requests(campaign_id) 
  WHERE campaign_id IS NOT NULL;
