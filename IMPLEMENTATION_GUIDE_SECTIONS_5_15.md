# InstaCollab Implementation Guide - Sections 5-15

## ✅ Completed Sections (1-4)
- Section 1: Real-Time Messaging System
- Section 2: Notification Center  
- Section 3: Creator Portfolio / Media Kit
- Section 4: Reviews & Ratings System

## 🔄 Sections 5-15 Implementation Guide

### SECTION 5: ESCROW PAYMENT SYSTEM (Partially Complete)

**Database**: ✅ Migration 018 created with payments table

**Remaining Tasks**:

1. **Install Razorpay SDK**:
```bash
npm install razorpay
```

2. **Create API Routes**:
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment signature
- `POST /api/payments/release` - Release funds to creator
- `POST /api/payments/dispute` - Raise dispute
- `GET /api/payments` - List user's payments

3. **Environment Variables** (.env.example):
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

4. **Frontend Components**:
- `src/components/payments/PaymentModal.tsx` - Razorpay checkout
- `src/components/payments/PaymentStatusBadge.tsx`
- `src/components/payments/PaymentHistory.tsx`
- `src/app/(dashboard)/dashboard/[role]/payments/page.tsx`

5. **Integration Points**:
- Add "Escrow Payment" button when creator accepts request
- Add "Release Payment" button in brand's request detail view
- Show payment status on collaboration request cards

---

### SECTION 6: CONTENT DELIVERY & APPROVAL

**Database Migration** (019_deliverables.sql):
```sql
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_request_id UUID NOT NULL REFERENCES collaboration_requests(id),
  submission_number INT DEFAULT 1,
  content_url TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('video','image','reel','story','carousel')),
  caption TEXT,
  hashtags TEXT[],
  submission_notes TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted','revision_requested','approved')),
  revision_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
```

**API Routes**:
- `POST /api/deliverables` - Submit content
- `PATCH /api/deliverables/[id]/approve` - Approve content
- `PATCH /api/deliverables/[id]/revision` - Request revision
- `GET /api/deliverables?request_id=` - List submissions

**Components**:
- `src/components/deliverables/SubmissionForm.tsx`
- `src/components/deliverables/ReviewPanel.tsx`
- `src/components/deliverables/SubmissionHistory.tsx`

---

### SECTION 7: ADVANCED ANALYTICS DASHBOARDS

**Database Migration** (020_analytics.sql):
```sql
-- Campaign analytics table
CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  views_delivered BIGINT DEFAULT 0,
  engagement_generated BIGINT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  roi_estimate NUMERIC(10,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile views already created in migration 016
```

**Install Recharts**:
```bash
npm install recharts
```

**Pages to Create**:
- `/dashboard/creator/analytics` - Creator analytics dashboard
- `/dashboard/brand/analytics` - Brand analytics dashboard

**Charts Needed**:
- Line chart: Profile views over time
- Funnel chart: Application funnel
- Bar chart: Earnings by month
- Pie chart: Budget allocation by niche
- Table: Campaign performance

**API Routes**:
- `GET /api/analytics/creator` - Creator stats
- `GET /api/analytics/brand` - Brand stats
- `GET /api/analytics/profile-views?creator_id=&days=30`

---

### SECTION 8: AI CAMPAIGN BRIEF GENERATOR

**API Route** (`src/app/api/ai/generate-brief/route.ts`):
```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { brand_name, product_name, product_description, campaign_goal, target_audience, budget, platform, tone_of_voice } = await req.json();
  
  const prompt = `Generate a detailed campaign brief for:
Brand: ${brand_name}
Product: ${product_name}
Description: ${product_description}
Goal: ${campaign_goal}
Audience: ${target_audience}
Budget: ₹${budget}
Platform: ${platform}
Tone: ${tone_of_voice}

Return JSON with: campaign_title, campaign_description, deliverable_type, content_guidelines, do_list (array of 3), dont_list (array of 3), sample_caption, suggested_hashtags (array)`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  
  return NextResponse.json(JSON.parse(completion.choices[0].message.content));
}
```

**Frontend**:
- `/campaigns/new` - Add AI toggle
- Multi-step wizard with 6 steps
- Streaming response display
- Editable generated output

---

### SECTION 9: SEO-INDEXED CREATOR PUBLIC PAGES

**Already Partially Complete**: `src/app/creators/[handle]/page.tsx` exists

**Remaining Tasks**:

