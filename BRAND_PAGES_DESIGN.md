# CreatorDeal BRAND Side Pages - Design Specification

**Document Date:** February 18, 2026
**Platform:** CreatorDeal MVP (Creator–Brand Deal Platform)
**Audience:** Product, Design, & Development Teams

---

## Overview

This document specifies the page structure and component hierarchy for all BRAND-facing pages in CreatorDeal. It defines **what content/components appear on each page**, without discussing design style.

**Target Implementation Status:** All 7 pages are implemented with MVP functionality.

---

## Page Navigation Map

```
/dashboard/brand ─────────── Brand Dashboard (Main Hub)
    ├── /campaigns/new ───── Post Campaign Page
    ├── /campaigns ───────── Campaigns Management Page
    ├── /creators ───────────  Find Creators Page
    │   └── /creators/[id] - Creator Profile Page
    └── /requests ───────────  Brand Requests Page

/settings ────────────────── Settings Page (Optional MVP)
```

---

## 1. BRAND DASHBOARD (`/dashboard/brand`)

**Purpose:** Main hub showing brand's campaign overview and AI-matched creators.

### A. Header Section
- Brand Name (from profile)
- Quick summary subtitle: "Manage your campaigns and discover AI-matched creators"

### B. Statistics Cards (Top Section)
Three metric cards displayed in responsive grid:
- **Active Campaigns Count** (with icon)
- **AI Matches Found** (creators matched to selected campaign)
- **Total Budget** (sum of active campaign budgets)

### C. Primary Call-to-Action Card
- Title: "Ready to find creators?"
- Subtitle: "Post a new campaign and get AI-matched with relevant creators instantly."
- Button: "+ Post Campaign" (links to `/campaigns/new`)

### D. Your Campaigns Table/List
Each **active campaign row** shows:
- Campaign title (clickable to select for matching)
- Budget (formatted: ₹ with K/L notation)
- Niche/Category
- Status badge (Active/Closed)
- Action button: "Find Creators" (only for active campaigns)

**Interactions:**
- Clicking a campaign row selects it and updates the matched creators below
- Auto-selects first active campaign on load

### E. AI-Suggested Creators Section
Shows top 9 matched creators for selected campaign.

**Each creator card displays:**
- Creator name
- Niche (as badge)
- Match score percentage (in highlighted box)
- Followers (formatted: M/K notation)
- Engagement rate (%)
- Average views (formatted: M/K notation)
- Match reasons (up to 3 tags)
- AI Relevance score (if available)
- Buttons:
  - "View Profile" (links to `/creators/[id]`)
  - "Send Request" (triggers collaboration request)

**States:**
- Empty state if no campaigns exist
- Loading state while fetching creator matches
- Empty state if no matching creators found

---

## 2. POST CAMPAIGN PAGE (`/campaigns/new`)

**Purpose:** Form for brands to create and publish new campaigns.

### A. Header with Navigation
- Back button (links to `/dashboard/brand`)
- Title: "Post a New Campaign"
- Subtitle: "Fill in the details and reach creators instantly"

### B. Campaign Details Form Card
Structured form with labeled sections:

**Form Fields:**
1. **Campaign Title** (text input)
   - Placeholder: "e.g., Summer Collection Launch"

2. **Description** (textarea)
   - Placeholder: "Describe your campaign, target audience, and key message..."
   - Rows: 4

3. **Deliverable Type** (dropdown select)
   - Options:
     - Instagram Reel
     - Instagram Post
     - Instagram Story
     - TikTok Video
     - YouTube Video
     - YouTube Short

4. **Budget** (number input)
   - Placeholder: "e.g., 50000"
   - Currency symbol: ₹

5. **Timeline** (dropdown select)
   - Options:
     - 1 Day
     - 2 Days
     - 3 Days
     - 1 Week
     - 2 Weeks
     - 1 Month

**Form Validation:**
- All fields required for form submission
- Submit button disabled until all fields filled

### C. Action Buttons
Two buttons at form bottom:
- "Cancel" (links back to `/dashboard/brand`)
- "Publish Campaign" (submits form)

**Submission Behavior:**
- Shows loading state with spinner while submitting
- Redirects to `/dashboard/brand` on success

---

## 3. CAMPAIGNS MANAGEMENT PAGE (`/campaigns`)

**Purpose:** View all campaigns posted by the brand.

### A. Page Header
- Title: "Your Campaigns" (role-based variant: "Matched Campaigns" for creators)
- Subtitle: "Manage all your campaigns in one place."
- For brands: "+ New Campaign" button (links to `/campaigns/new`)

