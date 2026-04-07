-- ============================================================
-- Migration 017: Reviews & Ratings System
-- ============================================================

-- 1. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_clerk_id TEXT NOT NULL,
  reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('brand', 'creator')),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('creator', 'brand')),
  collaboration_request_id UUID REFERENCES collaboration_requests(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collaboration_request_id, reviewer_role)
);

-- 2. Add rating columns to creators and brands
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_clerk_id);
CREATE INDEX IF NOT EXISTS idx_reviews_collaboration ON reviews(collaboration_request_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for reviews
-- Anyone can view public reviews
CREATE POLICY "Anyone can view public reviews" ON reviews
  FOR SELECT USING (is_public = true);

-- Reviewers can view their own reviews
CREATE POLICY "Reviewers can view their own reviews" ON reviews
  FOR SELECT USING (reviewer_clerk_id = auth.uid());

-- Target can view reviews about them
CREATE POLICY "Targets can view reviews about them" ON reviews
  FOR SELECT USING (
    (target_type = 'creator' AND target_id IN (
      SELECT id FROM creators WHERE clerk_user_id = auth.uid()
    )) OR
    (target_type = 'brand' AND target_id IN (
      SELECT id FROM brands WHERE clerk_user_id = auth.uid()
    ))
  );

-- Users can insert reviews for completed collaborations
CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (
    reviewer_clerk_id = auth.uid() AND
    collaboration_request_id IN (
      SELECT id FROM collaboration_requests
      WHERE status = 'completed' AND (
        (reviewer_role = 'brand' AND brand_id IN (
          SELECT id FROM brands WHERE clerk_user_id = auth.uid()
        )) OR
        (reviewer_role = 'creator' AND creator_id IN (
          SELECT id FROM creators WHERE clerk_user_id = auth.uid()
        ))
      )
    )
  );

-- 6. Function to recalculate average rating
CREATE OR REPLACE FUNCTION recalculate_rating(
  p_target_id UUID,
  p_target_type TEXT
)
RETURNS VOID AS $$
DECLARE
  v_avg_rating NUMERIC(3,2);
  v_total_reviews INT;
BEGIN
  -- Calculate average and count
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM reviews
  WHERE target_id = p_target_id
    AND target_type = p_target_type
    AND is_public = true;

  -- Update target table
  IF p_target_type = 'creator' THEN
    UPDATE creators
    SET avg_rating = v_avg_rating,
        total_reviews = v_total_reviews
    WHERE id = p_target_id;
  ELSIF p_target_type = 'brand' THEN
    UPDATE brands
    SET avg_rating = v_avg_rating,
        total_reviews = v_total_reviews
    WHERE id = p_target_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to recalculate rating on review insert/update
CREATE OR REPLACE FUNCTION trigger_recalculate_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate for new review
  IF TG_OP = 'INSERT' THEN
    PERFORM recalculate_rating(NEW.target_id, NEW.target_type);
  END IF;

  -- Recalculate for updated review
  IF TG_OP = 'UPDATE' THEN
    PERFORM recalculate_rating(NEW.target_id, NEW.target_type);
    -- If target changed, recalculate old target too
    IF OLD.target_id != NEW.target_id OR OLD.target_type != NEW.target_type THEN
      PERFORM recalculate_rating(OLD.target_id, OLD.target_type);
    END IF;
  END IF;

  -- Recalculate for deleted review
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_rating(OLD.target_id, OLD.target_type);
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_review_rating_update
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_rating();

-- 8. Add completed status to collaboration_requests if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'collaboration_requests_status_check'
  ) THEN
    ALTER TABLE collaboration_requests DROP CONSTRAINT IF EXISTS collaboration_requests_status_check;
    ALTER TABLE collaboration_requests 
      ADD CONSTRAINT collaboration_requests_status_check 
      CHECK (status IN ('pending', 'brand_approved', 'accepted', 'rejected', 'completed'));
  END IF;
END $$;
