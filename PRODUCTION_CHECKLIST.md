# Production Deployment Checklist

## Before Deploying ✅

### 1. API Keys & Secrets
- [ ] Get **production** Clerk keys (not test keys!)
  - Go to Clerk Dashboard → Production instance
  - Copy `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- [ ] **Regenerate OpenAI API key** (current one is exposed)
  - Go to OpenAI Dashboard → API Keys
  - Create new key and delete old one
- [ ] Generate Clerk webhook secret
  - Clerk Dashboard → Webhooks → Add Endpoint
  - URL: `https://your-domain.com/api/webhooks/clerk`
  - Events: `user.created`, `user.updated`, `user.deleted`
  - Copy the signing secret

### 2. Environment Variables in Vercel
Add all variables from `.env.example`:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=... (NEW KEY!)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=... (PRODUCTION KEY!)
CLERK_SECRET_KEY=... (PRODUCTION KEY!)
CLERK_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 3. Database Setup
- [ ] Run `PRODUCTION_INDEXES.sql` in Supabase SQL Editor
- [ ] Run `CLEANUP_DATABASE_SIMPLE.sql` to remove test data
- [ ] Verify RLS policies are enabled
- [ ] Test database connection from production

### 4. Clerk Configuration
- [ ] Set production domain in Clerk Dashboard
- [ ] Configure email verification (recommended)
- [ ] Set up social OAuth providers (Google, etc.)
- [ ] Test webhook endpoint is reachable
- [ ] Enable bot protection (Turnstile)

### 5. Security
- [ ] Verify CSP headers in production
- [ ] Test rate limiting on API routes
- [ ] Check error boundaries are working
- [ ] Verify no console.logs in production build
- [ ] Test authentication flows

### 6. Performance
- [ ] Run Lighthouse audit
- [ ] Check bundle size
- [ ] Verify images are optimized
- [ ] Test loading times

### 7. Monitoring (Recommended)
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up analytics (Vercel Analytics, Google Analytics)
- [ ] Create alerts for critical errors

## After Deploying 🚀

### 1. Smoke Tests
- [ ] Sign up with new account
- [ ] Complete onboarding (creator & brand)
- [ ] Create a campaign
- [ ] Send collaboration request
- [ ] Test all major flows

### 2. Verify Integrations
- [ ] Clerk webhook is receiving events
- [ ] Users are syncing to Supabase
- [ ] Email notifications work
- [ ] OAuth providers work

### 3. Monitor
- [ ] Check error logs for first 24 hours
- [ ] Monitor API response times
- [ ] Watch for rate limit hits
- [ ] Check database performance

## Known Limitations

1. **In-memory rate limiting** - Resets on server restart
   - For production, use Redis or Upstash
2. **No email queue** - Emails sent synchronously
   - Consider using a queue (BullMQ, Inngest)
3. **Basic error tracking** - Console logs only
   - Integrate Sentry for production
4. **No caching layer** - Direct database queries
   - Add Redis for frequently accessed data

## Recommended Upgrades

1. **Redis for rate limiting** - More reliable than in-memory
2. **Sentry for error tracking** - Better debugging
3. **Vercel Analytics** - User behavior insights
4. **Upstash for caching** - Faster API responses
5. **Email service** - SendGrid, Resend, or Postmark

## Support

If issues arise:
1. Check Vercel deployment logs
2. Check Clerk webhook logs
3. Check Supabase logs
4. Review error boundaries

Good luck with your launch! 🎉
