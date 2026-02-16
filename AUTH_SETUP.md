# Supabase Authentication Setup Guide

## Overview

Your CreatorDeal app now has complete authentication with role-based access:
- **Login/Signup** with email and password
- **Role Selection** (Creator or Brand)
- **Protected Routes** that redirect based on role
- **Persistent Sessions** using localStorage

## Authentication Flow

```
1. User visits app
   ↓
2. Redirected to /login (if not authenticated)
   ↓
3. User signs up or logs in
   ↓
4. Redirected to /role-select
   ↓
5. User chooses Creator or Brand
   ↓
6. Redirected to respective dashboard
   ↓
7. User can access all features
```

## Setup Steps

### Step 1: Enable Authentication in Supabase

1. Go to your Supabase Dashboard
2. Click on **Authentication** (left sidebar)
3. Go to **Providers**
4. Make sure **Email** is enabled (it should be by default)
5. Go to **URL Configuration**
6. Add your app URLs:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/role-select`

### Step 2: Environment Variables

Your `.env.local` already has:
```
NEXT_PUBLIC_SUPABASE_URL=https://ysbaxsczgauyslcbmazy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_afijey5gWkplgrvHgY7VkQ_solJCRDUanon key
```

These are already configured! ✅

### Step 3: Test Authentication

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
   - You should be redirected to `/login`

3. Click "Sign up" and create an account:
   - Email: `test@example.com`
   - Password: `password123`

4. After signup, you'll be redirected to `/login`
   - Sign in with your credentials

5. You'll be redirected to `/role-select`
   - Choose "Creator" or "Brand"

6. You'll be taken to the respective dashboard!

## File Structure

### Authentication Files

```
src/
├── lib/
│   └── auth-service.ts          # Supabase auth functions
├── context/
│   └── SupabaseAuthContext.tsx   # Auth context provider
└── app/
    ├── login/page.tsx            # Login page
    ├── signup/page.tsx           # Signup page
    ├── role-select/page.tsx      # Role selection page
    ├── page.tsx                  # Creator dashboard (protected)
    └── dashboard/brand/page.tsx  # Brand dashboard (protected)
```

## Key Components

### SupabaseAuthContext

Provides authentication state and functions:

```typescript
const { user, role, loading, signIn, signUp, signOut, setRole } = useSupabaseAuth();
```

**Properties:**
- `user` - Current authenticated user
- `role` - User's selected role ('creator' or 'brand')
- `loading` - Loading state during auth check
- `signIn(email, password)` - Sign in user
- `signUp(email, password)` - Create new account
- `signOut()` - Sign out user
- `setRole(role)` - Set user role

### Protected Routes

Both dashboards check authentication:

```typescript
useEffect(() => {
  if (!loading && (!user || role !== 'creator')) {
    router.push('/login');
  }
}, [user, role, loading, router]);
```

## Usage Examples

### Sign In
```typescript
const { signIn } = useSupabaseAuth();

await signIn('user@example.com', 'password123');
// User is redirected to /role-select
```

### Sign Up
```typescript
const { signUp } = useSupabaseAuth();

await signUp('newuser@example.com', 'password123');
// User receives confirmation email
```

### Set Role
```typescript
const { setRole } = useSupabaseAuth();

await setRole('creator');
// User is redirected to creator dashboard
```

### Sign Out
```typescript
const { signOut } = useSupabaseAuth();

await signOut();
// User is redirected to /login
```

## Database Integration

When a user signs up, you can create their profile:

```typescript
import { createUserProfile } from '@/lib/auth-service';

// After signup
await createUserProfile(userId, 'creator', {
  name: 'John Doe',
  email: 'john@example.com',
  niche: 'Tech',
  bio: 'Tech enthusiast',
});
```

## Troubleshooting

### "useSupabaseAuth must be used within SupabaseAuthProvider"
- Make sure `SupabaseAuthProvider` is in your layout.tsx
- Check that it wraps all child components

### Redirect loop between login and role-select
- Clear browser localStorage
- Check that role is being saved correctly
- Verify Supabase credentials in .env.local

### "Invalid login credentials"
- Make sure user exists in Supabase
- Check email and password are correct
- Verify email is confirmed (if email confirmation is enabled)

### Session not persisting
- Check browser localStorage is enabled
- Verify Supabase session is being stored
- Check browser console for errors

## Next Steps

1. ✅ Authentication is set up
2. ✅ Role selection works
3. 🔄 Connect creator/brand profiles to database
4. 🔄 Integrate campaign creation with database
5. 🔄 Add collaboration request functionality
6. 🔄 Set up email notifications

## Production Deployment

Before deploying to production:

1. Update Supabase URL Configuration:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/role-select`

2. Enable email confirmation (optional):
   - Go to Authentication → Email Templates
   - Customize confirmation email

3. Set up password reset (optional):
   - Users can reset password via email

4. Enable additional providers (optional):
   - Google, GitHub, etc.

## Security Notes

- ✅ Passwords are hashed by Supabase
- ✅ Sessions are secure and encrypted
- ✅ Role is stored in localStorage (can be verified on backend)
- ✅ Protected routes check authentication before rendering
- ⚠️ Never expose your Supabase secret key (only use anon key)

## Support

For issues with Supabase Auth:
- Check Supabase docs: https://supabase.com/docs/guides/auth
- Check browser console for error messages
- Verify all environment variables are set correctly
