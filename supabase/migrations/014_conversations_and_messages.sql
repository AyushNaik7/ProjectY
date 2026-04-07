-- ============================================================
-- Migration 014: Real-Time Messaging System
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

-- 5. RLS Policies for conversations
-- Users can only see conversations they're part of
CREATE POLICY "Users can view their own conversations" ON conversations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT clerk_user_id FROM brands WHERE id = brand_id
      UNION
      SELECT clerk_user_id FROM creators WHERE id = creator_id
    )
  );

CREATE POLICY "Users can insert conversations" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT clerk_user_id FROM brands WHERE id = brand_id
      UNION
      SELECT clerk_user_id FROM creators WHERE id = creator_id
    )
  );

CREATE POLICY "Users can update their own conversations" ON conversations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT clerk_user_id FROM brands WHERE id = brand_id
      UNION
      SELECT clerk_user_id FROM creators WHERE id = creator_id
    )
  );

-- 6. RLS Policies for messages
-- Users can only see messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        auth.uid() IN (
          SELECT clerk_user_id FROM brands WHERE id = brand_id
          UNION
          SELECT clerk_user_id FROM creators WHERE id = creator_id
        )
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE
        auth.uid() IN (
          SELECT clerk_user_id FROM brands WHERE id = brand_id
          UNION
          SELECT clerk_user_id FROM creators WHERE id = creator_id
        )
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- 7. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 8. Function to update conversation timestamp and preview
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

-- 9. Trigger to auto-update conversation on new message
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- 10. Add clerk_user_id to brands and creators if not exists
ALTER TABLE brands ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

-- Create indexes for clerk_user_id lookups
CREATE INDEX IF NOT EXISTS idx_brands_clerk_user_id ON brands(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_creators_clerk_user_id ON creators(clerk_user_id);
