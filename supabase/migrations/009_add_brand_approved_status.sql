-- 009: Add brand_approved status to collaboration_requests
-- New flow: pending → brand_approved → accepted | rejected
-- Creator can only accept/reject after brand approves

-- Drop the old constraint and add the new one with brand_approved
ALTER TABLE collaboration_requests
  DROP CONSTRAINT IF EXISTS collaboration_requests_status_check;

ALTER TABLE collaboration_requests
  ADD CONSTRAINT collaboration_requests_status_check
  CHECK (status IN ('pending', 'brand_approved', 'accepted', 'rejected'));

-- Also ensure brands table has the trust signal columns (idempotent)
ALTER TABLE brands ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS creators_worked_with INTEGER DEFAULT 0;
