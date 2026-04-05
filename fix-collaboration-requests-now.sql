-- Emergency fix for collaboration_requests ID issue
-- Run this immediately to fix the problem

-- First, check current table structure
\d collaboration_requests;

-- Ensure the default is set correctly
ALTER TABLE collaboration_requests 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Test the default works by inserting a test record (will be deleted)
INSERT INTO collaboration_requests (brand_id, creator_id, status, message) 
VALUES (
  (SELECT id FROM brands LIMIT 1),
  (SELECT id FROM creators LIMIT 1), 
  'pending', 
  'test'
) RETURNING id;

-- Delete the test record
DELETE FROM collaboration_requests WHERE message = 'test';

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
AND column_name = 'id';