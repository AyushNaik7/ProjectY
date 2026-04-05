# How to Apply the Database Migration

## Option 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
# Push the migration to your database
supabase db push
```

## Option 2: Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the following SQL:

```sql
-- Make campaign_id nullable in collaboration_requests
-- This allows brands to send general collaboration requests without a specific campaign

ALTER TABLE collaboration_requests
  ALTER COLUMN campaign_id DROP NOT NULL;

-- Add index for queries filtering by null campaign_id
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_campaign_id 
  ON collaboration_requests(campaign_id) 
  WHERE campaign_id IS NOT NULL;
```

5. Click **Run** to execute the migration

## Option 3: Using psql

If you have direct database access:

```bash
psql "your-connection-string" -f supabase/migrations/012_make_campaign_id_nullable.sql
```

## Verification

After running the migration, verify it worked:

```sql
-- Check the column is now nullable
SELECT 
  column_name, 
  is_nullable, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
  AND column_name = 'campaign_id';

-- Should show: is_nullable = 'YES'
```

## Testing

After migration, test the Send Request functionality:

1. Log in as a brand
2. Go to Dashboard
3. Select a campaign
4. Click "Find Creators"
5. Click "Send Request" on a creator
6. Should see success message without errors
