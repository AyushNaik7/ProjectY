-- ============================================================
-- Migration 020: Advanced Analytics System
-- ============================================================

-- 1. Create campaign_analytics table for performance tracking
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  collaboration_request_id UUID REFERENCES collaboration_requests(id) ON DELETE SET NULL,
  views_delivered INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  roi_estimate DECIMAL(10,2),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, collaboration_request_id, recorded_at)
);

-- 2. Create profile_views_daily aggregate table
CREATE TABLE IF NOT EXISTS profile_views_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  view_date DATE NOT NULL,
  view_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(creator_id, view_date)
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_recorded_at ON campaign_analytics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_views_daily_creator ON profile_views_daily(creator_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_daily_date ON profile_views_daily(view_date DESC);

-- 4. Enable Row Level Security
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views_daily ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for campaign_analytics
CREATE POLICY "Brands can view their campaign analytics" ON campaign_analytics
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE clerk_user_id = auth.uid())
    )
  );

CREATE POLICY "Brands can insert campaign analytics" ON campaign_analytics
  FOR INSERT WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE clerk_user_id = auth.uid())
    )
  );

-- 6. RLS Policies for profile_views_daily
CREATE POLICY "Creators can view their profile analytics" ON profile_views_daily
  FOR SELECT USING (
    creator_id IN (SELECT id FROM creators WHERE clerk_user_id = auth.uid())
  );

-- 7. Function to aggregate profile views daily
CREATE OR REPLACE FUNCTION aggregate_profile_views_daily()
RETURNS void AS $$
BEGIN
  INSERT INTO profile_views_daily (creator_id, view_date, view_count, unique_viewers)
  SELECT
    creator_id,
    DATE(view_date) as view_date,
    COUNT(*) as view_count,
    COUNT(DISTINCT viewer_clerk_id) as unique_viewers
  FROM profile_views
  WHERE DATE(view_date) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY creator_id, DATE(view_date)
  ON CONFLICT (creator_id, view_date)
  DO UPDATE SET
    view_count = EXCLUDED.view_count,
    unique_viewers = EXCLUDED.unique_viewers,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to calculate creator earnings over time
CREATE OR REPLACE FUNCTION get_creator_earnings_by_month(p_creator_clerk_id TEXT)
RETURNS TABLE (
  month DATE,
  total_earned NUMERIC,
  collaboration_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('month', p.released_at)::DATE as month,
    SUM(p.creator_payout) as total_earned,
    COUNT(DISTINCT p.collaboration_request_id)::INTEGER as collaboration_count
  FROM payments p
  WHERE p.creator_clerk_id = p_creator_clerk_id
    AND p.status = 'released'
    AND p.released_at IS NOT NULL
  GROUP BY DATE_TRUNC('month', p.released_at)
  ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to calculate brand spend over time
CREATE OR REPLACE FUNCTION get_brand_spend_by_month(p_brand_clerk_id TEXT)
RETURNS TABLE (
  month DATE,
  total_spent NUMERIC,
  campaign_count INTEGER,
  collaboration_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('month', p.escrowed_at)::DATE as month,
    SUM(p.amount) as total_spent,
    COUNT(DISTINCT c.campaign_id)::INTEGER as campaign_count,
    COUNT(DISTINCT p.collaboration_request_id)::INTEGER as collaboration_count
  FROM payments p
  JOIN collaboration_requests c ON c.id = p.collaboration_request_id
  WHERE p.brand_clerk_id = p_brand_clerk_id
    AND p.status IN ('escrowed', 'released')
    AND p.escrowed_at IS NOT NULL
  GROUP BY DATE_TRUNC('month', p.escrowed_at)
  ORDER BY month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. View for campaign performance summary
CREATE OR REPLACE VIEW campaign_performance_summary AS
SELECT
  c.id as campaign_id,
  c.title,
  c.brand_id,
  COUNT(DISTINCT cr.id) as total_requests,
  COUNT(DISTINCT CASE WHEN cr.status = 'accepted' THEN cr.id END) as accepted_requests,
  COUNT(DISTINCT CASE WHEN cr.status = 'completed' THEN cr.id END) as completed_requests,
  COALESCE(SUM(ca.views_delivered), 0) as total_views,
  COALESCE(SUM(ca.engagement_count), 0) as total_engagement,
  COALESCE(SUM(p.amount), 0) as total_spent,
  COALESCE(AVG(ca.roi_estimate), 0) as avg_roi
FROM campaigns c
LEFT JOIN collaboration_requests cr ON cr.campaign_id = c.id
LEFT JOIN campaign_analytics ca ON ca.campaign_id = c.id
LEFT JOIN payments p ON p.collaboration_request_id = cr.id AND p.status IN ('escrowed', 'released')
GROUP BY c.id, c.title, c.brand_id;
