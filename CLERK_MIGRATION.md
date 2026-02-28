# Clerk Authentication Migration

## What Changed

Successfully migrated from Supabase Auth to Clerk authentication while keeping Supabase as the database.

## Changes Made

### 1. New Files Created
- `src/context/ClerkAuthContext.tsx` - New auth context using Clerk
- `src/components/Header.tsx` - Header with Clerk auth components

### 2. Updated Files

#### Core Setup
- `src/app/layout.tsx` - Wrapped app with ClerkProvider and ClerkAuthContext
- `middleware.ts` - Added clerkMiddleware()
- `.env` - Added Clerk environment variables

#### Auth Pages (Replaced with Clerk Components)
- `src/app/login/page.tsx` - Now uses Clerk's SignIn component
- `src/app/signup/page.tsx` - Now uses Clerk's SignUp component

#### All Page Components Updated
- `src/app/page.tsx`
- `src/app/role-select/page.tsx`
- `src/app/campaigns/**/*.tsx`
- `src/app/creators/**/*.tsx`
- `src/app/dashboard/**/*.tsx`
- `src/app/onboarding/**/*.tsx`
- `src/app/saved/**/*.tsx`
- `src/app/settings/page.tsx`
- `src/app/signout/page.tsx`
- `src/app/requests/page.tsx`
- `src/components/DashboardShell.tsx`

All now use `useAuth()` from `@/context/ClerkAuthContext` instead of `useSupabaseAuth()`

#### API Routes
- `src/lib/request-auth.ts` - Updated to use Clerk's auth()
- `src/app/api/campaigns/route.ts` - Updated to get role from Clerk metadata

## How It Works

### User Flow
1. User signs up/logs in via Clerk (Google OAuth or email/password)
2. After authentication, redirected to `/role-select`
3. User selects role (creator or brand)
4. Role is stored in Clerk's `publicMetadata`
5. User completes onboarding
6. Onboarding status stored in Clerk's `publicMetadata`

### Data Storage
- **Authentication**: Clerk (user accounts, sessions, OAuth)
- **Database**: Supabase (campaigns, creator profiles, requests, etc.)
- **User Metadata**: Clerk publicMetadata stores:
  - `role`: "creator" | "brand"
  - `onboarding_complete`: boolean

### API Authentication
- API routes use Clerk's `auth()` to get the current user
- User ID from Clerk is used to query Supabase database
- Role is fetched from Clerk's user metadata when needed

## Environment Variables

Required in `.env`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/role-select
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/role-select
```

## Next Steps

### 1. Sync Users to Supabase
You'll want to create a Clerk webhook to sync user data to your Supabase database:

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
  
  const body = await req.text();
  
  const wh = new Webhook(WEBHOOK_SECRET);
  const evt = wh.verify(body, {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  });
  
  const { id, email_addresses, public_metadata } = evt.data;
  const eventType = evt.type;
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    // Sync to Supabase
    await supabaseAdmin
      .from('users')
      .upsert({
        id,
        email: email_addresses[0].email_address,
        role: public_metadata.role,
        // ... other fields
      });
  }
  
  return new Response('', { status: 200 });
}
```

### 2. Update Remaining API Routes
Check other API routes that might need similar updates to get role from Clerk metadata.

### 3. Test All Flows
- Sign up flow
- Login flow
- Role selection
- Onboarding (creator & brand)
- Dashboard access
- Campaign creation
- Creator search

### 4. Remove Old Supabase Auth Code (Optional)
Once everything is working, you can:
- Delete `src/context/SupabaseAuthContext.tsx`
- Remove Supabase auth-related functions from `src/lib/supabase-server.ts`
- Clean up any unused auth utilities

## Benefits of Clerk

1. **Better UX**: Polished, professional auth UI out of the box
2. **Social Auth**: Easy Google, Instagram, etc. integration
3. **User Management**: Built-in dashboard for managing users
4. **Security**: Enterprise-grade security by default
5. **Less Code**: No need to maintain custom auth logic
6. **Webhooks**: Easy user sync to your database

## Troubleshooting

### Users not redirecting after login
- Check `.env` has correct `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- Verify middleware matcher includes the auth routes

### Role not persisting
- Ensure `setRole()` is called after role selection
- Check Clerk dashboard that publicMetadata is being updated

### API routes returning 401
- Verify Clerk middleware is running
- Check that `CLERK_SECRET_KEY` is set correctly
- Ensure API routes are using updated `requireUser()` function
