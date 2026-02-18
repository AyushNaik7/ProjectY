-- ============================================================
-- Migration 003: pgvector Embeddings for AI Matching
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding columns to creators and campaigns
ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_text TEXT,
  ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMP;

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_text TEXT,
  ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMP;

-- 3. Create IVFFlat indexes for fast vector similarity search
-- These use cosine distance (<=>). Index is created after some data exists.
-- For initial setup, create the index with lists=100 (tune based on data size).
CREATE INDEX IF NOT EXISTS idx_creators_embedding
  ON creators USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_campaigns_embedding
  ON campaigns USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Vector similarity search function: Find creators matching a campaign
CREATE OR REPLACE FUNCTION match_creators_for_campaign(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  niche TEXT,
  instagram_handle TEXT,
  instagram_followers INTEGER,
  avg_views INTEGER,
  instagram_engagement DECIMAL,
  verified BOOLEAN,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.niche,
    c.instagram_handle,
    c.instagram_followers,
    c.avg_views,
    c.instagram_engagement,
    c.verified,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM creators c
  WHERE c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Vector similarity search function: Find campaigns matching a creator
CREATE OR REPLACE FUNCTION match_campaigns_for_creator(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  brand_id UUID,
  title TEXT,
  description TEXT,
  deliverable_type TEXT,
  budget INTEGER,
  timeline TEXT,
  niche TEXT,
  status TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    camp.id,
    camp.brand_id,
    camp.title,
    camp.description,
    camp.deliverable_type,
    camp.budget,
    camp.timeline,
    camp.niche,
    camp.status,
    1 - (camp.embedding <=> query_embedding) AS similarity
  FROM campaigns camp
  WHERE camp.embedding IS NOT NULL
    AND camp.status = 'active'
    AND 1 - (camp.embedding <=> query_embedding) > match_threshold
  ORDER BY camp.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Hybrid scoring function combining vector similarity with business logic
CREATE OR REPLACE FUNCTION hybrid_match_creators(
  campaign_id_input UUID,
  similarity_weight FLOAT DEFAULT 0.4,
  engagement_weight FLOAT DEFAULT 0.2,
  budget_weight FLOAT DEFAULT 0.25,
  niche_weight FLOAT DEFAULT 0.15,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  creator_id UUID,
  creator_name TEXT,
  creator_niche TEXT,
  instagram_handle TEXT,
  followers INTEGER,
  avg_views INTEGER,
  engagement_rate DECIMAL,
  verified BOOLEAN,
  semantic_score FLOAT,
  engagement_score FLOAT,
  budget_score FLOAT,
  niche_score FLOAT,
  total_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  camp_record RECORD;
BEGIN
  -- Get campaign data
  SELECT * INTO camp_record FROM campaigns WHERE campaigns.id = campaign_id_input;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Campaign not found';
  END IF;
  IF camp_record.embedding IS NULL THEN
    RAISE EXCEPTION 'Campaign embedding not generated yet';
  END IF;

  RETURN QUERY
  SELECT
    c.id AS creator_id,
    c.name AS creator_name,
    c.niche AS creator_niche,
    c.instagram_handle,
    c.instagram_followers AS followers,
    c.avg_views,
    c.instagram_engagement AS engagement_rate,
    c.verified,
    -- Semantic similarity (0-1)
    (1 - (c.embedding <=> camp_record.embedding))::FLOAT AS semantic_score,
    -- Engagement score (0-1)
    LEAST(COALESCE(c.instagram_engagement, 0) / 10.0, 1.0)::FLOAT AS engagement_score,
    -- Budget compatibility (0-1)
    CASE
      WHEN c.min_rate_private <= camp_record.budget
        AND c.min_rate_private::FLOAT / GREATEST(camp_record.budget, 1)::FLOAT BETWEEN 0.3 AND 0.8
        THEN 1.0
      WHEN c.min_rate_private <= camp_record.budget THEN 0.7
      WHEN c.min_rate_private::FLOAT / GREATEST(camp_record.budget, 1)::FLOAT <= 1.2 THEN 0.3
      ELSE 0.0
    END::FLOAT AS budget_score,
    -- Niche alignment (0-1)
    CASE
      WHEN camp_record.niche = 'Any' OR c.niche = camp_record.niche THEN 1.0
      ELSE 0.0
    END::FLOAT AS niche_score,
    -- Weighted total score
    (
      similarity_weight * (1 - (c.embedding <=> camp_record.embedding))
      + engagement_weight * LEAST(COALESCE(c.instagram_engagement, 0) / 10.0, 1.0)
      + budget_weight * CASE
          WHEN c.min_rate_private <= camp_record.budget
            AND c.min_rate_private::FLOAT / GREATEST(camp_record.budget, 1)::FLOAT BETWEEN 0.3 AND 0.8
            THEN 1.0
          WHEN c.min_rate_private <= camp_record.budget THEN 0.7
          WHEN c.min_rate_private::FLOAT / GREATEST(camp_record.budget, 1)::FLOAT <= 1.2 THEN 0.3
          ELSE 0.0
        END
      + niche_weight * CASE
          WHEN camp_record.niche = 'Any' OR c.niche = camp_record.niche THEN 1.0
          ELSE 0.0
        END
    )::FLOAT AS total_score
  FROM creators c
  WHERE c.embedding IS NOT NULL
  ORDER BY total_score DESC
  LIMIT result_limit;
END;
$$;

-- 7. Hybrid scoring for campaigns matching a creator
CREATE OR REPLACE FUNCTION hybrid_match_campaigns(
  creator_id_input UUID,
  similarity_weight FLOAT DEFAULT 0.4,
  engagement_weight FLOAT DEFAULT 0.2,
  budget_weight FLOAT DEFAULT 0.25,
  niche_weight FLOAT DEFAULT 0.15,
  result_limit INT DEFAULT 10
)
RETURNS TABLE (
  campaign_id UUID,
  brand_id UUID,
  title TEXT,
  description TEXT,
  deliverable_type TEXT,
  budget INTEGER,
  timeline TEXT,
  campaign_niche TEXT,
  status TEXT,
  semantic_score FLOAT,
  budget_score FLOAT,
  niche_score FLOAT,
  total_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  creator_record RECORD;
BEGIN
  SELECT * INTO creator_record FROM creators WHERE creators.id = creator_id_input;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Creator not found';
  END IF;
  IF creator_record.embedding IS NULL THEN
    RAISE EXCEPTION 'Creator embedding not generated yet';
  END IF;

  RETURN QUERY
  SELECT
    camp.id AS campaign_id,
    camp.brand_id,
    camp.title,
    camp.description,
    camp.deliverable_type,
    camp.budget,
    camp.timeline,
    camp.niche AS campaign_niche,
    camp.status,
    -- Semantic similarity
    (1 - (camp.embedding <=> creator_record.embedding))::FLOAT AS semantic_score,
    -- Budget compatibility
    CASE
      WHEN creator_record.min_rate_private <= camp.budget
        AND creator_record.min_rate_private::FLOAT / GREATEST(camp.budget, 1)::FLOAT BETWEEN 0.3 AND 0.8
        THEN 1.0
      WHEN creator_record.min_rate_private <= camp.budget THEN 0.7
      WHEN creator_record.min_rate_private::FLOAT / GREATEST(camp.budget, 1)::FLOAT <= 1.2 THEN 0.3
      ELSE 0.0
    END::FLOAT AS budget_score,
    -- Niche alignment
    CASE
      WHEN camp.niche = 'Any' OR creator_record.niche = camp.niche THEN 1.0
      ELSE 0.0
    END::FLOAT AS niche_score,
    -- Weighted total
    (
      similarity_weight * (1 - (camp.embedding <=> creator_record.embedding))
      + budget_weight * CASE
          WHEN creator_record.min_rate_private <= camp.budget
            AND creator_record.min_rate_private::FLOAT / GREATEST(camp.budget, 1)::FLOAT BETWEEN 0.3 AND 0.8
            THEN 1.0
          WHEN creator_record.min_rate_private <= camp.budget THEN 0.7
          WHEN creator_record.min_rate_private::FLOAT / GREATEST(camp.budget, 1)::FLOAT <= 1.2 THEN 0.3
          ELSE 0.0
        END
      + niche_weight * CASE
          WHEN camp.niche = 'Any' OR creator_record.niche = camp.niche THEN 1.0
          ELSE 0.0
        END
    )::FLOAT AS total_score
  FROM campaigns camp
  WHERE camp.embedding IS NOT NULL
    AND camp.status = 'active'
  ORDER BY total_score DESC
  LIMIT result_limit;
END;
$$;
