-- Check the collaboration_requests table schema
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'collaboration_requests' 
ORDER BY ordinal_position;

-- Check if there are any triggers on the table
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'collaboration_requests';

-- Check recent failed inserts (if logging is enabled)
SELECT * FROM collaboration_requests 
ORDER BY created_at DESC 
LIMIT 5;
