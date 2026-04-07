# InstaCollab - Quick Start Guide

## 🚀 Getting Started with Completed Features

### Prerequisites
```bash
# Ensure you have these installed
node >= 18
npm >= 9
```

### 1. Install Dependencies
```bash
npm install
```

### 2. Apply Database Migrations

Go to your Supabase project → SQL Editor and run these migrations in order:

1. `supabase/migrations/014_conversations_and_messages.sql`
2. `supabase/migrations/015_notifications.sql`
3. `supabase/migrations/016_creator_portfolio.sql`
4. `supabase/migrations/017_reviews_and_ratings.sql`
5. `supabase/migrations/018_escrow_payments.sql`

### 3. Enable Realtime in Supabase

Go to Database → Replication:
- Enable realtime for: `conversations`, `messages`, `notifications`

### 4. Create Storage Buckets

Go to Storage → Create new bucket:
- `portfolio-media` (public: true)
- `avatars` (public: true)

### 5. Update Environment Variables

Ensure your `.env` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
OPENAI_API_KEY=your_openai_key
REDIS_URL=your_redis_url (optional)
```

### 6. Run Development Server
```bash
npm run dev
```

---

## ✅ Testing Completed Features

### Test Messaging System

1. **Create two test accounts** (one brand, one creator)
2. **As brand**: Go to `/creators` → Click a creator → "Request Collab"
3. **As creator**: Accept the request
4. **Both users**: Go to `/messages`
5. **Send messages** and verify:
   - Messages appear in real-time
   - Unread counts update
   - Conversation list updates
   - Timestamps are correct

### Test Notifications

1. **As brand**: Send a collaboration request
2. **As creator**: Check bell icon in navbar
3. **Verify**:
   - Notification appears immediately
   - Unread badge shows count
   - Click notification navigates correctly
   - Notification marks as read

### Test Creator Portfolio

1. **As creator**: Go to `/dashboard/creator/portfolio` (you'll need to create this page or use API directly)
2. **Add portfolio items** via API:
```bash
curl -X POST http://localhost:3000/api/portfolio/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Brand Campaign",
    "description": "Successful collaboration",
    "brand_worked_with": "Nike",
    "result_metric": "2.1M reach"
  }'
```
3. **View public profile**: Go to `/creators/[your-handle]`
4. **Verify**:
   - Portfolio items display
   - Stats show correctly
   - Profile view is tracked

### Test Reviews System

1. **Complete a collaboration** (set status to 'completed' in database)
2. **Submit review** via API:
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "collaboration_request_id": "uuid",
    "rating": 5,
    "review_text": "Great to work with!"
  }'
```
3. **View reviews** on creator profile
4. **Verify**:
   - Review appears
   - Star rating displays
   - Average rating updates

---

## 🔧 Common Issues & Solutions

### Issue: Realtime not working
**Solution**: 
- Check Supabase → Database → Replication
- Ensure tables are added to publication
- Verify `ALTER PUBLICATION supabase_realtime ADD TABLE table_name;`

### Issue: RLS blocking queries
**Solution**:
- Check if `clerk_user_id` columns are populated
- Verify user is authenticated
- Check RLS policies in Supabase

### Issue: Messages not sending
**Solution**:
- Verify conversation exists first
- Check user is participant
- Look at browser console for errors

### Issue: Notifications not appearing
**Solution**:
- Check triggers are created
- Verify notification preferences
- Check realtime subscription in browser console

---

## 📁 Key Files Reference

### API Routes
```
/api/conversations          - List/create conversations
/api/conversations/[id]/messages - Send/get messages
/api/notifications          - Get notifications
/api/portfolio             - Update portfolio metadata
/api/portfolio/items       - CRUD portfolio items
/api/reviews               - Submit/get reviews
```

### Pages
```
/messages                  - Messaging interface
/creators/[handle]         - Public creator profile
/dashboard/creator         - Creator dashboard
/dashboard/brand           - Brand dashboard
```

### Components
```
src/components/messaging/ConversationList.tsx
src/components/messaging/ChatThread.tsx
src/components/notifications/NotificationDropdown.tsx
src/components/portfolio/CreatorPublicProfile.tsx
src/components/reviews/StarRating.tsx
src/components/reviews/ReviewCard.tsx
src/components/reviews/ReviewModal.tsx
```

---

## 🎯 Next Implementation Steps

### Priority 1: Complete Payments (Section 5)

1. Install Razorpay:
```bash
npm install razorpay
```

2. Get Razorpay keys from dashboard.razorpay.com

3. Create API routes:
   - `/api/payments/create-order`
   - `/api/payments/verify`
   - `/api/payments/release`

4. Build payment modal component

### Priority 2: Add Deliverables (Section 6)

1. Run migration 019 (see implementation guide)
2. Create deliverables API routes
3. Build submission form
4. Build review panel

### Priority 3: Add Analytics (Section 7)

1. Install Recharts:
```bash
npm install recharts
```

2. Create analytics pages
3. Build chart components
4. Add data export

---

## 📊 Database Schema Quick Reference

### conversations
- id, brand_id, creator_id, campaign_id
- last_message_preview, unread_brand, unread_creator

### messages
- id, conversation_id, sender_id, sender_role
- content, message_type, file_url, read_at

### notifications
- id, user_clerk_id, type, title, body
- action_url, read, created_at

### portfolio_items
- id, creator_id, title, description
- brand_worked_with, result_metric, display_order

### reviews
- id, reviewer_clerk_id, target_id, target_type
- collaboration_request_id, rating, review_text

### payments
- id, collaboration_request_id, amount, status
- razorpay_order_id, platform_fee, creator_payout

---

## 🐛 Debugging Tips

### Enable Detailed Logging

Add to your API routes:
```typescript
console.log('Request:', { method: req.method, url: req.url });
console.log('Body:', await req.json());
```

### Check Supabase Logs

Go to Supabase → Logs → API Logs to see:
- RLS policy violations
- Query errors
- Performance issues

### Test RLS Policies

In Supabase SQL Editor:
```sql
-- Test as specific user
SET request.jwt.claims.sub = 'clerk_user_id_here';

-- Run your query
SELECT * FROM conversations;
```

### Monitor Realtime

In browser console:
```javascript
// Check active subscriptions
console.log(supabase.getChannels());
```

---

## 📞 Support Resources

- **Implementation Guide**: `IMPLEMENTATION_GUIDE_SECTIONS_5_15.md`
- **Full Summary**: `PRODUCTION_UPGRADE_SUMMARY.md`
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✨ Feature Checklist

- [x] Real-time messaging
- [x] Notification center
- [x] Creator portfolios
- [x] Reviews & ratings
- [ ] Escrow payments
- [ ] Content deliverables
- [ ] Analytics dashboards
- [ ] AI brief generator
- [ ] SEO optimization
- [ ] Verification tiers
- [ ] Collaboration calendar
- [ ] UI redesign
- [ ] Advanced search
- [ ] Onboarding flows
- [ ] Settings pages

---

**Ready to build?** Start with testing the completed features, then move on to implementing payments and deliverables!