### B. Campaigns Grid
Displays all campaigns in responsive card grid.

**Each campaign card shows:**
- Status badge (Active/Paused/Closed)
- Deliverable type icon + label
- Campaign title (hover effect)
- Description (truncated to 2 lines)
- Niche badge (if applicable)
- Budget (formatted: ₹ with K/L notation, using `toLocaleString('en-IN')`)
- Timeline
- Match score (for creator view only, not for brand listing)

**Pagination:**
- Load More button if more campaigns available
- Page size: 12 campaigns per load

**Empty States:**
- Message: "You haven't created any campaigns yet."
- Button: "Create Your First Campaign" (links to `/campaigns/new`)

**Loading States:**
- Skeleton loaders (6 placeholder cards with pulse animation)

---

## 4. FIND CREATORS PAGE (`/creators`)

**Purpose:** Creator marketplace for brand discovery and search.

### A. Page Header
- Title: "Find Creators"
- Subtitle: "Browse and discover creators that match your brand"

### B. Search & Filter Section
**Search Bar:**
- Placeholder: "Search by name or niche..."
- Search icon on left
- Real-time filtering

**Filters (Grid Layout):**
1. **Category** dropdown
   - Options: All Categories, Fashion & Lifestyle, Tech Reviews, Beauty & Makeup, Fitness, Food & Travel, Gaming

2. **Followers Range** dropdown
   - Options: All Followers, 100K - 500K, 500K - 1M, 1M+

**Result Counter:**
- Shows number of creators matching filters
- Updates in real-time

### C. Creator Cards Grid
Responsive grid showing filtered creators (up to 20 results).

**Each creator card displays:**
- Creator name
- Niche
- Followers (formatted: M/K notation)
- Average views (formatted: M/K notation)
- Engagement rate (%)
- Buttons:
  - "View Profile" (links to `/creators/[id]`)
  - "Send Request" (triggers collaboration request)

**Empty State:**
- Message: "No creators found"
- Suggestion: "Try adjusting your search or filters"

---

## 5. CREATOR PROFILE PAGE (`/creators/[id]`)

**Purpose:** Detailed creator information for brand decision-making (before sending request).

### A. Header with Navigation
- Back button (links to `/creators`)
- Creator name (large heading)
- Niche (subheading)

### B. Main Content Area (2/3 Width on Desktop)

#### Profile Card Section
- Creator name (repeated)
- Niche (badge)
- Bio/Description
- Instagram handle (clickable link)
- Button: "Send Collaboration Request"

#### Statistics Grid
Four stat cards in responsive grid:
- Followers (e.g., "850K")
- Engagement Rate (e.g., "8.2%")
- Average Views (e.g., "125K")
- Posts/Month (e.g., "12")

#### Audience Demographics Card
Detailed breakdown of creator's audience:
- **Age Group** (e.g., "18-35")
- **Gender Distribution** (e.g., "85% Female, 15% Male")
- **Primary Locations** (e.g., "India, USA, UK")

### C. Sidebar (1/3 Width on Desktop, Full Width on Mobile)

#### Quick Stats Card (Sticky on desktop)
- Total Followers (large display)
- Engagement Rate (highlighted, usually in primary color)
- Average Views (large display)
- Button: "Send Request" (same action, for convenience)

### Important Rules Applied:
- ✅ Does NOT show creator's private minimum rate (minRatePrivate)
- ✅ Only shows publicly displayable metrics
- ✅ CTA focused on initiating collaboration

---

## 6. BRAND REQUESTS PAGE (`/requests`)

**Purpose:** Tracking inbox for sent collaboration requests to creators.

### A. Page Header
- Title: "Collaboration Requests"
- Subtitle: "Track all your sent collaboration requests to creators"

### B. Tab Navigation
Four tabs with request counts:
- **All** (all requests)
- **Pending** (awaiting creator response)
- **Accepted** (creator accepted)
- **Rejected** (creator declined)

### C. Request Items List

**Each request item displays:**
- Creator name (large, prominent)
- Status badge (pill-style with color coding)
  - Pending: Yellow/Amber indicator with "⏳ Pending"
  - Accepted: Green indicator with "✓ Accepted"
  - Rejected: Red indicator with "✕ Rejected"
- Campaign title (associated campaign name)
- Date sent

