-- DEBUG AI MATCHING FUNCTIONALITY
-- Run this to diagnose why AI matching isn't working

-- ============================================
-- 1. CHECK VECTOR EXTENSION AND FUNCTIONS
-- ============================================

-- Verify vector extension is installed
SELECT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'vector'
) as vector_extension_installed;

-- Check if vector matching functions exist
SELECT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'match_campaigns_for_creator'
) as match_campaigns_function_exists;

SELECT EXISTS (
  SELECT 1 FROM pg_proc WHERE proname = 'match_creators_for_campaign'
) as match_creators_function_exists;

-- ============================================
-- 2. CHECK DATA AVAILABILITY
-- ============================================

-- Check if we have creators
SELECT COUNT(*) as total_creators FROM creators;

-- Check if creators have embeddings
SELECT 
  COUNT(*) as total_creators,
  COUNT(embedding) as creators_with_embeddings,
  ROUND(COUNT(embedding) * 100.0 / COUNT(*), 2) as embedding_percentage
FROM creators;

-- Check if we have active campaigns
SELECT COUNT(*) as total_active_campaigns FROM campaigns WHERE status = 'active';

-- Check if campaigns have embeddings
SELECT 
  COUNT(*) as total_campaigns,
  COUNT(embedding) as campaigns_with_embeddings,
  ROUND(COUNT(embedding) * 100.0 / COUNT(*), 2) as embedding_percentage
FROM campaigns WHERE status = 'active';

-- ============================================
-- 3. CHECK SPECIFIC CREATOR DATA
-- ============================================

-- Show sample creator data (first 3 creators)
SELECT 
  id,
  name,
  niche,
  instagram_followers,
  CASE WHEN embedding IS NOT NULL THEN 'YES' ELSE 'NO' END as has_embedding
FROM creators 
ORDER BY created_at DESC 
LIMIT 3;

-- Show sample campaign data (first 3 active campaigns)
SELECT 
  id,
  title,
  niche,
  budget,
  status,
  CASE WHEN embedding IS NOT NULL THEN 'YES' ELSE 'NO' END as has_embedding
FROM campaigns 
WHERE status = 'active'
ORDER BY created_at DESC 
LIMIT 3;

-- ============================================
-- 4. TEST VECTOR MATCHING FUNCTION
-- ============================================

-- Test the function with a dummy embedding (if creators exist)
DO $$
DECLARE
  creator_count INTEGER;
  test_embedding vector(1536);
BEGIN
  SELECT COUNT(*) INTO creator_count FROM creators LIMIT 1;
  
  IF creator_count > 0 THEN
    -- Create a dummy embedding (all zeros)
    SELECT array_fill(0.0, ARRAY[1536])::vector(1536) INTO test_embedding;
    
    -- Test the function
    RAISE NOTICE 'Testing match_campaigns_for_creator function...';
    
    PERFORM * FROM match_campaigns_for_creator(
      test_embedding,
      0.1,  -- low threshold
      5     -- limit 5
    );
    
    RAISE NOTICE '✅ Function executed successfully';
  ELSE
    RAISE NOTICE '⚠️ No creators found to test with';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Function test failed: %', SQLERRM;
END $$;

-- ============================================
-- 5. SUMMARY REPORT
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
  -- Get all the data
  SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') INTO vec_installed;
  SELECT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'match_campaigns_for_creator') INTO func_exists;
  SELECT COUNT(*) FROM creators INTO creator_count;
  SELECT COUNT(*) FROM campaigns WHERE status = 'active' INTO campaign_count;
  SELECT COUNT(embedding) FROM creators INTO creator_embeddings;
  SELECT COUNT(embedding) FROM campaigns WHERE status = 'active' INTO campaign_embeddings;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== AI MATCHING DIAGNOSTIC REPORT ===';
  RAISE NOTICE '';
  
  -- Vector extension
  IF vec_installed THEN
    RAISE NOTICE '✅ Vector extension: INSTALLED';
  ELSE
    RAISE NOTICE '❌ Vector extension: NOT INSTALLED';
  END IF;
  
  -- Functions
  IF func_exists THEN
    RAISE NOTICE '✅ Matching functions: EXIST';
  ELSE
    RAISE NOTICE '❌ Matching functions: MISSING';
  END IF;
  
  -- Data availability
  RAISE NOTICE '📊 Creators: % total, % with embeddings', creator_count, creator_embeddings;
  RAISE NOTICE '📊 Active campaigns: % total, % with embeddings', campaign_count, campaign_embeddings;
  
  -- Diagnosis
  RAISE NOTICE '';
  IF NOT vec_installed THEN
    RAISE NOTICE '🔧 FIX: Install vector extension: CREATE EXTENSION vector;';
  ELSIF NOT func_exists THEN
    RAISE NOTICE '🔧 FIX: Run SETUP_VECTOR_EXTENSION.sql to create functions';
  ELSIF creator_count = 0 THEN
    RAISE NOTICE '🔧 FIX: No creators found - add demo data';
  ELSIF campaign_count = 0 THEN
    RAISE NOTICE '🔧 FIX: No active campaigns - add demo data';
  ELSIF creator_embeddings = 0 AND campaign_embeddings = 0 THEN
    RAISE NOTICE '🔧 FIX: No embeddings found - need to generate embeddings for AI matching';
    RAISE NOTICE '     Without embeddings, system will use fallback matching';
  ELSE
    RAISE NOTICE '✅ AI matching should work! Check API logs for errors.';
  END IF;
  
END $$;