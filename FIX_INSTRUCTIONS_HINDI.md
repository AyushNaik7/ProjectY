# Database Fix - Step by Step (Hindi + English)

## Problem / समस्या
```
null value in column "id" of relation "collaboration_requests" violates not-null constraint
```

Yeh error aa raha hai kyunki database mein `campaign_id` column ko NOT NULL set hai, lekin code NULL value bhej raha hai.

---

## Solution / समाधान

### Step 1: Supabase Dashboard Open Karo

1. Browser mein jao: https://supabase.com/dashboard
2. Apna project select karo (ysbaxsczgauyslcbmazy)
3. Left sidebar mein **"SQL Editor"** pe click karo

### Step 2: SQL Query Run Karo

1. SQL Editor mein **"New query"** button pe click karo
2. Neeche diya hua SQL copy karo aur paste karo:

```sql
-- Make campaign_id nullable
ALTER TABLE collaboration_requests 
  ALTER COLUMN campaign_id DROP NOT NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_campaign_id 
  ON collaboration_requests(campaign_id) 
  WHERE campaign_id IS NOT NULL;
```

3. **"Run"** button pe click karo (ya Ctrl+Enter press karo)
4. Success message aana chahiye

### Step 3: Verify Karo

Same SQL Editor mein yeh query run karo:

```sql
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
  AND column_name = 'campaign_id';
```

**Expected Result:**
```
column_name  | is_nullable | data_type
campaign_id  | YES         | uuid
```

Agar `is_nullable = YES` dikhe, toh fix ho gaya! ✅

### Step 4: Test Karo

1. Apni app mein brand dashboard pe jao
2. Ek campaign select karo
3. "Find Creators" pe click karo
4. Kisi creator pe "Send Request" button click karo
5. Ab error nahi aana chahiye aur "Request sent successfully!" message dikhna chahiye

---

## Alternative: Direct Database Access

Agar aapke paas database ka direct access hai:

```bash
# Using psql
psql "postgresql://postgres:[YOUR-PASSWORD]@db.ysbaxsczgauyslcbmazy.supabase.co:5432/postgres" \
  -c "ALTER TABLE collaboration_requests ALTER COLUMN campaign_id DROP NOT NULL;"
```

---

## Troubleshooting

### Agar abhi bhi error aa raha hai:

1. **Browser cache clear karo**: Ctrl+Shift+Delete
2. **Dev server restart karo**: 
   ```bash
   # Terminal mein
   # Ctrl+C se stop karo
   # Phir se start karo
   npm run dev
   ```
3. **Check karo migration run hua ya nahi**:
   ```sql
   -- Supabase SQL Editor mein run karo
   SELECT is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'collaboration_requests' 
     AND column_name = 'campaign_id';
   ```

### Agar "permission denied" error aaye:

Supabase dashboard mein SQL Editor use karo, woh automatically service role use karta hai jo full permissions deta hai.

---

## Files to Check

Yeh files check karo ki sab theek hai:

1. ✅ `src/app/dashboard/brand/page.tsx` - Send Request button implementation
2. ✅ `src/app/api/requests/route.ts` - API endpoint
3. ⚠️ Database schema - Migration run karna hai

---

## Contact Support

Agar phir bhi problem hai toh:
1. Supabase dashboard mein SQL Editor ka screenshot bhejo
2. Browser console ka error message copy karo (F12 > Console tab)
3. Network tab mein `/api/requests` call ka response dekho