**Conditional Elements:**
- If status is **Accepted**: Show button "Continue on WhatsApp"
  - Button color: Green (WhatsApp brand green)
  - Icon: MessageCircle
  - Clicking opens WhatsApp in new tab

**Empty State:**
- Message: "No requests found"
- Suggestion: "Start by finding creators and sending collaboration requests"

**Loading & Animations:**
- Staggered animation on request items
- Hover effects for better interactivity

---

## 7. SETTINGS PAGE (`/settings`) - Optional MVP

**Purpose:** Brand account configuration and preferences.

### A. Page Header
- Title: "Settings"
- Subtitle: "Manage your brand account and preferences"

### B. Account Settings Form

**Form Fields:**
1. **Brand Name** (text input)
   - Current brand name displayed

2. **Category** (dropdown select)
   - Brand/industry category selection

3. **Budget Preference** (currency input or range)
   - Default/preferred budget for campaigns

### C. Account Actions
- **Logout Button** (prominent, below form)

**Layout:**
- Single column form for simplicity
- Max-width constraint (2xl or similar)

---

## Design System Requirements

### Layout & Container
- All pages use consistent max-width container (7xl / 1280px)
- DashboardShell wrapper for navigation consistency
- Responsive padding (6-8 units on desktop, 4 on mobile)

### Typography
- H1: text-3xl font-bold
- H2: text-xl font-semibold
- Body: text-sm (default)
- Muted text: text-muted-foreground

### Cards & Components
- Card base: border-0 shadow-sm (minimal shadow)
- Card hover: hover:shadow-md transition-shadow
- Radius: Using Tailwind defaults (rounded-lg/rounded-xl)

### Colors & Badges
- Primary: Brand primary blue (220°, 100%, 30%)
- Status badges:
  - Active/Success: Green
  - Pending: Yellow/Amber
  - Closed/Reject: Secondary gray
  - Accepted: Green

### Animations
- Fade-in on page load: initial={{ opacity: 0, y: -20/20 }} → animate={{ opacity: 1, y: 0 }}
- Stagger for lists: staggerChildren: 0.08 or 0.1
- Card hover: whileHover={{ y: -4 }} (slight lift)
- Loading spinners: w-6 h-6 border-2 border-primary border-t-transparent animate-spin

### Responsive Breakpoints
- Mobile: Single column (grid-cols-1)
- Tablet (md): 2 columns (grid-cols-2 md:grid-cols-2)
- Desktop (lg): 3 columns (grid-cols-3 lg:grid-cols-3)

---

## Data Integration Points

### Supabase Queries Required

#### For Brand Dashboard (`/dashboard/brand`)
- `brands.select("name").eq("id", user.id)` — Get brand profile
- `campaigns.select("*").eq("brand_id", user.id)` — Get brand's campaigns
- `callGetCreatorsForCampaign(campaignId)` — AI-matched creators for campaign

#### For Post Campaign (`/campaigns/new`)
- `campaigns.insert()` — Insert new campaign record
- Set status to "active" on creation

#### For Campaigns List (`/campaigns`)
- `campaigns.select("*").eq("brand_id", user.id).order("created_at")` — Paginated brand campaigns
- `callGetMatchedCampaigns()` — Creator-specific (shows matched campaigns for creators only)

#### For Find Creators (`/creators`)
- Query `creators` table (search/filter by name, niche, followers)
- Current implementation uses mock data (8 creators)
- Production: Implement real database queries with filters

#### For Creator Profile (`/creators/[id]`)
- `creators.select("*").eq("id", creator_id).single()` — Get single creator
- Show public metrics only (followers, engagement, views)
- **IMPORTANT:** Exclude minRatePrivate from any query/display

#### For Requests (`/requests`)
- `requests.select("*").eq("brand_id", user.id)` — Get all requests sent by brand
- Filter by status (pending, accepted, rejected)
- Join with campaign and creator names

### Firebase/Supabase Features Used
- Authentication: `useSupabaseAuth()` context
- Real-time updates: Supabase subscriptions (where applicable)
- Vector search: For AI matching on creator profiles
- Data persistence: All campaigns, requests persisted to database

---

## Important Rules - Validation Checklist

### Security & Access Control
- ✅ Brands cannot message creators directly without request acceptance
- ✅ Brands never see creator private minimum rate (minRatePrivate)
- ✅ Creator profile access limited to request/discovery flow
- ✅ Campaign access restricted to owning brand

