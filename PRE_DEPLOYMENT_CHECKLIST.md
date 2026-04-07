# Pre-Deployment Checklist - InstaCollab

## 📋 Before Running `npm run build`

### 1. Environment Variables ✅
- [ ] All required env vars in `.env`
- [ ] `.env.example` updated with new vars
- [ ] Production env vars set in Vercel/hosting platform
- [ ] No hardcoded secrets in code

### 2. Database Migrations ✅
- [ ] Migration 014 (conversations) applied
- [ ] Migration 015 (notifications) applied
- [ ] Migration 016 (portfolio) applied
- [ ] Migration 017 (reviews) applied
- [ ] Migration 018 (payments) applied
- [ ] All indexes created
- [ ] All triggers working

### 3. Supabase Configuration ✅
- [ ] Realtime enabled for: conversations, messages, notifications
- [ ] Storage buckets created: portfolio-media, avatars
- [ ] RLS policies tested
- [ ] Service role key secured (server-only)
- [ ] Anon key in public env vars

### 4. Code Quality ✅
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`
- [ ] All imports resolved
- [ ] No unused variables
- [ ] No console.logs in production code (except intentional logging)

### 5. Dependencies ✅
- [ ] All dependencies installed: `npm install`
- [ ] No security vulnerabilities: `npm audit`
- [ ] Package versions compatible
- [ ] Lock file committed

---

## 🏗️ Build Process

### Step 1: Clean Build
```bash
# Remove previous build
rm -rf .next

# Clear cache
npm cache clean --force
```

### Step 2: Run Build
```bash
npm run build
```

### Expected Output:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    X kB          XX kB
├ ○ /creators/[handle]                   X kB          XX kB
├ ○ /messages                            X kB          XX kB
└ ...
```

### Step 3: Check for Errors

**Common Build Errors & Fixes**:

#### Error: "Module not found"
```bash
# Fix: Install missing dependency
npm install [package-name]
```

#### Error: "Type error in [file]"
```bash
# Fix: Check TypeScript types
# Ensure all interfaces are properly imported
```

#### Error: "Cannot find module '@/components/...'"
```bash
# Fix: Check tsconfig.json paths
# Ensure @ alias points to src/
```

#### Error: "Supabase client error"
```bash
# Fix: Check environment variables
# Ensure NEXT_PUBLIC_SUPABASE_URL is set
```

---

## 🧪 Post-Build Testing

### 1. Test Production Build Locally
```bash
npm run start
```

### 2. Test Critical Paths
- [ ] Homepage loads
- [ ] Login/signup works
- [ ] Dashboard loads for both roles
- [ ] Messages page loads
- [ ] Creator profile page loads
- [ ] API routes respond correctly

### 3. Test API Endpoints
```bash
# Test conversations API
curl http://localhost:3000/api/conversations

# Test notifications API
curl http://localhost:3000/api/notifications

# Test portfolio API
curl http://localhost:3000/api/creators/[id]/portfolio
```

### 4. Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### 5. Performance Check
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] No 404s in Network tab

---

## 🔒 Security Checklist

### Authentication
- [ ] Clerk middleware configured
- [ ] Protected routes require auth
- [ ] API routes use requireUser()
- [ ] No auth tokens in client code

### Database
- [ ] RLS policies enabled on all tables
- [ ] Service role key never exposed to client
- [ ] SQL injection prevention (parameterized queries)
- [ ] No sensitive data in public columns

### API Security
- [ ] CORS configured correctly
- [ ] Rate limiting ready (if using)
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

### Environment
- [ ] .env not committed to git
- [ ] .gitignore includes .env
- [ ] Production secrets rotated
- [ ] API keys have proper restrictions

---

## 📊 Performance Optimization

### Images
- [ ] Using next/image for all images
- [ ] Images optimized (WebP format)
- [ ] Proper width/height specified
- [ ] Lazy loading enabled

### Code Splitting
- [ ] Dynamic imports for heavy components
- [ ] Route-based code splitting
- [ ] No unnecessary client components

### Caching
- [ ] Redis configured (if available)
- [ ] API responses cached where appropriate
- [ ] Static assets cached
- [ ] Revalidation strategies set

### Database
- [ ] Indexes on frequently queried columns
- [ ] Pagination implemented
- [ ] No N+1 queries
- [ ] Connection pooling configured

---

## 🚀 Deployment Steps

### Vercel Deployment

1. **Connect Repository**
```bash
# Push to GitHub
git add .
git commit -m "Production ready"
git push origin main
```

2. **Configure Vercel Project**
- Import repository
- Set framework preset: Next.js
- Set root directory: ./
- Set build command: `npm run build`
- Set output directory: `.next`

3. **Set Environment Variables**
Go to Vercel → Project → Settings → Environment Variables

Add all from `.env`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
OPENAI_API_KEY
REDIS_URL (optional)
RAZORPAY_KEY_ID (when ready)
RAZORPAY_KEY_SECRET (when ready)
```

4. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Check deployment logs for errors

5. **Verify Deployment**
- [ ] Site loads at production URL
- [ ] All pages accessible
- [ ] API routes working
- [ ] Realtime features working
- [ ] Authentication working

---

## 🔍 Post-Deployment Monitoring

### Immediate Checks (First Hour)
- [ ] Homepage loads
- [ ] User can sign up
- [ ] User can log in
- [ ] Dashboard loads
- [ ] Messages work
- [ ] Notifications work
- [ ] No 500 errors in logs

### First Day Checks
- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Verify database connections
- [ ] Check Supabase usage
- [ ] Monitor Clerk usage
- [ ] Check OpenAI usage

### Set Up Monitoring
- [ ] Error tracking (Sentry recommended)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database monitoring (Supabase dashboard)

---

## 🐛 Rollback Plan

If deployment fails:

1. **Immediate Rollback**
```bash
# In Vercel dashboard
Deployments → Previous deployment → Promote to Production
```

2. **Investigate Issue**
- Check deployment logs
- Check runtime logs
- Check database logs
- Check error tracking

3. **Fix and Redeploy**
- Fix issue locally
- Test thoroughly
- Commit and push
- Monitor new deployment

---

## 📈 Success Metrics

### Technical Metrics
- [ ] Build time < 5 minutes
- [ ] Deployment time < 2 minutes
- [ ] Zero build errors
- [ ] Zero runtime errors (first hour)
- [ ] API response time < 500ms (p95)

### User Metrics
- [ ] Page load time < 3s
- [ ] Time to interactive < 3s
- [ ] Zero failed user actions
- [ ] Realtime latency < 1s

---

## ✅ Final Checklist

Before marking as "Production Ready":

- [ ] All migrations applied
- [ ] All environment variables set
- [ ] Build passes with zero errors
- [ ] All tests pass
- [ ] Security audit complete
- [ ] Performance optimized
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team notified
- [ ] Rollback plan ready

---

## 🎉 Launch Checklist

- [ ] Announce to team
- [ ] Update status page
- [ ] Monitor for first 24 hours
- [ ] Collect user feedback
- [ ] Plan next iteration

---

## 📞 Emergency Contacts

**If something goes wrong**:
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
- Clerk Support: support@clerk.com

**Internal**:
- Tech Lead: [contact]
- DevOps: [contact]
- Product: [contact]

---

**Last Updated**: Before deployment
**Next Review**: After first deployment
**Status**: Ready for deployment after completing remaining sections
