-- ============================================================
-- Migration 019: Content Delivery & Approval System
-- ============================================================

-- 1. Create deliverables table
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_request_id UUID NOT NULL REFERENCES collaboration_requests(id) ON DELETE CASCADE,
  submission_number INT DEFAULT 1,
  content_url TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image', 'reel', 'story', 'carousel')),
  caption TEXT,
  hashtags TEXT[],
  submission_notes TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'revision_requested', 'approved')),
  revision_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_deliverables_collaboration_request ON deliverables(collaboration_request_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_submitted_at ON deliverables(submitted_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can view deliverables for their collaborations
CREATE POLICY "Users can view deliverables for their collaborations" ON deliverables
  FOR SELECT USING (
    collaboration_request_id IN (
      SELECT id FROM collaboration_requests
      WHERE brand_id IN (SELECT id FROM brands WHERE clerk_user_id = auth.uid())
         OR creator_id IN (SELECT id FROM creators WHERE clerk_user_id = auth.uid())
    )
  );

-- Creators can submit deliverables for their collaborations
CREATE POLICY "Creators can submit deliverables" ON deliverables
  FOR INSERT WITH CHECK (
    collaboration_request_id IN (
      SELECT id FROM collaboration_requests
      WHERE creator_id IN (SELECT id FROM creators WHERE clerk_user_id = auth.uid())
    )
  );

-- Creators can update their own deliverables
CREATE POLICY "Creators can update their deliverables" ON deliverables
  FOR UPDATE USING (
    collaboration_request_id IN (
      SELECT id FROM collaboration_requests
      WHERE creator_id IN (SELECT id FROM creators WHERE clerk_user_id = auth.uid())
    )
  );

-- Brands can update deliverables for their collaborations (for approval/revision)
CREATE POLICY "Brands can update deliverables for their collaborations" ON deliverables
  FOR UPDATE USING (
    collaboration_request_id IN (
      SELECT id FROM collaboration_requests
      WHERE brand_id IN (SELECT id FROM brands WHERE clerk_user_id = auth.uid())
    )
  );

-- 5. Function to auto-increment submission number
CREATE OR REPLACE FUNCTION set_deliverable_submission_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.submission_number IS NULL THEN
    SELECT COALESCE(MAX(submission_number), 0) + 1
    INTO NEW.submission_number
    FROM deliverables
    WHERE collaboration_request_id = NEW.collaboration_request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_deliverable_submission_number
  BEFORE INSERT ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION set_deliverable_submission_number();

-- 6. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deliverable_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deliverable_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_deliverable_updated_at();

-- 7. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;
