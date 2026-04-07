-- ============================================================
-- STEP 1: Check what exists and clean up if needed
-- Run this first to see what's in your database
-- ============================================================

-- Check if conversations table exists and what columns it has
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- Check if messages table exists
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Check other new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'messages', 'notifications', 'portfolio_items', 'reviews', 'payments', 'profile_views')
ORDER BY table_name;

-- If conversations table exists but is empty/wrong, we need to drop it
-- UNCOMMENT THE LINES BELOW ONLY IF YOU WANT TO START FRESH:

-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS conversations CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS portfolio_items CASCADE;
-- DROP TABLE IF EXISTS profile_views CASCADE;
-- DROP TABLE IF EXISTS reviews CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
