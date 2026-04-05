# Fix: Null ID in Collaboration Requests

## Problem
When sending a collaboration request to a creator, the error occurs:
```
null value in column "id" of relation "collaboration_requests" violates not-null constraint
```

## Root Cause
The `.insert()` method was receiving a single object instead of an array, which can cause Supabase to not properly apply the default UUID generation.

## Solution Applied

### 1. Code Fix (src/app/api/requests/route.ts)
Changed the insert call to wrap the payload in an array:
```typescript
.insert([insertPayload])  // Was: .insert(insertPayload)
```

### 2. Database Migration (013_fix_collaboration_requests_id.sql)
Ensures the default UUID generation is properly set on the id column.

## How to Apply

1. Run the migration:
```bash
# If using Supabase CLI
supabase db push

# Or apply directly to your database
psql $DATABASE_URL -f supabase/migrations/013_fix_collaboration_requests_id.sql
```

2. Restart your Next.js development server:
```bash
npm run dev
```

3. Test by sending a collaboration request from a brand to a creator.

## Verification
Run this SQL to verify the fix:
```sql
SELECT column_name, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
AND column_name = 'id';
```

Expected result:
- column_default: `gen_random_uuid()`
- is_nullable: `NO`
