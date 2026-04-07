# ✅ InstaCollab Setup Checklist

## 🎯 Complete This Checklist in Order

---

## 📦 PHASE 1: Database Setup

### Step 1.1: Run SQL Migrations
- [ ] Open Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Open file: `RUN_ALL_MIGRATIONS.sql`
- [ ] Copy entire content
- [ ] Paste in SQL Editor
- [ ] Click "RUN"
- [ ] Wait for success message
- [ ] Verify: "✅ All migrations completed successfully!"

### Step 1.2: Verify Tables Created
- [ ] Run verification query (in SQL Editor):
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages', 'notifications', 'portfolio_items', 'reviews', 'payments', 'profile_views')
ORDER BY table_name;
```
- [ ] Confirm: 7 rows returned

### Step 1.3: Create Storage Buckets
- [ ] Go to Storage in Supabase
- [ ] Create bucket: `portfolio-media` (public: yes)
- [ ] Create bucket: `avatars` (public: yes)
- [ ] Verify: 2 buckets visible in list

### Step 1.4: Enable Realtime
- [ ] Go to Database → Replication
- [ ] Enable for: `conversations`
- [ ] Enable for: `messages`
- [ ] Enable for: `notifications`
- [ ] Verify: All 3 show "Enabled"

### Step 1.5: Update User IDs
- [ ] Go to Clerk Dashboard → Users
- [ ] Copy User ID for a creator (starts with `user_2...`)
- [ ] Copy User ID for a brand
- [ ] Run in Supabase SQL Editor:
```sql
UPDATE creators SET clerk_user_id = 'user_2xxxxx' WHERE email = 'creator@example.com';
UPDATE brands SET clerk_user_id = 'user_2xxxxx' WHERE email = 'brand@example.com';
```
- [ ] Verify: `SELECT * FROM creators WHERE clerk_user_id IS NOT NULL;`

---

## 💻 PHASE 2: Local Development Setup

### Step 2.1: Install Dependencies
- [ ] Open terminal
- [ ] Navigate to project: `cd /path/to/instacollab`
- [ ] Run: `npm install`
- [ ] Wait for completion
- [ ] Verify: No error messages

### Step 2.2: Check Environment Variables
- [ ] Open `.env` file
- [ ] Verify exists: `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Verify exists: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verify exists: `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Verify exists: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Verify exists: `CLERK_SECRET_KEY`
- [ ] Verify exists: `OPENAI_API_KEY`
- [ ] All values filled (no empty strings)

### Step 2.3: Build Check
- [ ] Run: `npm run build`
- [ ] Wait for completion
- [ ] Verify: "✓ Compiled successfully"
- [ ] Verify: No TypeScript errors
- [ ] Verify: No ESLint errors

### Step 2.4: Start Dev Server
- [ ] Run: `npm run dev`
- [ ] Wait for: "Ready in X.Xs"
- [ ] Verify: Shows "Local: http://localhost:3000"
- [ ] Keep terminal open

---

## 🧪 PHASE 3: Feature Testing

### Step 3.1: Test Homepage
- [ ] Open browser: `http://localhost:3000`
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Navigation bar visible

### Step 3.2: Test Authentication
- [ ] Click "Sign In" or "Get Started"
- [ ] Clerk login modal appears
- [ ] Can login with test account
- [ ] Redirects to dashboard
- [ ] User name shows in navbar

### Step 3.3: Test Messaging
- [ ] Navigate to: `/messages`
- [ ] Page loads without errors
- [ ] See conversation list (or empty state)
- [ ] No console errors
- [ ] Bell icon visible in navbar

### Step 3.4: Test Notifications
- [ ] Click bell icon in navbar
- [ ] Dropdown opens
- [ ] Shows notifications or "No notifications yet"
- [ ] No console errors

### Step 3.5: Test Creator Profile
- [ ] Navigate to: `/creators/[any-handle]`
- [ ] Profile page loads
- [ ] Shows creator info
- [ ] No console errors

### Step 3.6: Test API Routes
Open new terminal and run:
- [ ] `curl http://localhost:3000/api/conversations`
- [ ] Returns JSON (may be empty array or auth error - both OK)
- [ ] `curl http://localhost:3000/api/notifications`
- [ ] Returns JSON
- [ ] No 500 errors

---

## 🔍 PHASE 4: Database Verification

### Step 4.1: Check Realtime
Run in Supabase SQL Editor:
- [ ] Query:
```sql
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('conversations', 'messages', 'notifications');
```
- [ ] Returns 3 rows

