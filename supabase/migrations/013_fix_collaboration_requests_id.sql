-- Ensure the id column has proper default value for UUID generation
-- This fixes the "null value in column id violates not-null constraint" error

ALTER TABLE collaboration_requests 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Verify the constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'collaboration_requests' 
    AND column_name = 'id' 
    AND column_default LIKE '%gen_random_uuid%'
  ) THEN
    RAISE EXCEPTION 'Default value for id column not set correctly';
  END IF;
END $$;
