-- ============================================================
-- Migration 023: Full-Text Search & Discovery
-- ============================================================

-- 1. Add search_vector columns to creators and campaigns
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Create function to update creator search vector
CREATE OR REPLACE FUNCTION update_creator_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.instagram_handle, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.niche, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create function to update campaign search vector
CREATE OR REPLACE FUNCTION update_campaign_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.niche, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create triggers
CREATE TRIGGER trigger_update_creator_search_vector
  BEFORE INSERT OR UPDATE ON creators
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_search_vector();

CREATE TRIGGER trigger_update_campaign_search_vector
  BEFORE INSERT OR UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_search_vector();

-- 5. Create GIN indexes for fast full-text search
CREATE INDEX IF NOT EXISTS idx_creators_search_vector ON creators USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_campaigns_search_vector ON campaigns USING GIN(search_vector);

-- 6. Update existing records with search vectors
UPDATE creators SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(instagram_handle, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(niche, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(bio, '')), 'C');

UPDATE campaigns SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(niche, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C');

-- 7. Function for universal search across creators and campaigns
CREATE OR REPLACE FUNCTION universal_search(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  result_type TEXT,
  result_id UUID,
  title TEXT,
  subtitle TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  (
    -- Search creators
    SELECT
      'creator'::TEXT as result_type,
      c.id as result_id,
      c.name as title,
      ('@' || c.instagram_handle || ' • ' || c.niche) as subtitle,
      ts_rank(c.search_vector, plainto_tsquery('english', p_query)) as rank
    FROM creators c
    WHERE c.search_vector @@ plainto_tsquery('english', p_query)
    ORDER BY rank DESC
    LIMIT p_limit
  )
  UNION ALL
  (
    -- Search campaigns
    SELECT
      'campaign'::TEXT as result_type,
      ca.id as result_id,
      ca.title as title,
      (ca.niche || ' • ₹' || ca.budget::TEXT) as subtitle,
      ts_rank(ca.search_vector, plainto_tsquery('english', p_query)) as rank
    FROM campaigns ca
    WHERE ca.search_vector @@ plainto_tsquery('english', p_query)
      AND ca.status = 'active'
    ORDER BY rank DESC
    LIMIT p_limit
  )
  ORDER BY rank DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function for creator-specific search with filters
CREATE OR REPLACE FUNCTION search_creators(
  p_query TEXT,
  p_niche TEXT DEFAULT NULL,
  p_min_followers INTEGER DEFAULT NULL,
  p_max_followers INTEGER DEFAULT NULL,
  p_min_engagement DECIMAL DEFAULT NULL,
  p_tier TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  instagram_handle TEXT,
  niche TEXT,
  instagram_followers INTEGER,
  instagram_engagement DECIMAL,
  tier TEXT,
  avg_rating NUMERIC,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.instagram_handle,
    c.niche,
    c.instagram_followers,
    c.instagram_engagement,
    c.tier,
    c.avg_rating,
    ts_rank(c.search_vector, plainto_tsquery('english', p_query)) as rank
  FROM creators c
  WHERE (p_query IS NULL OR p_query = '' OR c.search_vector @@ plainto_tsquery('english', p_query))
    AND (p_niche IS NULL OR c.niche = p_niche)
    AND (p_min_followers IS NULL OR c.instagram_followers >= p_min_followers)
    AND (p_max_followers IS NULL OR c.instagram_followers <= p_max_followers)
    AND (p_min_engagement IS NULL OR c.instagram_engagement >= p_min_engagement)
    AND (p_tier IS NULL OR c.tier = p_tier)
  ORDER BY
    CASE WHEN p_query IS NOT NULL AND p_query != '' THEN rank ELSE 0 END DESC,
    c.instagram_followers DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function for campaign-specific search with filters
CREATE OR REPLACE FUNCTION search_campaigns(
  p_query TEXT,
  p_niche TEXT DEFAULT NULL,
  p_min_budget INTEGER DEFAULT NULL,
  p_max_budget INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  niche TEXT,
  budget INTEGER,
  timeline TEXT,
  brand_name TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.description,
    c.niche,
    c.budget,
    c.timeline,
    b.name as brand_name,
    ts_rank(c.search_vector, plainto_tsquery('english', p_query)) as rank
  FROM campaigns c
  JOIN brands b ON b.id = c.brand_id
  WHERE c.status = 'active'
    AND (p_query IS NULL OR p_query = '' OR c.search_vector @@ plainto_tsquery('english', p_query))
    AND (p_niche IS NULL OR c.niche = p_niche)
    AND (p_min_budget IS NULL OR c.budget >= p_min_budget)
    AND (p_max_budget IS NULL OR c.budget <= p_max_budget)
  ORDER BY
    CASE WHEN p_query IS NOT NULL AND p_query != '' THEN rank ELSE 0 END DESC,
    c.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
