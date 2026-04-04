-- Ensure campaign IDs are generated automatically in existing databases.
-- Some deployed environments are missing the default even though the base schema expects it.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE campaigns
  ALTER COLUMN id SET DEFAULT gen_random_uuid();