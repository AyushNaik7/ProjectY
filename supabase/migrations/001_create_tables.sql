-- Create Creators Table
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  niche TEXT NOT NULL,
  bio TEXT,
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0,
  youtube_followers INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  instagram_engagement DECIMAL DEFAULT 0,
  youtube_engagement DECIMAL DEFAULT 0,
  tiktok_engagement DECIMAL DEFAULT 0,
  avg_views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deliverable_type TEXT NOT NULL,
  budget INTEGER NOT NULL,
  timeline TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'closed', 'draft')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Collaboration Requests Table
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_creators_niche ON creators(niche);
CREATE INDEX IF NOT EXISTS idx_creators_email ON creators(email);
CREATE INDEX IF NOT EXISTS idx_brands_email ON brands(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_brand_id ON collaboration_requests(brand_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_creator_id ON collaboration_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_status ON collaboration_requests(status);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Creators
CREATE POLICY "Creators can read all creators" ON creators
  FOR SELECT USING (true);

CREATE POLICY "Creators can insert their own data" ON creators
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update their own data" ON creators
  FOR UPDATE USING (true);

-- Create RLS Policies for Brands
CREATE POLICY "Brands can read all brands" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Brands can insert their own data" ON brands
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Brands can update their own data" ON brands
  FOR UPDATE USING (true);

-- Create RLS Policies for Campaigns
CREATE POLICY "Anyone can read campaigns" ON campaigns
  FOR SELECT USING (true);

CREATE POLICY "Brands can insert campaigns" ON campaigns
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Brands can update their campaigns" ON campaigns
  FOR UPDATE USING (true);

-- Create RLS Policies for Collaboration Requests
CREATE POLICY "Anyone can read collaboration requests" ON collaboration_requests
  FOR SELECT USING (true);

CREATE POLICY "Brands can insert requests" ON collaboration_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update requests" ON collaboration_requests
  FOR UPDATE USING (true);
