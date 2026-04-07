# 🚀 Execute Now - Step-by-Step Setup Guide

## ⚡ Quick Setup (5 Steps)

### STEP 1: Run SQL Migrations in Supabase

Go to your Supabase Dashboard → SQL Editor → New Query

**Copy and paste each migration file content in order:**

#### Migration 1: Conversations & Messages
```sql
-- Copy entire content from: supabase/migrations/014_conversations_and_messages.sql
-- Then click "RUN" in Supabase SQL Editor
```

#### Migration 2: Notifications
```sql
-- Copy entire content from: supabase/migrations/015_notifications.sql
-- Then click "RUN"
```

#### Migration 3: Creator Portfolio
```sql
-- Copy entire content from: supabase/migrations/016_creator_portfolio.sql
-- Then click "RUN"
```

#### Migration 4: Reviews & Ratings
```sql
-- Copy entire content from: supabase/migrations/017_reviews_and_ratings.sql
-- Then click "RUN"
```

#### Migration 5: Escrow Payments
```sql
-- Copy entire content from: supabase/migrations/018_escrow_payments.sql
-- Then click "RUN"
```

---

### STEP 2: Enable Realtime in Supabase

Go to: **Database → Replication**

Click "Enable Replication" for these tables:
- ✅ `conversations`
- ✅ `messages`
- ✅ `notifications`

Or run this SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

### STEP 3: Create Storage Buckets

Go to: **Storage → Create new bucket**

Create these buckets:

**Bucket 1: portfolio-media**
- Name: `portfolio-media`
- Public: ✅ Yes
- File size limit: 50MB
- Allowed MIME types: `image/*,video/*`

**Bucket 2: avatars**
- Name: `avatars`
- Public: ✅ Yes
- File size limit: 5MB
- Allowed MIME types: `image/*`

Or run this SQL:
```sql
-- Create buckets (run in Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('portfolio-media', 'portfolio-media', true),
  ('avatars', 'avatars', true);
```

---

### STEP 4: Update clerk_user_id for Existing Users

**IMPORTANT**: Link existing users to Clerk authentication

Run this SQL in Supabase:

```sql
-- First, check if clerk_user_id columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name IN ('creators', 'brands') 
  AND column_name = 'clerk_user_id';

-- If they don't exist, they were added in migration 014
-- Now you need to populate them with actual Clerk user IDs

-- For testing, you can manually set them:
-- Replace 'your_clerk_user_id' with actual Clerk user IDs from your Clerk dashboard

-- Update a specific creator
UPDATE creators 
SET clerk_user_id = 'user_2xxxxxxxxxxxxx'
WHERE email = 'creator@example.com';

-- Update a specific brand
UPDATE brands 
SET clerk_user_id = 'user_2xxxxxxxxxxxxx'
WHERE email = 'brand@example.com';
```

**To get Clerk User IDs:**
1. Go to Clerk Dashboard → Users
2. Click on a user
3. Copy their User ID (starts with `user_2...`)
4. Update the SQL above with real IDs

---

### STEP 5: Install Missing Dependencies

Run in your terminal:

```bash
# No new dependencies needed for sections 1-4!
# All required packages are already in package.json

# Just make sure everything is installed
npm install

# Verify no errors
npm run build
```

---

## 🧪 Test the Features

### Test 1: Check Database Tables

Run this in Supabase SQL Editor:

```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'conversations',
    'messages',
    'notifications',
    'portfolio_items',
    'reviews',
    'payments',
    'profile_views'
  )
ORDER BY table_name;

-- Should return 7 rows
```

### Test 2: Check Realtime is Enabled

```sql
-- Check realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Should include: conversations, messages, notifications
```

### Test 3: Check RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('conversations', 'messages', 'notifications', 'reviews')
ORDER BY tablename;

-- All should show rowsecurity = true
```

### Test 4: Test Notification Trigger

```sql
-- Create a test collaboration request to trigger notification
-- First, get a creator_id and brand_id from your database
SELECT id, name FROM creators LIMIT 1;
SELECT id, name FROM brands LIMIT 1;

-- Then create a test request (replace IDs)
INSERT INTO collaboration_requests (brand_id, creator_id, status, message)
VALUES (
  'your-brand-id-here',
  'your-creator-id-here',
  'pending',
  'Test collaboration request'
);

-- Check if notification was created
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🔧 Fix Common Issues

### Issue 1: "clerk_user_id column doesn't exist"

**Solution**: Run migration 014 again, specifically this part:

```sql
ALTER TABLE brands ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_brands_clerk_user_id ON brands(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_creators_clerk_user_id ON creators(clerk_user_id);
```

### Issue 2: "RLS policy prevents access"

**Solution**: Make sure clerk_user_id is populated:

```sql
-- Check if clerk_user_id is set
SELECT id, email, clerk_user_id FROM creators WHERE clerk_user_id IS NOT NULL;
SELECT id, email, clerk_user_id FROM brands WHERE clerk_user_id IS NOT NULL;

-- If empty, you need to set them (see Step 4 above)
```

### Issue 3: "Realtime not working"

**Solution**: 

```sql
-- Re-enable realtime
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS conversations;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS messages;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS notifications;

ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Issue 4: "Function does not exist"

**Solution**: Make sure all migrations ran successfully. Check for errors:

```sql
-- List all functions created by migrations
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'update_conversation_on_message',
    'create_notification',
    'notify_on_new_request',
    'recalculate_rating',
    'calculate_platform_fee'
  );
