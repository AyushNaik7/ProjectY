-- ============================================
-- Production Database Indexes
-- ============================================
-- Run this to optimize query performance

-- Primary key indexes (if not already created)
CREATE INDEX IF NOT EXISTS idx_creators_id ON creators(id);
CREATE INDEX IF NOT EXISTS idx_brands_id ON brands(id);
CREATE INDEX IF NOT EXISTS idx_campaigns_id ON campaigns(id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_id ON collaboration_requests(id);

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_collab_req_creator_id ON collaboration_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_collab_req_brand_id ON collaboration_requests(brand_id);
CREATE INDEX IF NOT EXISTS idx_collab_req_campaign_id ON collaboration_requests(campaign_id);

-- Query optimization indexes
CREATE INDEX IF NOT EXISTS idx_creators_niche ON creators(niche);
CREATE INDEX IF NOT EXISTS idx_creators_email ON creators(email);
CREATE INDEX IF NOT EXISTS idx_creators_username ON creators(username);
CREATE INDEX IF NOT EXISTS idx_creators_verified ON creators(verified);

CREATE INDEX IF NOT EXISTS idx_brands_email ON brands(email);
CREATE INDEX IF NOT EXISTS idx_brands_industry ON brands(industry);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_niche ON campaigns(niche);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

CREATE INDEX IF NOT EXISTS idx_collab_req_status ON collaboration_requests(status);
CREATE INDEX IF NOT EXISTS idx_collab_req_created_at ON collaboration_requests(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_status ON campaigns(brand_id, status);
CREATE INDEX IF NOT EXISTS idx_collab_req_creator_status ON collaboration_requests(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_collab_req_brand_status ON collaboration_requests(brand_id, status);

-- Full-text search indexes (if using PostgreSQL)
CREATE INDEX IF NOT EXISTS idx_creators_name_trgm ON creators USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_campaigns_title_trgm ON campaigns USING gin(title gin_trgm_ops);

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Analyze tables for query planner
ANALYZE creators;
ANALYZE brands;
ANALYZE campaigns;
ANALYZE collaboration_requests;

-- Done! Database is optimized for production