1. **OG Image API** (`src/app/api/og/creator/route.tsx`):
```typescript
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');
  
  // Fetch creator data
  // Return ImageResponse with creator card
}
```

2. **Sitemap** (`src/app/sitemap.ts`):
```typescript
export default async function sitemap() {
  const { data: creators } = await supabaseAdmin
    .from('creators')
    .select('instagram_handle, updated_at');
    
  return creators.map(c => ({
    url: `https://instacollab.com/creators/${c.instagram_handle}`,
    lastModified: c.updated_at,
  }));
}
```

3. **robots.txt** (`public/robots.txt`):
```
User-agent: *
Allow: /creators/
Disallow: /dashboard/
Disallow: /api/
```

---

### SECTION 10: CREATOR VERIFICATION TIERS

**Database Migration** (021_verification_tiers.sql):
```sql
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze','silver','gold','platinum')),
  ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS instagram_verified_at TIMESTAMPTZ;

-- Function to calculate tier
CREATE OR REPLACE FUNCTION calculate_creator_tier(p_creator_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_collab_count INT;
  v_avg_rating NUMERIC;
  v_verified BOOLEAN;
BEGIN
  SELECT COUNT(*), COALESCE(c.avg_rating, 0), COALESCE(c.verified, false)
  INTO v_collab_count, v_avg_rating, v_verified
  FROM creators c
  LEFT JOIN collaboration_requests cr ON cr.creator_id = c.id AND cr.status = 'completed'
  WHERE c.id = p_creator_id
  GROUP BY c.avg_rating, c.verified;
  
  IF v_collab_count >= 15 AND v_avg_rating >= 4.5 AND v_verified THEN
    RETURN 'platinum';
  ELSIF v_collab_count >= 5 AND v_avg_rating >= 4.0 THEN
    RETURN 'gold';
  ELSIF v_collab_count >= 1 THEN
    RETURN 'silver';
  ELSE
    RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**API Routes**:
- `POST /api/creators/verify-instagram` - Verify handle
- `POST /api/creators/update-tier` - Recalculate tier

**Components**:
- `src/components/creators/TierBadge.tsx`
- `src/components/creators/TierProgress.tsx`
- `/dashboard/creator/verification` page

---

### SECTION 11: COLLABORATION CALENDAR

**Database Migration** (022_collab_calendar.sql):
```sql
CREATE TABLE collab_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_request_id UUID REFERENCES collaboration_requests(id),
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to create default milestones
CREATE OR REPLACE FUNCTION create_default_milestones(
  p_collab_id UUID,
  p_agreed_date DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO collab_milestones (collaboration_request_id, title, due_date)
  VALUES
    (p_collab_id, 'Content Draft Due', p_agreed_date - INTERVAL '3 days'),
    (p_collab_id, 'Final Content Due', p_agreed_date),
    (p_collab_id, 'Brand Review', p_agreed_date + INTERVAL '1 day'),
    (p_collab_id, 'Payment Release', p_agreed_date + INTERVAL '2 days');
END;
$$ LANGUAGE plpgsql;
```

**Install Calendar Library**:
```bash
npm install react-big-calendar date-fns
```

**Pages**:
- `/dashboard/[role]/calendar` - Full calendar view

**API Routes**:
- `GET /api/calendar` - Get milestones
- `PATCH /api/milestones/[id]/complete`
- `POST /api/milestones` - Add custom milestone

---

### SECTION 12: GLOBAL UI REDESIGN

**Install Radix Colors**:
```bash
npm install @radix-ui/colors
```

**Update globals.css**:
```css
@import "@radix-ui/colors/slate.css";
@import "@radix-ui/colors/blue.css";
@import "@radix-ui/colors/green.css";

:root {
  /* Typography Scale */
  --font-display: 36px;
  --font-headline: 24px;
  --font-title: 18px;
  --font-body: 15px;
  --font-caption: 13px;
  --font-label: 11px;
  
  /* Spacing System */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
}
```

**Component Standards**:
- All buttons: 36px height, rounded-full for primary
- All inputs: 40px height
- All cards: 16px padding, hover lift
- Consistent transitions: 150ms ease

**Landing Page Rebuild** (`src/app/page.tsx`):
- Full-bleed gradient hero
- Animated counter stats
- Social proof logos
- Alternating feature sections
- Instagram-story testimonials
- 3-tier pricing cards
- 4-column footer

---

### SECTION 13: SEARCH & DISCOVERY UPGRADE

**Database Migration** (023_full_text_search.sql):
```sql
-- Add search vectors
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Update search vectors
UPDATE creators SET search_vector = 
  to_tsvector('english', coalesce(name,'') || ' ' || coalesce(bio,'') || ' ' || coalesce(niche,'') || ' ' || coalesce(instagram_handle,''));

UPDATE campaigns SET search_vector = 
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(niche,''));

-- Create GIN indexes
CREATE INDEX idx_creators_search ON creators USING GIN(search_vector);
CREATE INDEX idx_campaigns_search ON campaigns USING GIN(search_vector);

-- Triggers to keep search_vector updated
CREATE TRIGGER creators_search_vector_update
  BEFORE INSERT OR UPDATE ON creators
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', name, bio, niche, instagram_handle);
```

**API Route** (`POST /api/search`):
```typescript
// Universal search across creators, campaigns, brands
// Use ts_rank for relevance scoring
// Return results grouped by type
```

**Frontend**:
- `/search?q=` - Universal search page with tabs
- Navbar search with instant dropdown
- Match highlighting in results
- Recently viewed in localStorage

---

### SECTION 14: ONBOARDING REDESIGN

**Creator Onboarding** (`/onboarding/creator`):
1. Welcome + role confirm
2. Instagram handle + auto-fetch stats
3. Niche selection (visual cards, multi-select)
4. Platform stats input
5. Rate + bio + photo

**Brand Onboarding** (`/onboarding/brand`):
1. Company name + industry
2. Logo + website + description
3. Budget range slider
4. First campaign prompt

**Features**:
- Progress bar with step labels
- Framer Motion slide transitions
- localStorage persistence
- Form validation per step
- Confetti on completion (use `canvas-confetti`)

---

### SECTION 15: SETTINGS & ACCOUNT PAGES

**Page**: `/settings` with tabs

**Tabs**:
1. **Profile** - Edit all fields, photo upload
2. **Notifications** - Toggle switches per type
3. **Privacy** - Show/hide earnings, contact settings
4. **Billing** (brands) - Plan, payment methods, invoices
5. **Account** - Change email, delete account

**Database**:
```sql
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}'::jsonb;

ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}'::jsonb;
```

---

## IMPLEMENTATION PRIORITY

**High Priority** (Core Features):
1. Section 5: Payments (revenue critical)
2. Section 6: Deliverables (workflow critical)
3. Section 10: Verification Tiers (trust/quality)
4. Section 11: Calendar (project management)

**Medium Priority** (Enhancement):
5. Section 7: Analytics (insights)
6. Section 8: AI Brief Generator (differentiation)
7. Section 13: Search (discovery)
8. Section 14: Onboarding (conversion)

**Lower Priority** (Polish):
9. Section 9: SEO (growth, can be gradual)
10. Section 12: UI Redesign (iterative)
11. Section 15: Settings (can use basic version initially)

---

## NEXT STEPS

1. **Review completed sections 1-4** - Test messaging, notifications, portfolio, reviews
2. **Choose priority sections** - Start with payments + deliverables
3. **Set up Razorpay account** - Get API keys for payment integration
4. **Install missing dependencies**:
```bash
npm install razorpay recharts react-big-calendar date-fns canvas-confetti @radix-ui/colors
```
5. **Run migrations** - Apply all SQL migrations to Supabase
6. **Test incrementally** - Build and test each section before moving to next

---

## TESTING CHECKLIST

- [ ] Messaging: Send/receive messages, realtime updates
- [ ] Notifications: Bell dropdown, realtime notifications
- [ ] Portfolio: Public profile, portfolio items CRUD
- [ ] Reviews: Submit review, view reviews, rating calculation
- [ ] Payments: Create order, verify payment, release funds
- [ ] Deliverables: Submit content, approve/reject, revisions
- [ ] Analytics: View charts, export data
- [ ] Calendar: View milestones, mark complete
- [ ] Search: Full-text search, instant results
- [ ] Onboarding: Complete flow, data persistence

---

## DEPLOYMENT CHECKLIST

- [ ] Environment variables set in production
- [ ] Supabase migrations applied
- [ ] Supabase Storage buckets created (portfolio-media, avatars)
- [ ] Supabase Realtime enabled for tables
- [ ] Redis configured (optional but recommended)
- [ ] Razorpay webhooks configured
- [ ] OpenAI API key set
- [ ] Clerk production keys set
- [ ] Build passes with zero errors: `npm run build`
- [ ] All RLS policies tested
- [ ] Rate limiting configured
- [ ] Error monitoring set up (Sentry recommended)

