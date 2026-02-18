# AI Matching System — Deployment Guide

## Overview

The AI Creator-Brand Matching System uses **pgvector** for semantic similarity search
with **OpenAI embeddings**, combined with a hybrid scoring engine that factors in
engagement rates, budget compatibility, and niche alignment.

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
│   Frontend   │────▸│  Next.js API      │────▸│  OpenAI Embeddings │
│  (Vercel)    │     │  Routes (Server)  │     │  API               │
└─────────────┘     └────────┬─────────┘     └────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Supabase        │
                    │  PostgreSQL      │
                    │  + pgvector      │
                    └──────────────────┘
```

---

## Prerequisites

1. **Supabase project** with pgvector extension enabled
2. **OpenAI API key** (text-embedding-ada-002 model access)
3. **Vercel account** for frontend deployment

---

## Step 1: Database Setup (Supabase)

### Enable pgvector

Go to **Supabase Dashboard → SQL Editor** and run the migrations in order:

```sql
-- Run these files in sequence:
-- 1. supabase/migrations/001_create_tables.sql        (existing tables)
-- 2. supabase/migrations/002_add_matching_columns.sql  (matching columns)
-- 3. supabase/migrations/003_pgvector_embeddings.sql   (vector embeddings, indexes, functions)
-- 4. supabase/migrations/004_enhanced_rls_policies.sql (security policies)
```

**Important:** pgvector is pre-installed on Supabase. The migration runs
`CREATE EXTENSION IF NOT EXISTS vector;` to enable it.

### Verify Installation

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
-- Should return one row
```

---

## Step 2: Environment Variables

### Local Development (.env)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your_openai_key
SUPABASE_WEBHOOK_SECRET=your_random_secret
```

### Vercel Environment Variables

Go to **Vercel → Project → Settings → Environment Variables** and add:

| Variable                        | Value                     | Environment         |
| ------------------------------- | ------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxx.supabase.co` | All                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key         | All                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key | Production, Preview |
| `OPENAI_API_KEY`                | OpenAI API key            | Production, Preview |
| `SUPABASE_WEBHOOK_SECRET`       | Random string             | Production          |

**Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` on the client.**

---

## Step 3: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Step 4: Configure Database Webhooks (Optional)

For automatic embedding generation on data changes:

1. Go to **Supabase Dashboard → Database → Webhooks**
2. Create a webhook for the `creators` table:
   - Events: INSERT, UPDATE
   - URL: `https://your-app.vercel.app/api/embeddings/webhook`
   - Headers: `x-webhook-secret: your_webhook_secret`
3. Create a webhook for the `campaigns` table with the same config

---

## Step 5: Backfill Existing Data

After deployment, generate embeddings for existing records:

```bash
# Via API (authenticated as any user)
curl -X POST https://your-app.vercel.app/api/embeddings/generate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "batch-creators"}'

curl -X POST https://your-app.vercel.app/api/embeddings/generate \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"type": "batch-campaigns"}'
```

---

## API Endpoints

### Matching Endpoints

| Endpoint                     | Method | Auth    | Description                               |
| ---------------------------- | ------ | ------- | ----------------------------------------- |
| `/api/matched-campaigns`     | POST   | Creator | Get AI-matched campaigns for creator      |
| `/api/creators-for-campaign` | POST   | Brand   | Get AI-matched creators for campaign      |
| `/api/search`                | POST   | Any     | Semantic search across creators/campaigns |

### Embedding Management

| Endpoint                   | Method | Auth    | Description                 |
| -------------------------- | ------ | ------- | --------------------------- |
| `/api/embeddings/generate` | POST   | Any     | Generate/batch embeddings   |
| `/api/embeddings/webhook`  | POST   | Webhook | Auto-generate on DB changes |

---

## Matching Algorithm

The hybrid scoring formula:

```
total_score = 0.40 × semantic_similarity
            + 0.20 × engagement_score
            + 0.25 × budget_compatibility
            + 0.15 × niche_alignment
```

### Components

1. **Semantic Similarity (40%)**: Cosine similarity between embedding vectors via pgvector
2. **Engagement Rate (20%)**: Normalized engagement rate (capped at 10%)
3. **Budget Compatibility (25%)**: Creator rate vs. campaign budget ratio
4. **Niche Alignment (15%)**: Exact match (1.0), related niche (0.5), or no match (0.0)

### Fallback

If embeddings are not available, the system falls back to the rule-based
`computeMatchScore()` function in `server-matching.ts`.

---

## Security

- **API keys**: OpenAI API key only used in server-side code (`src/lib/embeddings.ts`)
- **RLS policies**: Enhanced policies restrict data access per role
- **Embedding isolation**: Embedding columns excluded from client-accessible views
- **Rate limiting**: In-memory rate limiter on embedding generation endpoint
- **Webhook auth**: Webhook endpoint validates `x-webhook-secret` header
- **Service role**: Server-side Supabase client uses service role for embedding writes

---

## Performance Tuning

### IVFFlat Index

The migration creates IVFFlat indexes with `lists = 100`. Tune based on data size:

```sql
-- For < 1,000 records: lists = 10-50
-- For 1,000-100,000 records: lists = 100-500
-- For > 100,000 records: lists = sqrt(record_count)

-- Recreate index after significant data growth:
DROP INDEX idx_creators_embedding;
CREATE INDEX idx_creators_embedding
  ON creators USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 300);
```

### HNSW Alternative (Supabase supports this)

For better recall with slightly higher memory:

```sql
CREATE INDEX idx_creators_embedding_hnsw
  ON creators USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

---

## File Structure (New/Modified)

```
supabase/migrations/
  003_pgvector_embeddings.sql        # pgvector setup, functions, indexes
  004_enhanced_rls_policies.sql      # Tightened RLS policies, secure views

src/lib/
  embeddings.ts                       # OpenAI embedding generation service
  vector-matching.ts                  # Hybrid vector + rule-based matching

src/app/api/
  embeddings/
    generate/route.ts                 # Embedding generation API
    webhook/route.ts                  # Supabase webhook handler
  search/route.ts                     # Semantic search API
  matched-campaigns/route.ts          # Updated: uses vector matching
  creators-for-campaign/route.ts      # Updated: uses vector matching
  campaigns/route.ts                  # Updated: auto-generates embeddings
  onboarding/creator/route.ts         # Updated: auto-generates embeddings

src/lib/functions.ts                  # Updated: new API client functions
src/app/dashboard/creator/page.tsx    # Updated: real data + AI match cards
src/app/dashboard/brand/page.tsx      # Updated: real data + AI match cards
```
