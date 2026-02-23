-- Add summary followers, engagement_rate, and youtube_handle columns to creators table
-- These are used by the settings page and matching logic

ALTER TABLE creators
ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;

ALTER TABLE creators
ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL DEFAULT 0;

ALTER TABLE creators
ADD COLUMN IF NOT EXISTS youtube_handle TEXT;

-- Backfill: set followers to instagram_followers where not already set
UPDATE creators
SET followers = COALESCE(instagram_followers, 0)
WHERE followers IS NULL OR followers = 0;

-- Backfill: set engagement_rate to instagram_engagement where not already set
UPDATE creators
SET engagement_rate = COALESCE(instagram_engagement, 0)
WHERE engagement_rate IS NULL OR engagement_rate = 0;
