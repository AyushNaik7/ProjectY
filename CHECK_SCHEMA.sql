-- Check the actual data types of your tables
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name IN ('brands', 'creators', 'campaigns', 'collaboration_requests')
  AND column_name IN ('id', 'brand_id', 'creator_id', 'campaign_id')
ORDER BY table_name, ordinal_position;
