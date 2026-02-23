-- 008: Marketplace enhancements for AI-powered matching UI
-- Adds payment types, urgency fields, brand trust signals, and saved campaigns

-- Create payment_type enum
DO $$ BEGIN
  CREATE TYPE payment_type AS ENUM ('negotiable', 'fixed', 'performance_based');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Campaigns: add marketplace-specific columns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS payment_type payment_type DEFAULT 'fixed';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS spots_total INTEGER DEFAULT 10;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS spots_left INTEGER DEFAULT 10;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget_max INTEGER;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'Reel';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Brands: add trust signal columns
ALTER TABLE brands ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS creators_worked_with INTEGER DEFAULT 0;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_placeholder TEXT;

-- Saved campaigns table for creators
CREATE TABLE IF NOT EXISTS saved_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(creator_id, campaign_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_type ON campaigns(payment_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_spots_left ON campaigns(spots_left);
CREATE INDEX IF NOT EXISTS idx_brands_is_verified ON brands(is_verified);
CREATE INDEX IF NOT EXISTS idx_saved_campaigns_creator ON saved_campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_saved_campaigns_campaign ON saved_campaigns(campaign_id);

-- RLS for saved_campaigns
ALTER TABLE saved_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can read their saved campaigns" ON saved_campaigns
  FOR SELECT USING (true);

CREATE POLICY "Creators can save campaigns" ON saved_campaigns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can unsave campaigns" ON saved_campaigns
  FOR DELETE USING (true);