### Step 4.2: Check Functions
- [ ] Query:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_conversation_on_message', 'create_notification', 'recalculate_rating');
```
- [ ] Returns 3+ rows

### Step 4.3: Check Triggers
- [ ] Query:
```sql
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('messages', 'reviews', 'payments');
```
- [ ] Returns 3+ rows

### Step 4.4: Run Complete Verification
- [ ] Copy verification script from `COMMANDS_TO_RUN.md`
- [ ] Paste in SQL Editor
- [ ] Run
- [ ] Verify: "✅ SETUP COMPLETE!"

---

## 🎨 PHASE 5: UI/UX Verification

### Step 5.1: Desktop View
- [ ] Homepage looks good
- [ ] Dashboard loads properly
- [ ] Messages page has two panels
- [ ] Notification dropdown styled correctly
- [ ] All buttons clickable
- [ ] No layout issues

### Step 5.2: Mobile View
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select iPhone 12 Pro
- [ ] Homepage responsive
- [ ] Dashboard responsive
- [ ] Messages full-screen
- [ ] Navbar collapses properly

### Step 5.3: Dark Mode (if applicable)
- [ ] Toggle dark mode
- [ ] All text readable
- [ ] Proper contrast
- [ ] No white flashes

---

## 🚀 PHASE 6: Production Readiness

### Step 6.1: Code Quality
- [ ] Run: `npm run lint`
- [ ] No errors (warnings OK)
- [ ] Run: `npx tsc --noEmit`
- [ ] No TypeScript errors

### Step 6.2: Performance
- [ ] Open Lighthouse (DevTools → Lighthouse)
- [ ] Run audit
- [ ] Performance > 70
- [ ] Accessibility > 90
- [ ] Best Practices > 90

### Step 6.3: Security
- [ ] No API keys in client code
- [ ] .env not committed to git
- [ ] RLS enabled on all tables
- [ ] Auth required for protected routes

---

## 📊 FINAL VERIFICATION

### Run Complete System Check:

```sql
-- Copy and run in Supabase SQL Editor
DO $$
DECLARE
  v_tables INT;
  v_realtime INT;
  v_buckets INT;
  v_users INT;
BEGIN
  SELECT COUNT(*) INTO v_tables FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name IN ('conversations', 'messages', 'notifications', 'portfolio_items', 'reviews', 'payments', 'profile_views');
  
  SELECT COUNT(*) INTO v_realtime FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime' AND tablename IN ('conversations', 'messages', 'notifications');
  
  SELECT COUNT(*) INTO v_buckets FROM storage.buckets WHERE name IN ('portfolio-media', 'avatars');
  
  SELECT COUNT(*) INTO v_users FROM creators WHERE clerk_user_id IS NOT NULL;
  
  RAISE NOTICE '================================';
  RAISE NOTICE 'FINAL SYSTEM CHECK';
  RAISE NOTICE '================================';
  RAISE NOTICE 'Tables: % / 7 ✓', v_tables;
  RAISE NOTICE 'Realtime: % / 3 ✓', v_realtime;
  RAISE NOTICE 'Buckets: % / 2 ✓', v_buckets;
  RAISE NOTICE 'Users with Clerk ID: %', v_users;
  RAISE NOTICE '================================';
  
  IF v_tables = 7 AND v_realtime = 3 AND v_buckets = 2 AND v_users > 0 THEN
    RAISE NOTICE '🎉 ALL SYSTEMS GO!';
    RAISE NOTICE 'Your InstaCollab upgrade is ready!';
  ELSE
    RAISE NOTICE '⚠️ Some items need attention';
  END IF;
END $$;
```

### Expected Output:
```
================================
FINAL SYSTEM CHECK
================================
Tables: 7 / 7 ✓
Realtime: 3 / 3 ✓
Buckets: 2 / 2 ✓
Users with Clerk ID: 2
================================
🎉 ALL SYSTEMS GO!
Your InstaCollab upgrade is ready!
```

---

## ✅ COMPLETION CHECKLIST

Mark these when ALL items above are checked:

- [ ] ✅ Phase 1: Database Setup (100%)
- [ ] ✅ Phase 2: Local Development Setup (100%)
- [ ] ✅ Phase 3: Feature Testing (100%)
- [ ] ✅ Phase 4: Database Verification (100%)
- [ ] ✅ Phase 5: UI/UX Verification (100%)
- [ ] ✅ Phase 6: Production Readiness (100%)
- [ ] ✅ Final Verification Passed

---

## 🎉 SUCCESS!

When all checkboxes are marked:

**You have successfully implemented:**
- ✅ Real-time messaging system
- ✅ Notification center
- ✅ Creator portfolio & media kit
- ✅ Reviews & ratings system
- ✅ Payment system (database ready)

**Next Steps:**
1. Read: `IMPLEMENTATION_GUIDE_SECTIONS_5_15.md`
2. Complete: Remaining 11 sections
3. Deploy: Follow `PRE_DEPLOYMENT_CHECKLIST.md`

---

## 📞 Need Help?

If any checkbox fails:

1. **Check**: `EXECUTE_NOW.md` for detailed steps
2. **Check**: `COMMANDS_TO_RUN.md` for exact commands
3. **Check**: `QUICK_START_GUIDE.md` for troubleshooting
4. **Check**: Browser console for errors (F12)
5. **Check**: Supabase logs in dashboard

---

**Last Updated**: Before first run
**Status**: Ready to execute
**Estimated Time**: 30-45 minutes
