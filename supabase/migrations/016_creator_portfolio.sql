-- ============================================================
-- Migration 016: Creator Portfolio / Media Kit
-- ============================================================

-- 1. Add portfolio fields to creators table
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS portfolio_headline TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_tagline TEXT,
  ADD COLUMN IF NOT EXISTS audience_age_range TEXT,
  ADD COLUMN IF NOT EXISTS audience_gender_split JSONB DEFAULT '{"male": 0, "female": 0, "other": 0}'::jsonb,
  ADD COLUMN IF NOT EXISTS audience_top_cities TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS past_brands TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS content_themes TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS awards TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Create portfolio_items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  brand_worked_with TEXT,
  campaign_type TEXT,
  result_metric TEXT,
  thumbnail_url TEXT,
  content_url TEXT,
  platform TEXT,
  collab_month TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_items_creator_id ON portfolio_items(creator_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_display_order ON portfolio_items(creator_id, display_order);

-- 4. Enable Row Level Security
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for portfolio_items
-- Anyone can view portfolio items (for public profiles)
CREATE POLICY "Anyone can view portfolio items" ON portfolio_items
  FOR SELECT USING (true);

-- Creators can insert their own portfolio items
CREATE POLICY "Creators can insert their own portfolio items" ON portfolio_items
  FOR INSERT WITH CHECK (
    creator_id IN (
      SELECT id FROM creators WHERE clerk_user_id = auth.uid()
    )
  );

-- Creators can update their own portfolio items
CREATE POLICY "Creators can update their own portfolio items" ON portfolio_items
  FOR UPDATE USING (
    creator_id IN (
      SELECT id FROM creators WHERE clerk_user_id = auth.uid()
    )
  );

-- Creators can delete their own portfolio items
CREATE POLICY "Creators can delete their own portfolio items" ON portfolio_items
  FOR DELETE USING (
    creator_id IN (
      SELECT id FROM creators WHERE clerk_user_id = auth.uid()
    )
  );

-- 6. Create Supabase Storage bucket for portfolio media (run this via Supabase dashboard or API)
-- This is a comment for manual setup:
-- CREATE BUCKET portfolio-media WITH (public = true);

-- 7. Function to update portfolio item timestamp
CREATE OR REPLACE FUNCTION update_portfolio_item_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger to auto-update timestamp
CREATE TRIGGER trigger_update_portfolio_item_timestamp
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_item_timestamp();

-- 9. Add profile views tracking table
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  viewer_clerk_id TEXT,
  viewer_role TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_date DATE DEFAULT CURRENT_DATE
);

-- 10. Create indexes for profile views
CREATE INDEX IF NOT EXISTS idx_profile_views_creator_id ON profile_views(creator_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_view_date ON profile_views(view_date);
CREATE INDEX IF NOT EXISTS idx_profile_views_creator_date ON profile_views(creator_id, view_date);

-- 11. Enable RLS for profile_views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies for profile_views
CREATE POLICY "Anyone can insert profile views" ON profile_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can view their own profile views" ON profile_views
  FOR SELECT USING (
    creator_id IN (
      SELECT id FROM creators WHERE clerk_user_id = auth.uid()
    )
  );

-- 13. Function to get daily profile views
CREATE OR REPLACE FUNCTION get_profile_views_by_date(
  p_creator_id UUID,
  p_days INT DEFAULT 30
)
RETURNS TABLE (
  view_date DATE,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.view_date,
    COUNT(*) as view_count
  FROM profile_views pv
  WHERE pv.creator_id = p_creator_id
    AND pv.view_date >= CURRENT_DATE - p_days
  GROUP BY pv.view_date
  ORDER BY pv.view_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
