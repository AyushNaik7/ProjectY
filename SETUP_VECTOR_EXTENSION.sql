-- SETUP PGVECTOR EXTENSION FOR AI FUNCTIONALITY
-- Run this AFTER fixing the collaboration_requests issue

-- ============================================
-- 1. INSTALL PGVECTOR EXTENSION
-- ============================================

-- Enable the vector extension (requires superuser privileges)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 2. CREATE VECTOR MATCHING FUNCTIONS
-- ============================================

-- Create the vector matching function for campaigns
CREATE OR REPLACE FUNCTION match_campaigns_for_creator(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  brand_id text,
  title text,
  description text,
  deliverable_type text,
  budget numeric,
  timeline text,
  niche text,
  status text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.brand_id,
    c.title,
    c.description,
    c.deliverable_type,
    c.budget,
    c.timeline,
    c.niche,
    c.status,
    CASE 
      WHEN c.embedding IS NOT NULL THEN 1 - (c.embedding <=> query_embedding)
      ELSE 0.5
    END as similarity
  FROM campaigns c
  WHERE c.status = 'active'
    AND (
      c.embedding IS NULL 
      OR 1 - (c.embedding <=> query_embedding) > match_threshold
    )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Create the vector matching function for creators
CREATE OR REPLACE FUNCTION match_creators_for_campaign(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id text,
  username text,
  name text,
  instagram_handle text,
  niche text,
  instagram_followers int,
  avg_views int,
  instagram_engagement numeric,
  verified boolean,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.username,
    cr.name,
    cr.instagram_handle,
    cr.niche,
    cr.instagram_followers,
    cr.avg_views,
    cr.instagram_engagement,
    cr.verified,
    CASE 
      WHEN cr.embedding IS NOT NULL THEN 1 - (cr.embedding <=> query_embedding)
      ELSE 0.5
    END as similarity
  FROM creators cr
  WHERE cr.embedding IS NULL 
    OR 1 - (cr.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- ============================================
-- 3. VERIFICATION
-- ============================================

-- Test the vector functions exist
SELECT EXISTS (
  SELECT 1 FROM pg_proc 
  WHERE proname = 'match_campaigns_for_creator'
) as match_campaigns_function_exists;

SELECT EXISTS (
  SELECT 1 FROM pg_proc 
  WHERE proname = 'match_creators_for_campaign'
) as match_creators_function_exists;

-- Check if vector extension is installed
SELECT EXISTS (
  SELECT 1 FROM pg_extension 
  WHERE extname = 'vector'
) as vector_extension_installed;

DO $$
BEGIN
  RAISE NOTICE '✅ Vector extension and functions setup complete!';
  RAISE NOTICE '✅ AI matching should now work properly';
END $$;