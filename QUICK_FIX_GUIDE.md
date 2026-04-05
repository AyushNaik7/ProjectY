# Quick Fix Guide for Database and AI Issues

## Issues Identified

1. **Database Constraint Error**: `null value in column "id" of relation "collaboration_requests" violates not-null constraint`
2. **AI Functionality Not Working**: The campaigns page at `http://localhost:3000/campaigns` is not showing AI-matched campaigns
3. **Vector Extension Missing**: `type vector does not exist` error

## Root Causes

1. The `collaboration_requests` table `id` column doesn't have a proper UUID default value
2. The `campaign_id` column has a NOT NULL constraint but should be nullable for general requests
3. The `pgvector` extension is not installed in the database

## Solution Steps

### Step 1: Fix Collaboration Requests (IMMEDIATE)

Run this first to fix the constraint error:

```bash
# Apply the basic fix without vector functions
psql your_database_url -f COMPLETE_DATABASE_FIX.sql
```

This will:
- Fix the `id` column UUID default
- Make `campaign_id` nullable
- Add performance indexes
- **NOT require vector extension**

### Step 2: Test Collaboration Requests

After Step 1, test that collaboration requests work:
1. Log in as a brand user
2. Go to a creator profile
3. Try sending a collaboration request
4. Should work without null constraint errors

### Step 3: Setup AI Functionality (OPTIONAL)

For AI matching to work, you need the vector extension:

**If using Supabase:**
```sql
-- In Supabase SQL Editor, run:
CREATE EXTENSION IF NOT EXISTS vector;
```

**If using local PostgreSQL:**
```bash
# Install pgvector first
# On Ubuntu/Debian:
sudo apt-get install postgresql-14-pgvector

# On macOS with Homebrew:
brew install pgvector

# Then run:
psql your_database_url -f SETUP_VECTOR_EXTENSION.sql
```

### Step 4: Verify Everything Works

1. **Check collaboration_requests is fixed**:
   ```sql
   SELECT column_name, is_nullable, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'collaboration_requests' 
   AND column_name IN ('id', 'campaign_id');
   ```

2. **Test the campaigns page**:
   - Go to `http://localhost:3000/campaigns` as a creator
   - Should show campaigns (AI-matched if vector extension installed, or fallback)

## Expected Results After Step 1 (Immediate Fix)

✅ **Collaboration Requests**: 
- Brands can send requests without null ID errors
- General requests work (without specific campaign)
- Campaign-specific requests work

⚠️ **AI Functionality**:
- Will use fallback mode (shows all active campaigns)
- No AI matching until vector extension is installed

## Expected Results After Step 3 (Full Fix)

✅ **Everything from Step 1 PLUS**:
- AI-powered campaign matching for creators
- Semantic similarity scoring
- Personalized campaign recommendations

## Fallback Behavior

The system gracefully handles missing AI functionality:

1. **No Vector Extension**: Falls back to rule-based matching
2. **No Embeddings**: Shows all active campaigns
3. **API Errors**: Shows appropriate error messages

## Priority Order

1. **FIRST**: Run `COMPLETE_DATABASE_FIX.sql` (fixes immediate errors)
2. **SECOND**: Test collaboration requests work
3. **THIRD**: Install vector extension if you want AI features
4. **FOURTH**: Run `SETUP_VECTOR_EXTENSION.sql`

## Quick Verification

```sql
-- After Step 1 - should return: id_default contains 'gen_random_uuid', campaign_id_nullable = 'YES'
SELECT 
  (SELECT column_default FROM information_schema.columns 
   WHERE table_name = 'collaboration_requests' AND column_name = 'id') as id_default,
  (SELECT is_nullable FROM information_schema.columns 
   WHERE table_name = 'collaboration_requests' AND column_name = 'campaign_id') as campaign_id_nullable;

-- After Step 3 - should return: vector_installed = true
SELECT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'vector'
) as vector_installed;
```

**The most important fix is Step 1 - this will resolve your immediate constraint error. The AI functionality can be added later.**