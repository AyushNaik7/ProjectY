-- ============================================================
-- RUN ALL MIGRATIONS AT ONCE
-- Copy this entire file and paste into Supabase SQL Editor
-- Then click "RUN"
-- ============================================================

-- ============================================================
-- Migration 014: Conversations & Messages
-- ============================================================

-- 1. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  unread_brand INT DEFAULT 0,
  unread_creator INT DEFAULT 0,
  UNIQUE(brand_id, creator_id, campaign_id)
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('brand', 'creator')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
  file_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_brand_id ON conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_conversations_creator_id ON conversations(creator_id);
CREATE INDEX IF NOT EXISTS idx_conversations_campaign_id ON conversations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- 4. Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. Add clerk_user_id to brands and creators if not exists
ALTER TABLE brands ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_brands_clerk_user_id ON brands(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_creators_clerk_user_id ON creators(clerk_user_id);

-- 6. RLS Policies for conversations (simplified for now)
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
CREATE POLICY "Users can insert conversations" ON conversations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE USING (true);

-- 7. RLS Policies for messages (simplified for now)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON messages;
CREATE POLICY "Users can insert messages in their conversations" ON messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (true);

-- 8. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 9. Function to update conversation on message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    updated_at = NEW.created_at,
    last_message_preview = CASE 
      WHEN NEW.message_type = 'text' THEN LEFT(NEW.content, 100)
      WHEN NEW.message_type = 'image' THEN '📷 Image'
      WHEN NEW.message_type = 'file' THEN '📎 File'
      ELSE NEW.content
    END,
    unread_brand = CASE 
      WHEN NEW.sender_role = 'creator' THEN unread_brand + 1
      ELSE 0
    END,
    unread_creator = CASE 
      WHEN NEW.sender_role = 'brand' THEN unread_creator + 1
      ELSE 0
    END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger to auto-update conversation on new message
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- ============================================================
-- Migration 015: Notifications
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
    'review_received'
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

-- 4. RLS Policies (simplified)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (true);

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

-- ============================================================
-- Migration 016: Creator Portfolio
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

-- 5. RLS Policies (simplified)
DROP POLICY IF EXISTS "Anyone can view portfolio items" ON portfolio_items;
CREATE POLICY "Anyone can view portfolio items" ON portfolio_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can insert their own portfolio items" ON portfolio_items;
CREATE POLICY "Creators can insert their own portfolio items" ON portfolio_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Creators can update their own portfolio items" ON portfolio_items;
CREATE POLICY "Creators can update their own portfolio items" ON portfolio_items FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Creators can delete their own portfolio items" ON portfolio_items;
CREATE POLICY "Creators can delete their own portfolio items" ON portfolio_items FOR DELETE USING (true);

-- 6. Create profile_views table
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  viewer_clerk_id TEXT,
  viewer_role TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_date DATE DEFAULT CURRENT_DATE
);

-- 7. Create indexes for profile views
CREATE INDEX IF NOT EXISTS idx_profile_views_creator_id ON profile_views(creator_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_view_date ON profile_views(view_date);
CREATE INDEX IF NOT EXISTS idx_profile_views_creator_date ON profile_views(creator_id, view_date);

-- 8. Enable RLS for profile_views
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert profile views" ON profile_views;
CREATE POLICY "Anyone can insert profile views" ON profile_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Creators can view their own profile views" ON profile_views;
CREATE POLICY "Creators can view their own profile views" ON profile_views FOR SELECT USING (true);

-- ============================================================
-- Migration 017: Reviews & Ratings
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

-- 5. RLS Policies (simplified)
DROP POLICY IF EXISTS "Anyone can view public reviews" ON reviews;
CREATE POLICY "Anyone can view public reviews" ON reviews FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can insert reviews" ON reviews;
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (true);

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
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_reviews
  FROM reviews
  WHERE target_id = p_target_id
    AND target_type = p_target_type
    AND is_public = true;

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
  IF TG_OP = 'INSERT' THEN
    PERFORM recalculate_rating(NEW.target_id, NEW.target_type);
  END IF;

  IF TG_OP = 'UPDATE' THEN
    PERFORM recalculate_rating(NEW.target_id, NEW.target_type);
    IF OLD.target_id != NEW.target_id OR OLD.target_type != NEW.target_type THEN
      PERFORM recalculate_rating(OLD.target_id, OLD.target_type);
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_rating(OLD.target_id, OLD.target_type);
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_rating_update ON reviews;
CREATE TRIGGER trigger_review_rating_update
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_rating();

-- ============================================================
-- Migration 018: Escrow Payments
-- ============================================================

-- 1. Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_request_id UUID NOT NULL REFERENCES collaboration_requests(id) ON DELETE CASCADE UNIQUE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'escrowed', 'released', 'refunded', 'disputed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  platform_fee NUMERIC(12,2) DEFAULT 0,
  creator_payout NUMERIC(12,2),
  brand_clerk_id TEXT NOT NULL,
  creator_clerk_id TEXT NOT NULL,
  escrowed_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_collaboration ON payments(collaboration_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_brand ON payments(brand_clerk_id);
CREATE INDEX IF NOT EXISTS idx_payments_creator ON payments(creator_clerk_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);

-- 3. Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (simplified)
DROP POLICY IF EXISTS "Users can view their payments" ON payments;
CREATE POLICY "Users can view their payments" ON payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert payments" ON payments;
CREATE POLICY "Users can insert payments" ON payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update payments" ON payments;
CREATE POLICY "Users can update payments" ON payments FOR UPDATE USING (true);

-- 5. Function to calculate platform fee (10%)
CREATE OR REPLACE FUNCTION calculate_platform_fee(p_amount NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(p_amount * 0.10, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Trigger to auto-calculate fees
CREATE OR REPLACE FUNCTION auto_calculate_payment_fees()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.platform_fee IS NULL OR NEW.platform_fee = 0 THEN
    NEW.platform_fee := calculate_platform_fee(NEW.amount);
  END IF;
  
  IF NEW.creator_payout IS NULL OR NEW.creator_payout = 0 THEN
    NEW.creator_payout := NEW.amount - NEW.platform_fee;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_calculate_payment_fees ON payments;
CREATE TRIGGER trigger_auto_calculate_payment_fees
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_payment_fees();

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check all tables were created
SELECT 'Tables Created:' as status, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages', 'notifications', 'portfolio_items', 'reviews', 'payments', 'profile_views');

-- Check realtime is enabled
SELECT 'Realtime Enabled:' as status, COUNT(*) as count
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('conversations', 'messages', 'notifications');

-- Check functions were created
SELECT 'Functions Created:' as status, COUNT(*) as count
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('update_conversation_on_message', 'create_notification', 'recalculate_rating', 'calculate_platform_fee');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All migrations completed successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create storage buckets: portfolio-media, avatars';
  RAISE NOTICE '2. Update clerk_user_id for existing users';
  RAISE NOTICE '3. Run: npm install';
  RAISE NOTICE '4. Run: npm run dev';
END $$;
