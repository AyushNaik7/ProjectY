-- ============================================================
-- Migration 021: Creator Verification Tiers
-- ============================================================

-- 1. Add tier columns to creators table
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS instagram_verified_at TIMESTAMPTZ;

-- 2. Create index on tier for filtering
CREATE INDEX IF NOT EXISTS idx_creators_tier ON creators(tier);

-- 3. Function to calculate and update creator tier
CREATE OR REPLACE FUNCTION update_creator_tier(p_creator_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_completed_collabs INTEGER;
  v_avg_rating NUMERIC;
  v_instagram_verified BOOLEAN;
  v_new_tier TEXT;
BEGIN
  -- Get completed collaborations count
  SELECT COUNT(*)
  INTO v_completed_collabs
  FROM collaboration_requests
  WHERE creator_id = p_creator_id
    AND status = 'completed';

  -- Get average rating
  SELECT COALESCE(avg_rating, 0)
  INTO v_avg_rating
  FROM creators
  WHERE id = p_creator_id;

  -- Check Instagram verification
  SELECT instagram_verified_at IS NOT NULL
  INTO v_instagram_verified
  FROM creators
  WHERE id = p_creator_id;

  -- Determine tier based on criteria
  IF v_completed_collabs >= 15 AND v_avg_rating >= 4.5 AND v_instagram_verified THEN
    v_new_tier := 'platinum';
  ELSIF v_completed_collabs >= 5 AND v_avg_rating >= 4.0 THEN
    v_new_tier := 'gold';
  ELSIF v_completed_collabs >= 1 THEN
    v_new_tier := 'silver';
  ELSE
    v_new_tier := 'bronze';
  END IF;

  -- Update tier
  UPDATE creators
  SET tier = v_new_tier,
      tier_updated_at = NOW()
  WHERE id = p_creator_id;

  RETURN v_new_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger to auto-update tier after collaboration completion
CREATE OR REPLACE FUNCTION trigger_update_creator_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM update_creator_tier(NEW.creator_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_creator_tier
  AFTER UPDATE ON collaboration_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_creator_tier();

-- 5. Trigger to auto-update tier after review
CREATE OR REPLACE FUNCTION trigger_update_tier_after_review()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_id UUID;
BEGIN
  IF NEW.target_type = 'creator' THEN
    SELECT id INTO v_creator_id
    FROM creators
    WHERE id = NEW.target_id;
    
    IF v_creator_id IS NOT NULL THEN
      PERFORM update_creator_tier(v_creator_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_update_tier_after_review
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_tier_after_review();

-- 6. Function to get tier progress for a creator
CREATE OR REPLACE FUNCTION get_tier_progress(p_creator_id UUID)
RETURNS TABLE (
  current_tier TEXT,
  completed_collabs INTEGER,
  avg_rating NUMERIC,
  instagram_verified BOOLEAN,
  next_tier TEXT,
  collabs_needed INTEGER,
  rating_needed NUMERIC
) AS $$
DECLARE
  v_current_tier TEXT;
  v_completed_collabs INTEGER;
  v_avg_rating NUMERIC;
  v_instagram_verified BOOLEAN;
  v_next_tier TEXT;
  v_collabs_needed INTEGER;
  v_rating_needed NUMERIC;
BEGIN
  -- Get current stats
  SELECT
    c.tier,
    COALESCE(
      (SELECT COUNT(*) FROM collaboration_requests WHERE creator_id = p_creator_id AND status = 'completed'),
      0
    ),
    COALESCE(c.avg_rating, 0),
    c.instagram_verified_at IS NOT NULL
  INTO v_current_tier, v_completed_collabs, v_avg_rating, v_instagram_verified
  FROM creators c
  WHERE c.id = p_creator_id;

  -- Calculate next tier requirements
  CASE v_current_tier
    WHEN 'bronze' THEN
      v_next_tier := 'silver';
      v_collabs_needed := GREATEST(0, 1 - v_completed_collabs);
      v_rating_needed := 0;
    WHEN 'silver' THEN
      v_next_tier := 'gold';
      v_collabs_needed := GREATEST(0, 5 - v_completed_collabs);
      v_rating_needed := GREATEST(0, 4.0 - v_avg_rating);
    WHEN 'gold' THEN
      v_next_tier := 'platinum';
      v_collabs_needed := GREATEST(0, 15 - v_completed_collabs);
      v_rating_needed := GREATEST(0, 4.5 - v_avg_rating);
    ELSE
      v_next_tier := NULL;
      v_collabs_needed := 0;
      v_rating_needed := 0;
  END CASE;

  RETURN QUERY SELECT
    v_current_tier,
    v_completed_collabs,
    v_avg_rating,
    v_instagram_verified,
    v_next_tier,
    v_collabs_needed,
    v_rating_needed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update existing creators to bronze tier
UPDATE creators SET tier = 'bronze' WHERE tier IS NULL;

-- 8. Recalculate tiers for all existing creators
DO $$
DECLARE
  creator_record RECORD;
BEGIN
  FOR creator_record IN SELECT id FROM creators LOOP
    PERFORM update_creator_tier(creator_record.id);
  END LOOP;
END $$;
