-- ============================================================
-- Migration 015: Notification Center
-- ============================================================

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_clerk_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'new_request',
    'request_accepted',
    'request_rejected',
    'new_message',
    'new_match',
    'campaign_ending',
    'payment_received',
    'review_received',
    'new_deliverable',
    'deliverable_approved',
    'revision_requested'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_clerk_id ON notifications(user_clerk_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_clerk_id, read, created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_clerk_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_clerk_id = auth.uid());

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 6. Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_clerk_id TEXT,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_clerk_id, type, title, body, action_url)
  VALUES (p_user_clerk_id, p_type, p_title, p_body, p_action_url)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to create notification on new collaboration request
CREATE OR REPLACE FUNCTION notify_on_new_request()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_clerk_id TEXT;
  v_brand_name TEXT;
  v_campaign_title TEXT;
BEGIN
  -- Get creator's clerk_user_id
  SELECT clerk_user_id INTO v_creator_clerk_id
  FROM creators
  WHERE id = NEW.creator_id;
  
  -- Get brand name
  SELECT name INTO v_brand_name
  FROM brands
  WHERE id = NEW.brand_id;
  
  -- Get campaign title if exists
  IF NEW.campaign_id IS NOT NULL THEN
    SELECT title INTO v_campaign_title
    FROM campaigns
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- Create notification
  IF v_creator_clerk_id IS NOT NULL THEN
    PERFORM create_notification(
      v_creator_clerk_id,
      'new_request',
      'New Collaboration Request',
      CASE 
        WHEN v_campaign_title IS NOT NULL THEN
          v_brand_name || ' sent you a collaboration request for ' || v_campaign_title
        ELSE
          v_brand_name || ' sent you a collaboration request'
      END,
      '/dashboard/creator/requests'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_new_request
  AFTER INSERT ON collaboration_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_request();

-- 8. Trigger to create notification on request status change
CREATE OR REPLACE FUNCTION notify_on_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_brand_clerk_id TEXT;
  v_creator_name TEXT;
  v_campaign_title TEXT;
BEGIN
  -- Only notify on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get brand's clerk_user_id
  SELECT clerk_user_id INTO v_brand_clerk_id
  FROM brands
  WHERE id = NEW.brand_id;
  
  -- Get creator name
  SELECT name INTO v_creator_name
  FROM creators
  WHERE id = NEW.creator_id;
  
  -- Get campaign title if exists
  IF NEW.campaign_id IS NOT NULL THEN
    SELECT title INTO v_campaign_title
    FROM campaigns
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- Notify brand on acceptance
  IF NEW.status = 'accepted' AND v_brand_clerk_id IS NOT NULL THEN
    PERFORM create_notification(
      v_brand_clerk_id,
      'request_accepted',
      'Request Accepted',
      v_creator_name || ' accepted your collaboration request' ||
      CASE WHEN v_campaign_title IS NOT NULL THEN ' for ' || v_campaign_title ELSE '' END,
      '/dashboard/brand/requests'
    );
  END IF;
  
  -- Notify brand on rejection
  IF NEW.status = 'rejected' AND v_brand_clerk_id IS NOT NULL THEN
    PERFORM create_notification(
      v_brand_clerk_id,
      'request_rejected',
      'Request Declined',
      v_creator_name || ' declined your collaboration request' ||
      CASE WHEN v_campaign_title IS NOT NULL THEN ' for ' || v_campaign_title ELSE '' END,
      '/dashboard/brand/requests'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_on_request_status_change
  AFTER UPDATE ON collaboration_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_request_status_change();
