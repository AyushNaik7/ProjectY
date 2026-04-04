-- Ensure saved_campaigns exists in environments where earlier migrations were skipped.

CREATE TABLE IF NOT EXISTS saved_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(creator_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_campaigns_creator ON saved_campaigns(creator_id);
CREATE INDEX IF NOT EXISTS idx_saved_campaigns_campaign ON saved_campaigns(campaign_id);

ALTER TABLE saved_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can read their saved campaigns" ON saved_campaigns
  FOR SELECT USING (true);

CREATE POLICY "Creators can save campaigns" ON saved_campaigns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can unsave campaigns" ON saved_campaigns
  FOR DELETE USING (true);