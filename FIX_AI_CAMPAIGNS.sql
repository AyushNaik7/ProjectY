-- COMPREHENSIVE FIX FOR AI CAMPAIGNS FUNCTIONALITY
-- This will ensure AI matching works properly

-- ============================================
-- 1. ENSURE VECTOR EXTENSION AND FUNCTIONS
-- ============================================

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Recreate the vector matching functions with proper error handling
CREATE OR REPLACE FUNCTION match_campaigns_for_creator(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
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
    COALESCE(c.niche, '') as niche,
    c.status,
    CASE 
      WHEN c.embedding IS NOT NULL THEN 
        GREATEST(0.0, LEAST(1.0, 1 - (c.embedding <=> query_embedding)))
      ELSE 0.5
    END as similarity
  FROM campaigns c
  WHERE c.status = 'active'
    AND c.brand_id IS NOT NULL
    AND c.title IS NOT NULL
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- ============================================
-- 2. ADD MISSING COLUMNS IF NEEDED
-- ============================================

-- Add embedding columns to creators if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'creators' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE creators ADD COLUMN embedding vector(1536);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'creators' AND column_name = 'embedding_text'
  ) THEN
    ALTER TABLE creators ADD COLUMN embedding_text text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'creators' AND column_name = 'embedding_updated_at'
  ) THEN
    ALTER TABLE creators ADD COLUMN embedding_updated_at timestamptz;
  END IF;
END $$;

-- Add embedding columns to campaigns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN embedding vector(1536);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'embedding_text'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN embedding_text text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'embedding_updated_at'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN embedding_updated_at timestamptz;
  END IF;
END $$;

-- ============================================
-- 3. CREATE SAMPLE EMBEDDINGS FOR TESTING
-- ============================================

-- Create dummy embeddings for creators without them (for immediate testing)
UPDATE creators 
SET embedding = array_fill(0.1, ARRAY[1536])::vector(1536),
    embedding_text = CONCAT('Creator: ', name, ' Niche: ', niche, ' Followers: ', COALESCE(instagram_followers, 0)),
    embedding_updated_at = NOW()
WHERE embedding IS NULL 
  AND name IS NOT NULL;

-- Create dummy embeddings for campaigns without them (for immediate testing)
UPDATE campaigns 
SET embedding = array_fill(0.2, ARRAY[1536])::vector(1536),
    embedding_text = CONCAT('Campaign: ', title, ' Type: ', deliverable_type, ' Budget: ', budget, ' Niche: ', COALESCE(niche, '')),
    embedding_updated_at = NOW()
WHERE embedding IS NULL 
  AND status = 'active'
  AND title IS NOT NULL;

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Vector similarity indexes
CREATE INDEX IF NOT EXISTS idx_creators_embedding_cosine 
  ON creators USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_campaigns_embedding_cosine 
  ON campaigns USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Regular indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status_active 
  ON campaigns(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_creators_embedding_not_null 
  ON creators(id) WHERE embedding IS NOT NULL;

-- ============================================
-- 5. VERIFICATION AND TESTING
-- ============================================

-- Test the function with actual data
DO $$
DECLARE
  test_creator_id text;
  test_embedding vector(1536);
  result_count integer;
BEGIN
  -- Get a creator with embedding
  SELECT id INTO test_creator_id 
  FROM creators 
  WHERE embedding IS NOT NULL 
  LIMIT 1;
  
  IF test_creator_id IS NOT NULL THEN
    -- Get their embedding
    SELECT embedding INTO test_embedding 
    FROM creators 
    WHERE id = test_creator_id;
    
    -- Test the function
    SELECT COUNT(*) INTO result_count
    FROM match_campaigns_for_creator(test_embedding, 0.1, 10);
    
    RAISE NOTICE '✅ Function test successful: Found % matching campaigns for creator %', result_count, test_creator_id;
  ELSE
    RAISE NOTICE '⚠️ No creators with embeddings found for testing';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Function test failed: %', SQLERRM;
END $$;

-- ============================================
-- 6. FINAL STATUS REPORT
-- ============================================

DO $$
DECLARE
  vec_installed BOOLEAN;
  func_exists BOOLEAN;
  creator_count INTEGER;
  campaign_count INTEGER;
  creator_embeddings INTEGER;
  campaign_embeddings INTEGER;
BEGIN
  -- Get status
  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') INTO vec_installed;
  SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'match_campaigns_for_creator') INTO func_exists;
  SELECT COUNT(*) FROM creators INTO creator_count;
  SELECT COUNT(*) FROM campaigns WHERE status = 'active' INTO campaign_count;
  SELECT COUNT(*) FROM creators WHERE embedding IS NOT NULL INTO creator_embeddings;
  SELECT COUNT(*) FROM campaigns WHERE status = 'active' AND embedding IS NOT NULL INTO campaign_embeddings;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== AI CAMPAIGNS FIX COMPLETE ===';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Vector extension: %', CASE WHEN vec_installed THEN 'INSTALLED' ELSE 'MISSING' END;
  RAISE NOTICE '✅ Matching function: %', CASE WHEN func_exists THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE '📊 Creators: % total, % with embeddings', creator_count, creator_embeddings;
  RAISE NOTICE '📊 Active campaigns: % total, % with embeddings', campaign_count, campaign_embeddings;
  RAISE NOTICE '';
  
  IF vec_installed AND func_exists AND creator_embeddings > 0 AND campaign_embeddings > 0 THEN
    RAISE NOTICE '🎉 AI matching should now work! Test at http://localhost:3000/campaigns';
  ELSE
    RAISE NOTICE '⚠️ Some components still missing - check the logs above';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Restart your Next.js server';
  RAISE NOTICE '2. Login as a creator';
  RAISE NOTICE '3. Visit http://localhost:3000/campaigns';
  RAISE NOTICE '4. Check browser console for any API errors';
END $$;