-- ============================================
-- New Features Migration
-- ============================================

-- 1. MESSAGING SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY DEFAULT ('conv_' || gen_random_uuid()::text),
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, creator_id, brand_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT ('msg_' || gen_random_uuid()::text),
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('creator', 'brand')),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for messaging
CREATE INDEX IF NOT EXISTS idx_conversations_creator ON conversations(creator_id);
CREATE INDEX IF NOT EXISTS idx_conversations_brand ON conversations(brand_id);
CREATE INDEX IF NOT EXISTS idx_conversations_campaign ON conversations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = creator_id OR 
    auth.uid() = brand_id
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id OR 
    auth.uid() = brand_id
  );

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE creator_id = auth.uid() OR brand_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE creator_id = auth.uid() OR brand_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());


-- 2. NOTIFICATIONS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT ('notif_' || gen_random_uuid()::text),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'new_request', 
    'request_accepted', 
    'request_rejected',
    'status_update',
    'new_message',
    'campaign_deadline',
    'payment_received'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());


-- 3. PORTFOLIO/PAST WORK
-- ============================================

CREATE TABLE IF NOT EXISTS portfolio_items (
  id TEXT PRIMARY KEY DEFAULT ('port_' || gen_random_uuid()::text),
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  brand_name TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'link')),
  metrics JSONB, -- {views: 100000, likes: 5000, comments: 200}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_creator ON portfolio_items(creator_id);

-- RLS for portfolio
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio items"
  ON portfolio_items FOR SELECT
  USING (true);

CREATE POLICY "Creators can manage their own portfolio"
  ON portfolio_items FOR ALL
  USING (creator_id = auth.uid());


-- 4. REVIEWS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT ('rev_' || gen_random_uuid()::text),
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('creator', 'brand')),
  reviewee_id TEXT NOT NULL,
  reviewee_type TEXT NOT NULL CHECK (reviewee_type IN ('creator', 'brand')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, reviewer_id, reviewee_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_campaign ON reviews(campaign_id);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for completed campaigns"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    campaign_id IN (
      SELECT campaign_id FROM collaboration_requests 
      WHERE deal_status = 'completed' AND
      (creator_id = auth.uid() OR brand_id = auth.uid())
    )
  );


-- 5. CONTENT DELIVERABLES
-- ============================================

CREATE TABLE IF NOT EXISTS deliverables (
  id TEXT PRIMARY KEY DEFAULT ('deliv_' || gen_random_uuid()::text),
  request_id TEXT REFERENCES collaboration_requests(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'revision_requested', 'rejected')),
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deliverables_request ON deliverables(request_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_creator ON deliverables(creator_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);

-- RLS for deliverables
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deliverables for their requests"
  ON deliverables FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM collaboration_requests 
      WHERE creator_id = auth.uid() OR brand_id = auth.uid()
    )
  );

CREATE POLICY "Creators can upload deliverables"
  ON deliverables FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Creators can update their deliverables"
  ON deliverables FOR UPDATE
  USING (creator_id = auth.uid());


-- 6. ENHANCED CAMPAIGNS TABLE
-- ============================================

-- Add new columns to campaigns
ALTER TABLE campaigns 
  ADD COLUMN IF NOT EXISTS deadline DATE,
  ADD COLUMN IF NOT EXISTS requirements TEXT,
  ADD COLUMN IF NOT EXISTS target_audience TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON campaigns(deadline);


-- 7. ENHANCED CREATORS TABLE
-- ============================================

-- Add new columns to creators
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[], -- Array of languages
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_campaigns INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_creators_rating ON creators(rating DESC);
CREATE INDEX IF NOT EXISTS idx_creators_location ON creators(location);


-- 8. SEARCH OPTIMIZATION
-- ============================================

-- Add full-text search indexes
CREATE INDEX IF NOT EXISTS idx_creators_search ON creators USING gin(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(niche, '') || ' ' || coalesce(bio, ''))
);

CREATE INDEX IF NOT EXISTS idx_campaigns_search ON campaigns USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);


-- 9. ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_analytics (
  id TEXT PRIMARY KEY DEFAULT ('analytics_' || gen_random_uuid()::text),
  campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON campaign_analytics(date DESC);

-- RLS for analytics
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view their campaign analytics"
  ON campaign_analytics FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE brand_id = auth.uid()
    )
  );


-- Done! All new features added
