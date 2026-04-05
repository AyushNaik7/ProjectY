# Complete Fix Guide - Campaigns Not Showing

## Problem Analysis

### Issue 1: "No active campaigns found" on Matched Campaigns page

**Possible Causes:**
1. You're logged in as a **Brand** (brands only see their own campaigns)
2. You're logged in as a **Creator** but:
   - No campaigns exist in database
   - Creator profile is incomplete
   - AI matching is failing
   - Embeddings are not generated

### Issue 2: Send Request button error

**Cause:** Database constraint - `campaign_id` is NOT NULL

---

## Solutions

### Fix 1: Database Migration (MUST DO FIRST)

**Run this in Supabase SQL Editor:**

```sql
-- Fix 1: Make campaign_id nullable
ALTER TABLE collaboration_requests 
  ALTER COLUMN campaign_id DROP NOT NULL;

-- Fix 2: Add index
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_campaign_id 
  ON collaboration_requests(campaign_id) 
  WHERE campaign_id IS NOT NULL;
```

### Fix 2: Add Demo Data (If no campaigns exist)

**Check if campaigns exist:**

```sql
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN status = 'active' THEN 1 END) as active
FROM campaigns;
```

**If count is 0, run the demo data:**

1. Open `DEMO_DATA_CAMPAIGNS.sql`
2. Copy all content
3. Run in Supabase SQL Editor

### Fix 3: Ensure You're Logged in as Creator

**To see "Matched Campaigns", you MUST be logged in as a Creator, not a Brand.**

Check your role:
```sql
-- Replace 'YOUR_USER_ID' with your actual user ID
SELECT id, name, niche, instagram_followers 
FROM creators 
WHERE id = 'YOUR_USER_ID';
```

If no result, you're logged in as a brand. Create a creator account or switch accounts.

### Fix 4: Generate Embeddings (If campaigns exist but not showing)

**Check if embeddings exist:**

```sql
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(embedding) as with_embedding,
  COUNT(*) - COUNT(embedding) as without_embedding
FROM campaigns
WHERE status = 'active';
```

**If embeddings are missing, generate them:**

```sql
-- This will be handled by your backend API
-- You may need to trigger embedding generation
```

---

## Step-by-Step Testing

### Step 1: Fix Database
```sql
ALTER TABLE collaboration_requests ALTER COLUMN campaign_id DROP NOT NULL;
```

### Step 2: Verify Demo Data
```sql
SELECT COUNT(*) FROM campaigns WHERE status = 'active';
-- Should return > 0
```

### Step 3: Check Your Role
- Go to your app
- Open browser console (F12)
- Type: `localStorage` and check for role
- Or check in your profile settings

### Step 4: Test as Creator
1. Log in as a **Creator** account
2. Go to `/campaigns` page
3. Should see "Matched Campaigns" with AI scores

### Step 5: Test as Brand
1. Log in as a **Brand** account
2. Go to `/campaigns` page
3. Should see "Your Campaigns" (only your own)
4. Go to Dashboard
5. Select a campaign
6. Click "Find Creators"
7. Click "Send Request" - should work now!

---

## Quick Diagnostic Commands

**Run these in Supabase SQL Editor:**

```sql
-- 1. Check campaigns
SELECT status, COUNT(*) FROM campaigns GROUP BY status;

-- 2. Check creators
SELECT COUNT(*) FROM creators;

-- 3. Check brands
SELECT COUNT(*) FROM brands;

-- 4. Check collaboration_requests constraint
SELECT 
  column_name, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
  AND column_name = 'campaign_id';
-- Should show: is_nullable = 'YES'

-- 5. Check embeddings
SELECT 
  'campaigns' as table_name,
  COUNT(*) as total,
  COUNT(embedding) as with_embedding
FROM campaigns
UNION ALL
SELECT 
  'creators' as table_name,
  COUNT(*) as total,
  COUNT(embedding) as with_embedding
FROM creators;
```

---

## Common Issues & Solutions

### "No active campaigns found" for Creator
- **Solution**: Run `DEMO_DATA_CAMPAIGNS.sql` to add campaigns
- **Or**: Wait for brands to create campaigns

### "No active campaigns found" for Brand
- **Solution**: Create a campaign via "New Campaign" button
- **Or**: Your campaigns might be in 'draft' status - change to 'active'

### Send Request still failing
- **Solution**: Make sure you ran the ALTER TABLE command
- **Verify**: Run the diagnostic query for `is_nullable`

### Campaigns showing but no match scores
- **Solution**: Embeddings might be missing
- **Check**: Run embedding diagnostic query
- **Fix**: Trigger embedding generation via API

---

## Files to Check

1. ✅ `APPLY_FIX_NOW.sql` - Database fix
2. ✅ `debug-campaigns.sql` - Diagnostic queries
3. ✅ `DEMO_DATA_CAMPAIGNS.sql` - Sample data
4. ✅ `check-database.sql` - Verify fixes

---

## Still Not Working?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Restart dev server**: Stop and start `npm run dev`
3. **Check browser console**: F12 > Console tab for errors
4. **Check Network tab**: F12 > Network > Look for failed API calls
5. **Verify Supabase connection**: Check `.env` file has correct credentials
