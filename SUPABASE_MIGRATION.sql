-- Migration: Update user ID columns to support Clerk IDs
-- Run this in your Supabase SQL Editor

-- 1. Update creators table
ALTER TABLE creators 
  ALTER COLUMN id TYPE TEXT;

-- 2. Update brands table (if exists)
ALTER TABLE brands 
  ALTER COLUMN id TYPE TEXT;

-- 3. Update campaigns table
ALTER TABLE campaigns 
  ALTER COLUMN brand_id TYPE TEXT;

-- 4. Update collaboration_requests table (if exists)
ALTER TABLE collaboration_requests 
  ALTER COLUMN creator_id TYPE TEXT,
  ALTER COLUMN brand_id TYPE TEXT;

-- 5. Update any other tables with user references
-- Add more ALTER statements as needed for your schema

-- Note: If you have foreign key constraints, you may need to drop and recreate them
-- Example:
-- ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_brand_id_fkey;
-- ALTER TABLE campaigns ADD CONSTRAINT campaigns_brand_id_fkey 
--   FOREIGN KEY (brand_id) REFERENCES brands(id);
