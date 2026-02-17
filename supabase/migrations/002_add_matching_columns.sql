-- Add missing columns needed by the matching engine and API routes

-- Campaigns: add niche column for matching
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS niche TEXT;

-- Creators: add min_rate_private for server-side budget matching (never exposed to frontend)
ALTER TABLE creators ADD COLUMN IF NOT EXISTS min_rate_private INTEGER DEFAULT 0;

-- Creators: add verified flag
ALTER TABLE creators ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Create index on campaigns niche for matching queries
CREATE INDEX IF NOT EXISTS idx_campaigns_niche ON campaigns(niche);
