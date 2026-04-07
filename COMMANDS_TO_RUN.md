# 🎯 Commands to Run - Complete Reference

## 📋 Quick Checklist

- [ ] Step 1: Run SQL migrations in Supabase
- [ ] Step 2: Create storage buckets
- [ ] Step 3: Enable realtime
- [ ] Step 4: Update clerk_user_id
- [ ] Step 5: Install dependencies
- [ ] Step 6: Start dev server
- [ ] Step 7: Test features

---

## STEP 1: Run SQL Migrations

### Option A: Run All at Once (Recommended)

1. Open Supabase Dashboard
2. Go to: **SQL Editor**
3. Click: **New Query**
4. Copy entire content from: `RUN_ALL_MIGRATIONS.sql`
5. Click: **RUN**
6. Wait for success message

### Option B: Run One by One

Run each file in order:

```sql
-- 1. Copy content from: supabase/migrations/014_conversations_and_messages.sql
-- Paste in Supabase SQL Editor → RUN

-- 2. Copy content from: supabase/migrations/015_notifications.sql
-- Paste in Supabase SQL Editor → RUN

-- 3. Copy content from: supabase/migrations/016_creator_portfolio.sql
-- Paste in Supabase SQL Editor → RUN

-- 4. Copy content from: supabase/migrations/017_reviews_and_ratings.sql
-- Paste in Supabase SQL Editor → RUN

-- 5. Copy content from: supabase/migrations/018_escrow_payments.sql
-- Paste in Supabase SQL Editor → RUN
```

---

## STEP 2: Create Storage Buckets

### In Supabase Dashboard:

1. Go to: **Storage**
2. Click: **Create new bucket**

**Bucket 1:**
- Name: `portfolio-media`
- Public: ✅ Yes
- Click: **Create bucket**

**Bucket 2:**
- Name: `avatars`
- Public: ✅ Yes
- Click: **Create bucket**

### Or via SQL:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('portfolio-media', 'portfolio-media', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

---

## STEP 3: Enable Realtime

### In Supabase Dashboard:

1. Go to: **Database → Replication**
2. Find these tables and click **Enable**:
   - `conversations`
   - `messages`
   - `notifications`

### Or via SQL:

```sql
-- Run in Supabase SQL Editor
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

## STEP 4: Update clerk_user_id for Existing Users

### Get Clerk User IDs:

1. Go to: **Clerk Dashboard → Users**
2. Click on each user
3. Copy their User ID (starts with `user_2...`)

### Update Database:

```sql
-- Run in Supabase SQL Editor
-- Replace 'user_2xxxxx' with actual Clerk user IDs

-- Update creators
UPDATE creators 
SET clerk_user_id = 'user_2xxxxxxxxxxxxx'
WHERE email = 'creator@example.com';

-- Update brands
UPDATE brands 
SET clerk_user_id = 'user_2xxxxxxxxxxxxx'
WHERE email = 'brand@example.com';

-- Verify
SELECT id, email, clerk_user_id FROM creators WHERE clerk_user_id IS NOT NULL;
SELECT id, email, clerk_user_id FROM brands WHERE clerk_user_id IS NOT NULL;
```

---

## STEP 5: Install Dependencies

### In Your Terminal:

```bash
# Navigate to project directory
cd /path/to/instacollab

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### Expected Output:
```
instacollab@0.1.0
├── @clerk/nextjs@6.38.3
├── @supabase/supabase-js@2.95.3
├── framer-motion@12.34.0
├── lucide-react@0.563.0
├── next@14.2.35
├── react@18
└── ... (other packages)
```

---

## STEP 6: Start Development Server

```bash
# Start dev server
npm run dev
```

### Expected Output:
```
  ▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in 2.5s
```

### Open Browser:
```
http://localhost:3000
```

---

## STEP 7: Test Features

### Test 1: Check Database

```sql
-- Run in Supabase SQL Editor
-- Should return 7 tables
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
```

### Test 2: Check Realtime

```sql
-- Should show conversations, messages, notifications
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('conversations', 'messages', 'notifications');
```

### Test 3: Test in Browser

1. **Login as Brand**
   ```
   http://localhost:3000/login
   ```

2. **Go to Messages**
   ```
   http://localhost:3000/messages
   ```

3. **Check Notifications**
   - Click bell icon in navbar
   - Should see dropdown

4. **View Creator Profile**
   ```
   http://localhost:3000/creators/[handle]
   ```

---

## 🔧 Troubleshooting Commands

### If Build Fails:

```bash
# Clear cache
rm -rf .next
npm cache clean --force

# Reinstall
rm -rf node_modules
npm install

# Try build again
npm run build
```

### If TypeScript Errors:

```bash
# Check for errors
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/app/api/conversations/route.ts
```

### If ESLint Errors:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Check Environment Variables:

```bash
# Print env vars (be careful with secrets!)
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
node -e "console.log(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)"
```

### Test API Routes:

```bash
# Test conversations API
curl http://localhost:3000/api/conversations

# Test notifications API
curl http://localhost:3000/api/notifications

# Test with auth (replace TOKEN)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/conversations
```

---

## 📊 Verification Commands

### Check All Tables Exist:

```sql
SELECT 
  'conversations' as table_name,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') as exists
UNION ALL
SELECT 'messages', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'messages')
UNION ALL
SELECT 'notifications', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
UNION ALL
SELECT 'portfolio_items', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_items')
UNION ALL
SELECT 'reviews', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews')
UNION ALL
SELECT 'payments', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'payments')
UNION ALL
SELECT 'profile_views', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_views');
```

### Check All Indexes:

```sql
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'messages', 'notifications', 'portfolio_items', 'reviews', 'payments')
ORDER BY tablename, indexname;
```

### Check All Functions:

```sql
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_conversation_on_message',
    'create_notification',
    'recalculate_rating',
    'calculate_platform_fee',
    'auto_calculate_payment_fees'
  )
ORDER BY routine_name;
```

### Check All Triggers:

```sql
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('conversations', 'messages', 'notifications', 'reviews', 'payments')
ORDER BY event_object_table, trigger_name;
```

---

## 🎯 Success Verification

### Run This Complete Check:

```sql
DO $$
DECLARE
  v_tables INT;
  v_realtime INT;
  v_functions INT;
  v_triggers INT;
  v_buckets INT;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO v_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('conversations', 'messages', 'notifications', 'portfolio_items', 'reviews', 'payments', 'profile_views');
  
  -- Count realtime tables
  SELECT COUNT(*) INTO v_realtime
  FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime'
    AND tablename IN ('conversations', 'messages', 'notifications');
  
  -- Count functions
  SELECT COUNT(*) INTO v_functions
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
    AND routine_name IN ('update_conversation_on_message', 'create_notification', 'recalculate_rating');
  
  -- Count triggers
  SELECT COUNT(*) INTO v_triggers
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public'
    AND event_object_table IN ('messages', 'reviews', 'payments');
  
  -- Count storage buckets
  SELECT COUNT(*) INTO v_buckets
  FROM storage.buckets
  WHERE name IN ('portfolio-media', 'avatars');
  
  -- Report
  RAISE NOTICE '=================================';
  RAISE NOTICE 'SETUP VERIFICATION REPORT';
  RAISE NOTICE '=================================';
  RAISE NOTICE 'Tables created: % / 7', v_tables;
  RAISE NOTICE 'Realtime enabled: % / 3', v_realtime;
  RAISE NOTICE 'Functions created: % / 3+', v_functions;
  RAISE NOTICE 'Triggers created: % / 3+', v_triggers;
  RAISE NOTICE 'Storage buckets: % / 2', v_buckets;
  RAISE NOTICE '=================================';
  
  IF v_tables = 7 AND v_realtime = 3 AND v_buckets = 2 THEN
    RAISE NOTICE '✅ SETUP COMPLETE!';
    RAISE NOTICE 'You can now run: npm run dev';
  ELSE
    RAISE NOTICE '⚠️  INCOMPLETE SETUP';
    IF v_tables < 7 THEN
      RAISE NOTICE '❌ Missing tables - rerun migrations';
    END IF;
    IF v_realtime < 3 THEN
      RAISE NOTICE '❌ Realtime not enabled - enable in dashboard';
    END IF;
    IF v_buckets < 2 THEN
      RAISE NOTICE '❌ Storage buckets missing - create in dashboard';
    END IF;
  END IF;
END $$;
```

---

## 📝 Quick Reference

### File Locations:
```
Migrations:     supabase/migrations/014-018_*.sql
All-in-one:     RUN_ALL_MIGRATIONS.sql
Setup Guide:    EXECUTE_NOW.md
Quick Start:    QUICK_START_GUIDE.md
Full Summary:   PRODUCTION_UPGRADE_SUMMARY.md
```

### Important URLs:
```
Supabase:       https://app.supabase.com
Clerk:          https://dashboard.clerk.com
Local Dev:      http://localhost:3000
```

### Key Commands:
```bash
npm install              # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm run lint            # Check code quality
npx tsc --noEmit        # Check TypeScript
```

---

## ✅ Final Checklist

Before considering setup complete:

- [ ] All 5 SQL migrations ran successfully
- [ ] 7 tables exist in database
- [ ] Realtime enabled for 3 tables
- [ ] 2 storage buckets created
- [ ] clerk_user_id populated for test users
- [ ] `npm install` completed
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can login with Clerk
- [ ] Can navigate to /messages
- [ ] Bell icon shows in navbar
- [ ] No console errors in browser

---

**You're all set!** 🎉

If all checks pass, your InstaCollab upgrade is ready to use!
