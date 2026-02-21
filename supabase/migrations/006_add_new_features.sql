-- Add verified column to creators table
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;

-- Add deal_status to requests table
ALTER TABLE requests
ADD COLUMN IF NOT EXISTS deal_status TEXT DEFAULT 'requested'
CHECK (deal_status IN ('requested', 'accepted', 'in_progress', 'completed'));

-- Create saved_campaigns table
CREATE TABLE IF NOT EXISTS saved_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(creator_id, campaign_id)
);

-- Create saved_creators table
CREATE TABLE IF NOT EXISTS saved_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, creator_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_campaigns_creator ON saved_campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_saved_campaigns_campaign ON saved_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS idx_saved_creators_brand ON saved_creators(brand_id);
CREATE INDEX IF NOT EXISTS idx_saved_creators_creator ON saved_creators(creator_id);
CREATE INDEX IF NOT EXISTS idx_requests_deal_status ON requests(deal_status);

-- Enable RLS on new tables
ALTER TABLE saved_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_creators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_campaigns
CREATE POLICY "Creators can view their own saved campaigns"
  ON saved_campaigns FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can save campaigns"
  ON saved_campaigns FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can unsave campaigns"
  ON saved_campaigns FOR DELETE
  USING (auth.uid() = creator_id);

-- RLS Policies for saved_creators
CREATE POLICY "Brands can view their own saved creators"
  ON saved_creators FOR SELECT
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can save creators"
  ON saved_creators FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can unsave creators"
  ON saved_creators FOR DELETE
  USING (auth.uid() = brand_id);

-- Add username column to creators for public profile URLs
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index on username
CREATE INDEX IF NOT EXISTS idx_creators_username ON creators(username);

-- Update existing creators with username based on name (lowercase, no spaces)
UPDATE creators
SET username = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL;
