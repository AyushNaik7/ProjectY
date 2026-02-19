# Google OAuth Setup Complete ✅

## What I Fixed

### 1. Added Google OAuth Function to Auth Context
- Added `signInWithGoogle()` method to `SupabaseAuthContext.tsx`
- Configured OAuth with proper redirect URL: `${window.location.origin}/auth/callback`

### 2. Created OAuth Callback Route
- Created `/src/app/auth/callback/route.ts`
- Handles PKCE flow with `exchangeCodeForSession()`
- Redirects users based on their role after successful authentication

### 3. Added Google Sign-In Handlers
- **Login Page**: Added `handleGoogleSignIn()` and onClick handler
- **Signup Page**: Added `handleGoogleSignUp()` with role validation

### 4. Environment Variables
- ✅ `.env.local` is in the correct location (root directory)
- ✅ Contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ Supabase client properly initialized

## Supabase Configuration Required

### Add Redirect URL to Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add these URLs to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/login
   ```

### Verify Google OAuth Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to configure
3. Make sure it's **enabled**
4. Verify your **Client ID** and **Client Secret** from Google Cloud Console are entered

## Google Cloud Console Configuration

### Authorized Redirect URIs

In your Google Cloud Console OAuth 2.0 Client:

1. Go to https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Add these to **Authorized redirect URIs**:
   ```
   https://ysbaxsczgauyslcbmazy.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

## How It Works

### Login Flow
1. User clicks "Google" button on login/signup page
2. `signInWithGoogle()` initiates OAuth flow
3. User authenticates with Google
4. Google redirects to `/auth/callback` with authorization code
5. Callback route exchanges code for session
6. User is redirected based on their role:
   - Creator → `/dashboard/creator`
   - Brand → `/dashboard/brand`
   - No role → `/role-select`

### Code Flow
```typescript
// User clicks Google button
handleGoogleSignIn() 
  → signInWithGoogle() 
  → supabase.auth.signInWithOAuth({ provider: 'google' })
  → Google OAuth
  → /auth/callback?code=xxx
  → exchangeCodeForSession(code)
  → Redirect to dashboard
```

## Testing

1. **Restart your dev server** (environment variables are loaded at startup):
   ```bash
   # Stop server (Ctrl + C)
   npm run dev
   ```

2. Navigate to http://localhost:3000/login

3. Click the "Google" button

4. You should be redirected to Google's OAuth consent screen

5. After authentication, you'll be redirected back to your app

## Troubleshooting

### "redirect_uri_mismatch" Error
- Check that redirect URIs match exactly in both Supabase and Google Cloud Console
- Make sure there are no trailing slashes

### "Missing Supabase environment variables"
- Restart your dev server after adding/changing `.env.local`
- Verify `.env.local` is in the root directory (same level as `package.json`)

### User Not Redirected After Login
- Check browser console for errors
- Verify the callback route is working: http://localhost:3000/auth/callback
- Check Supabase logs in the dashboard

### Role Not Set
- For new Google OAuth users, they'll be redirected to `/role-select`
- After selecting a role, it's saved to user metadata
- Subsequent logins will redirect to the correct dashboard

## Files Modified

1. `src/context/SupabaseAuthContext.tsx` - Added Google OAuth method
2. `src/app/auth/callback/route.ts` - Created callback handler
3. `src/app/login/page.tsx` - Added Google sign-in button handler
4. `src/app/signup/page.tsx` - Added Google sign-up button handler
5. `src/app/layout.tsx` - Added suppressHydrationWarning

## Next Steps

1. ✅ Restart your dev server
2. ✅ Add redirect URLs to Supabase Dashboard
3. ✅ Verify Google OAuth provider is enabled in Supabase
4. ✅ Test Google login on http://localhost:3000/login
5. 🚀 Deploy and update production redirect URLs when ready
