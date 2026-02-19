-- ============================================================
-- Migration 004: Enhanced RLS Policies for AI Matching
-- ============================================================

-- Drop existing overly-permissive policies
DROP POLICY IF EXISTS "Creators can read all creators" ON creators;
DROP POLICY IF EXISTS "Creators can insert their own data" ON creators;
DROP POLICY IF EXISTS "Creators can update their own data" ON creators;
DROP POLICY IF EXISTS "Brands can read all brands" ON brands;
DROP POLICY IF EXISTS "Brands can insert their own data" ON brands;
DROP POLICY IF EXISTS "Brands can update their own data" ON brands;
DROP POLICY IF EXISTS "Anyone can read campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brands can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brands can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Anyone can read collaboration requests" ON collaboration_requests;
DROP POLICY IF EXISTS "Brands can insert requests" ON collaboration_requests;
DROP POLICY IF EXISTS "Anyone can update requests" ON collaboration_requests;

-- ============================================================
-- CREATORS TABLE RLS
-- ============================================================

-- Public info readable by all authenticated users
-- NOTE: embedding column and min_rate_private are EXCLUDED from client queries
-- They're only accessed via service role (server-side)
CREATE POLICY "creators_select_public"
  ON creators FOR SELECT
  USING (auth.role() = 'authenticated');

-- Creators can only insert their own profile
CREATE POLICY "creators_insert_own"
  ON creators FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Creators can only update their own profile
CREATE POLICY "creators_update_own"
  ON creators FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Creators can only delete their own profile
CREATE POLICY "creators_delete_own"
  ON creators FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- BRANDS TABLE RLS
-- ============================================================

CREATE POLICY "brands_select_public"
  ON brands FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "brands_insert_own"
  ON brands FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "brands_update_own"
  ON brands FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "brands_delete_own"
  ON brands FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- CAMPAIGNS TABLE RLS
-- ============================================================

-- All authenticated users can view active campaigns
CREATE POLICY "campaigns_select_authenticated"
  ON campaigns FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only the brand owner can insert campaigns
CREATE POLICY "campaigns_insert_brand_owner"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

-- Only the brand owner can update their campaigns
CREATE POLICY "campaigns_update_brand_owner"
  ON campaigns FOR UPDATE
  USING (auth.uid() = brand_id)
  WITH CHECK (auth.uid() = brand_id);

-- Only the brand owner can delete their campaigns
CREATE POLICY "campaigns_delete_brand_owner"
  ON campaigns FOR DELETE
  USING (auth.uid() = brand_id);

-- ============================================================
-- COLLABORATION REQUESTS TABLE RLS
-- ============================================================

-- Both brand and creator involved can view the request
CREATE POLICY "requests_select_involved"
  ON collaboration_requests FOR SELECT
  USING (
    auth.uid() = brand_id
    OR auth.uid() = creator_id
  );

-- Brands can create collaboration requests
CREATE POLICY "requests_insert_brand"
  ON collaboration_requests FOR INSERT
  WITH CHECK (auth.uid() = brand_id);

-- Creators can update request status (accept/reject)
CREATE POLICY "requests_update_creator"
  ON collaboration_requests FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- ============================================================
-- SECURITY: Restrict direct embedding access
-- ============================================================

-- Revoke direct access to embedding columns from anon/authenticated roles
-- Embeddings are only accessed via service role through API routes
-- This is enforced at the application layer since Postgres column-level
-- security with RLS requires views. The SECURITY DEFINER functions
-- in 003 already handle this.

-- Create a view for client-side creator data (excludes sensitive fields)
CREATE OR REPLACE VIEW public.creators_public AS
SELECT
  id, name, email, niche, bio, instagram_handle,
  instagram_followers, youtube_followers, tiktok_followers,
  instagram_engagement, youtube_engagement, tiktok_engagement,
  avg_views, verified, created_at, updated_at
FROM creators;

-- Create a view for client-side campaign data (excludes embeddings)
CREATE OR REPLACE VIEW public.campaigns_public AS
SELECT
  id, brand_id, title, description, deliverable_type,
  budget, timeline, niche, status, created_at, updated_at
FROM campaigns;

-- Grant views to authenticated users
GRANT SELECT ON public.creators_public TO authenticated;
GRANT SELECT ON public.campaigns_public TO authenticated;