### MVP Scope
- ✅ Campaigns: Create, view, manage (no edit/delete in current spec)
- ✅ Creators: Browse, search, filter, view profiles
- ✅ Requests: Send, track status, access WhatsApp on accept
- ✅ No messaging system within app (WhatsApp integration for accepted deals)

### Data Handling
- ✅ All campaigns stored in Supabase `campaigns` table
- ✅ All requests stored in Supabase `requests` table
- ✅ Creator data from Supabase `creators` table (public metrics only)
- ✅ Forms validate before submission
- ✅ Proper error handling on failed operations

### UI/UX Consistency
- ✅ All pages use DashboardShell for navigation
- ✅ Consistent motion/animation patterns
- ✅ Empty states on all list views
- ✅ Loading states for async operations
- ✅ Status indicators (badges/pills) for all stateful items
- ✅ Responsive design (mobile-first)

---

## Component Reusability

These components are used across multiple BRAND pages:

| Component | Pages Used | Purpose |
|-----------|-----------|---------|
| CreatorCard | `/creators`, `/dashboard/brand` | Display creator summary |
| CampaignCard | `/campaigns`, `/campaigns/new` | Display campaign info |
| RequestCard | `/requests` | Display request status |
| Badge | All pages | Status, category, niche indicators |
| Card | All pages | Container for content sections |
| Button | All pages | CTAs and actions |
| Input | Form pages | Text input fields |
| textarea | Form pages | Multi-line descriptions |
| Select | Form pages, filter pages | Dropdown selections |
| DashboardShell | Navigation wrapper | Layout and navigation |

---

## Current Implementation Status

### ✅ Fully Implemented (MVP Ready)

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Brand Dashboard | `/dashboard/brand` | Complete | Stats, campaigns table, AI-matched creators functioning |
| Post Campaign | `/campaigns/new` | Complete | Form with validation, all required fields |
| Campaigns Management | `/campaigns` | Complete | Role-based variant (creator view also here), pagination |
| Find Creators | `/creators` | Complete | Search, category/followers filters, 8 mock creators |
| Creator Profile | `/creators/[id]` | Complete | Profile display, stats, demographics, send request CTA |
| Brand Requests | `/requests` | Complete | Tabs, status tracking, WhatsApp integration for accepted |

### ⚠️  Partially Implemented

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Settings | `/settings` | Not yet | Optional MVP feature, basic implementation needed |

### 🔄 Production Considerations

1. **Creator Discovery** — Replace mock data with real database queries
2. **Search Indexing** — Implement efficient search/filtering on production database
3. **AI Matching** — Ensure embedding generation and vector search working
4. **Request Workflow** — Integrate WhatsApp API for direct messaging
5. **Media Upload** — For campaign images/videos future enhancement
6. **Analytics** — Track campaign performance, request acceptance rates

---

## File Structure Reference

```
src/
├── app/
│   ├── dashboard/brand/page.tsx ........... Brand Dashboard
│   ├── campaigns/
│   │   ├── page.tsx ...................... Campaigns List (role-based)
│   │   └── new/page.tsx .................. Post Campaign
│   ├── creators/
│   │   ├── page.tsx ...................... Find Creators
│   │   └── [id]/page.tsx ................. Creator Profile
│   ├── requests/page.tsx ................. Brand Requests
│   └── settings/page.tsx ................. Settings (Optional)
│
├── components/
│   ├── CreatorCard.tsx ................... Reusable creator display
│   ├── CampaignCard.tsx .................. Reusable campaign display
│   ├── RequestCard.tsx ................... Reusable request display
│   ├── DashboardShell.tsx ................ Navigation wrapper
│   └── ui/ ............................. Shadcn/ui base components
│
└── lib/
    ├── services/
    │   ├── brands.ts ..................... Brand CRUD
    │   ├── campaigns.ts .................. Campaign CRUD
    │   ├── creators.ts ................... Creator queries
    │   └── requests.ts ................... Request management
    └── matching.ts ....................... AI matching logic
```

---

## Next Steps for Enhancement

1. **Production Database** — Replace mock data with real Supabase queries
2. **Settings Page** — Complete implementation with form handling
3. **Campaign Editing** — Add edit/update functionality
4. **Advanced Filters** — More sophisticated creator discovery filtering
5. **Analytics Dashboard** — Campaign performance metrics
6. **Batch Operations** — Select multiple campaigns for bulk actions
7. **Real-time Notifications** — When creators respond to requests
8. **Export Functionality** — Download campaign reports, request history

---

**Document Version:** 1.0
**Last Updated:** February 18, 2026
**Maintained By:** Development Team
