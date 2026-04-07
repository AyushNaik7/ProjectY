-- ============================================================
-- Migration 022: Collaboration Calendar & Milestones
-- ============================================================

-- 1. Create collab_milestones table
CREATE TABLE IF NOT EXISTS collab_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_request_id UUID NOT NULL REFERENCES collaboration_requests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_collab_milestones_collaboration ON collab_milestones(collaboration_request_id);
CREATE INDEX IF NOT EXISTS idx_collab_milestones_due_date ON collab_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_collab_milestones_completed ON collab_milestones(completed);

-- 3. Enable Row Level Security
ALTER TABLE collab_milestones ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view milestones for their collaborations" ON collab_milestones
  FOR SELECT USING (
    collaboration_request_id IN (
      SELECT id FROM collaboration_requests
      WHERE brand_id IN (SELECT id FROM brands WHERE clerk_user_id = auth.uid())
         OR creator_id IN (SELECT id FROM creators WHERE clerk_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update milestones for their collaborations" ON collab_milestones
  FOR UPDATE USING (
    collaboration_request_id IN (
      SELECT id FROM collaboration_requests
      WHERE brand_id IN (SELECT id FROM brands WHERE clerk_user_id = auth.uid())
         OR creator_id IN (SELECT id FROM creators WHERE clerk_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert milestones for their collaborations" ON collab_milestones
  FOR INSERT WITH CHECK (
    collaboration_request_id IN (
      SELECT id FROM collaboration_requests
      WHERE brand_id IN (SELECT id FROM brands WHERE clerk_user_id = auth.uid())
         OR creator_id IN (SELECT id FROM creators WHERE clerk_user_id = auth.uid())
    )
  );

-- 5. Function to create default milestones for a collaboration
CREATE OR REPLACE FUNCTION create_default_milestones(
  p_collab_id UUID,
  p_agreed_date DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO collab_milestones (collaboration_request_id, title, due_date)
  VALUES
    (p_collab_id, 'Content Draft Due', p_agreed_date - INTERVAL '3 days'),
    (p_collab_id, 'Final Content Due', p_agreed_date),
    (p_collab_id, 'Brand Review', p_agreed_date + INTERVAL '1 day'),
    (p_collab_id, 'Payment Release', p_agreed_date + INTERVAL '2 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to auto-create milestones when collaboration is accepted
CREATE OR REPLACE FUNCTION trigger_create_milestones()
RETURNS TRIGGER AS $$
DECLARE
  v_agreed_date DATE;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Calculate agreed date (30 days from acceptance if not specified)
    v_agreed_date := CURRENT_DATE + INTERVAL '30 days';
    
    -- Create default milestones
    PERFORM create_default_milestones(NEW.id, v_agreed_date);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_milestones
  AFTER UPDATE ON collaboration_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_milestones();

-- 7. Function to get upcoming milestones for a user
CREATE OR REPLACE FUNCTION get_upcoming_milestones(
  p_user_clerk_id TEXT,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  milestone_id UUID,
  collaboration_request_id UUID,
  title TEXT,
  due_date DATE,
  completed BOOLEAN,
  campaign_title TEXT,
  other_party_name TEXT,
  user_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id as milestone_id,
    m.collaboration_request_id,
    m.title,
    m.due_date,
    m.completed,
    c.title as campaign_title,
    CASE
      WHEN b.clerk_user_id = p_user_clerk_id THEN cr_creator.name
      ELSE br.name
    END as other_party_name,
    CASE
      WHEN b.clerk_user_id = p_user_clerk_id THEN 'brand'
      ELSE 'creator'
    END as user_role
  FROM collab_milestones m
  JOIN collaboration_requests cr ON cr.id = m.collaboration_request_id
  LEFT JOIN campaigns c ON c.id = cr.campaign_id
  JOIN brands b ON b.id = cr.brand_id
  JOIN brands br ON br.id = cr.brand_id
  JOIN creators cr_creator ON cr_creator.id = cr.creator_id
  WHERE m.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days_ahead
    AND m.completed = false
    AND (b.clerk_user_id = p_user_clerk_id OR cr_creator.clerk_user_id = p_user_clerk_id)
  ORDER BY m.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Function to mark milestone as complete
CREATE OR REPLACE FUNCTION complete_milestone(p_milestone_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE collab_milestones
  SET completed = true,
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_milestone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to get overdue milestones
CREATE OR REPLACE FUNCTION get_overdue_milestones(p_user_clerk_id TEXT)
RETURNS TABLE (
  milestone_id UUID,
  collaboration_request_id UUID,
  title TEXT,
  due_date DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id as milestone_id,
    m.collaboration_request_id,
    m.title,
    m.due_date,
    (CURRENT_DATE - m.due_date)::INTEGER as days_overdue
  FROM collab_milestones m
  JOIN collaboration_requests cr ON cr.id = m.collaboration_request_id
  JOIN brands b ON b.id = cr.brand_id
  JOIN creators c ON c.id = cr.creator_id
  WHERE m.due_date < CURRENT_DATE
    AND m.completed = false
    AND (b.clerk_user_id = p_user_clerk_id OR c.clerk_user_id = p_user_clerk_id)
  ORDER BY m.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE collab_milestones;