```

---

## 🎯 Verify Everything Works

### Checklist:

```sql
-- Run this comprehensive check
DO $$
DECLARE
  v_tables_count INT;
  v_realtime_count INT;
  v_functions_count INT;
  v_triggers_count INT;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO v_tables_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('conversations', 'messages', 'notifications', 'portfolio_items', 'reviews', 'payments', 'profile_views');
  
  -- Count realtime tables
  SELECT COUNT(*) INTO v_realtime_count
  FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime'
    AND tablename IN ('conversations', 'messages', 'notifications');
  
  -- Count functions
  SELECT COUNT(*) INTO v_functions_count
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
    AND routine_name IN ('update_conversation_on_message', 'create_notification', 'recalculate_rating');
  
  -- Count triggers
  SELECT COUNT(*) INTO v_triggers_count
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%conversation%' OR trigger_name LIKE '%notification%' OR trigger_name LIKE '%review%';
  
  -- Report
  RAISE NOTICE '=== SETUP VERIFICATION ===';
  RAISE NOTICE 'Tables created: % / 7', v_tables_count;
  RAISE NOTICE 'Realtime enabled: % / 3', v_realtime_count;
  RAISE NOTICE 'Functions created: % / 3+', v_functions_count;
  RAISE NOTICE 'Triggers created: % / 5+', v_triggers_count;
  
  IF v_tables_count = 7 AND v_realtime_count = 3 THEN
    RAISE NOTICE '✅ Setup looks good!';
  ELSE
    RAISE NOTICE '⚠️  Some items missing - check above';
  END IF;
END $$;
```

---

## 🚀 Start Development Server

```bash
# Make sure you're in the project directory
cd /path/to/instacollab

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

**Open**: http://localhost:3000

---

## 🧪 Test Features in Browser

### Test Messaging:

1. **Login as Brand**
   - Go to `/dashboard/brand`
   - Navigate to `/messages`
   - Should see empty state or existing conversations

2. **Login as Creator** (different browser/incognito)
   - Go to `/dashboard/creator`
   - Navigate to `/messages`
   - Should see empty state or existing conversations

3. **Create Conversation**
   - As brand: Find a creator and click "Request Collab"
   - This should create a conversation
   - Go to `/messages` - should see the conversation

4. **Send Messages**
   - Click on conversation
   - Type message and send
   - Should appear immediately
   - Switch to creator account - should see message in real-time

### Test Notifications:

1. **Trigger Notification**
   - As brand: Send a collaboration request
   - As creator: Check bell icon in navbar
   - Should show unread badge
   - Click bell - should see notification

2. **Mark as Read**
   - Click notification
   - Should navigate to correct page
   - Badge should decrease

### Test Portfolio:

1. **View Public Profile**
   - Go to `/creators/[instagram-handle]`
   - Should see creator profile
   - Should track profile view

2. **Add Portfolio Item** (via API for now)
   ```bash
   curl -X POST http://localhost:3000/api/portfolio/items \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "title": "Nike Campaign",
       "description": "Successful shoe launch",
       "brand_worked_with": "Nike",
       "result_metric": "2.1M reach"
     }'
   ```

### Test Reviews:

1. **Complete a Collaboration**
   ```sql
   -- In Supabase SQL Editor
   UPDATE collaboration_requests 
   SET status = 'completed' 
   WHERE id = 'some-request-id';
   ```

2. **Submit Review** (via API)
   ```bash
   curl -X POST http://localhost:3000/api/reviews \
     -H "Content-Type: application/json" \
     -d '{
       "collaboration_request_id": "request-id",
       "rating": 5,
       "review_text": "Great to work with!"
     }'
   ```

---

## 📊 Monitor in Real-Time

### Watch Database Changes:

```sql
-- In Supabase SQL Editor, run this to see live activity
SELECT 
  schemaname,
  relname as table_name,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname IN ('conversations', 'messages', 'notifications', 'reviews')
ORDER BY n_tup_ins DESC;
```

### Check Logs:

- **Supabase**: Dashboard → Logs → API Logs
- **Browser**: Open DevTools → Console
- **Network**: DevTools → Network tab

---

## ✅ Success Criteria

You'll know everything is working when:

- ✅ All 5 migrations run without errors
- ✅ 7 new tables exist in database
- ✅ Realtime enabled for 3 tables
- ✅ Storage buckets created
- ✅ `npm run build` completes successfully
- ✅ Dev server starts without errors
- ✅ Can send/receive messages in real-time
- ✅ Notifications appear immediately
- ✅ Public creator profiles load
- ✅ Reviews can be submitted

---

## 🆘 Need Help?

### Check These First:

1. **Supabase Logs**: Dashboard → Logs
2. **Browser Console**: F12 → Console tab
3. **Network Tab**: F12 → Network tab
4. **Terminal Output**: Check for errors

### Common Error Messages:

**"relation does not exist"**
→ Migration didn't run. Re-run the migration.

**"permission denied"**
→ RLS policy issue. Check clerk_user_id is set.

**"function does not exist"**
→ Migration incomplete. Re-run all migrations.

**"realtime not working"**
→ Enable realtime in Supabase dashboard.

---

## 🎉 You're Done!

If all checks pass, you now have:
- ✅ Real-time messaging system
- ✅ Notification center
- ✅ Creator portfolios
- ✅ Reviews & ratings
- ✅ Payment system (database ready)

**Next Steps**: Follow `IMPLEMENTATION_GUIDE_SECTIONS_5_15.md` to complete remaining features!
