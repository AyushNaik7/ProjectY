-- Demo Campaigns for InstaCollab Platform
-- 50 realistic brand campaigns across different industries and niches

-- First, create demo brand accounts
INSERT INTO brands (
  id,
  name,
  email,
  industry,
  website,
  description,
  created_at
) VALUES
('demo-brand-001', 'StyleHub Fashion', 'partnerships@stylehub.com', 'Fashion', 'https://stylehub.com', 'Leading online fashion retailer for trendy clothing', NOW()),
('demo-brand-002', 'GlowUp Cosmetics', 'collabs@glowup.com', 'Beauty', 'https://glowup.com', 'Premium skincare and makeup brand', NOW()),
('demo-brand-003', 'FitLife Nutrition', 'marketing@fitlife.com', 'Fitness', 'https://fitlife.com', 'Sports nutrition and supplements', NOW()),
('demo-brand-004', 'TechGear India', 'influencer@techgear.in', 'Technology', 'https://techgear.in', 'Latest gadgets and tech accessories', NOW()),
('demo-brand-005', 'Wanderlust Travels', 'partnerships@wanderlust.com', 'Travel', 'https://wanderlust.com', 'Curated travel experiences and packages', NOW()),
('demo-brand-006', 'FoodieBox', 'collabs@foodiebox.com', 'Food', 'https://foodiebox.com', 'Gourmet food subscription service', NOW()),
('demo-brand-007', 'EcoLiving Store', 'marketing@ecoliving.in', 'Lifestyle', 'https://ecoliving.in', 'Sustainable and eco-friendly products', NOW()),
('demo-brand-008', 'Luxe Watches', 'partnerships@luxewatches.com', 'Fashion', 'https://luxewatches.com', 'Premium timepieces and accessories', NOW()),
('demo-brand-009', 'BeautyBliss', 'influencer@beautybliss.in', 'Beauty', 'https://beautybliss.in', 'Affordable beauty and personal care', NOW()),
('demo-brand-010', 'ActiveWear Pro', 'collabs@activewear.com', 'Fitness', 'https://activewear.com', 'Performance athletic apparel', NOW()),
('demo-brand-011', 'HomeDecor Haven', 'marketing@homedecorhaven.com', 'Lifestyle', 'https://homedecorhaven.com', 'Modern home furnishing and decor', NOW()),
('demo-brand-012', 'SnackTime', 'partnerships@snacktime.in', 'Food', 'https://snacktime.in', 'Healthy snacks and beverages', NOW()),
('demo-brand-013', 'TechSavvy', 'collabs@techsavvy.com', 'Technology', 'https://techsavvy.com', 'Consumer electronics and smart devices', NOW()),
('demo-brand-014', 'Glamour Cosmetics', 'influencer@glamour.in', 'Beauty', 'https://glamour.in', 'Luxury makeup and beauty products', NOW()),
('demo-brand-015', 'FitZone Gym', 'marketing@fitzone.com', 'Fitness', 'https://fitzone.com', 'Premium fitness centers across India', NOW()),
('demo-brand-016', 'ChicWardrobe', 'partnerships@chicwardrobe.com', 'Fashion', 'https://chicwardrobe.com', 'Contemporary women''s fashion', NOW()),
('demo-brand-017', 'TravelBuddy', 'collabs@travelbuddy.in', 'Travel', 'https://travelbuddy.in', 'Budget travel planning platform', NOW()),
('demo-brand-018', 'NutriWell', 'marketing@nutriwell.com', 'Health', 'https://nutriwell.com', 'Health supplements and vitamins', NOW()),
('demo-brand-019', 'UrbanStyle', 'influencer@urbanstyle.in', 'Fashion', 'https://urbanstyle.in', 'Streetwear and casual fashion', NOW()),
('demo-brand-020', 'SkinScience', 'partnerships@skinscience.com', 'Beauty', 'https://skinscience.com', 'Dermatologist-approved skincare', NOW());

-- Now create 50 campaigns
INSERT INTO campaigns (
  id,
  brand_id,
  title,
  description,
  budget,
  deliverable_type,
  niche,
  status,
  timeline,
  created_at
) VALUES
-- Fashion Campaigns (10)
('demo-campaign-001', 'demo-brand-001', 'Summer Collection Launch 2026', 'Promote our new summer collection featuring vibrant colors and sustainable fabrics. Looking for fashion influencers who align with our eco-conscious values.', 50000, 'Instagram Post + Story', 'Fashion', 'active', '2 weeks', NOW()),
('demo-campaign-002', 'demo-brand-008', 'Luxury Watch Campaign', 'Showcase our premium timepiece collection. Seeking lifestyle influencers who embody sophistication and elegance.', 150000, 'Instagram Reel', 'Fashion', 'active', '3 weeks', NOW()),
('demo-campaign-003', 'demo-brand-016', 'Workwear Collection', 'Feature our professional workwear line for modern working women. Looking for career-focused influencers.', 75000, 'Instagram Post', 'Fashion', 'active', '2 weeks', NOW()),
('demo-campaign-004', 'demo-brand-019', 'Streetwear Drop', 'Launch our latest streetwear collection. Need urban fashion creators with edgy style.', 60000, 'Instagram Reel + Post', 'Fashion', 'active', '10 days', NOW()),
('demo-campaign-005', 'demo-brand-001', 'Sustainable Fashion Week', 'Highlight our commitment to sustainable fashion. Partner with eco-conscious creators.', 80000, 'Instagram Story Series', 'Fashion', 'active', '1 week', NOW()),
('demo-campaign-006', 'demo-brand-008', 'Valentine''s Day Special', 'Promote our couple watch sets for Valentine''s Day. Looking for couple influencers.', 100000, 'Instagram Post + Reel', 'Fashion', 'active', '2 weeks', NOW()),
('demo-campaign-007', 'demo-brand-016', 'Ethnic Wear Collection', 'Showcase our fusion ethnic wear line. Need creators who style traditional with modern.', 65000, 'Instagram Post', 'Fashion', 'active', '3 weeks', NOW()),
('demo-campaign-008', 'demo-brand-019', 'Sneaker Launch', 'Launch our new sneaker line. Looking for sneakerhead influencers.', 70000, 'Instagram Reel', 'Fashion', 'active', '2 weeks', NOW()),
('demo-campaign-009', 'demo-brand-001', 'Plus Size Fashion', 'Promote our inclusive plus-size collection. Seeking body-positive influencers.', 55000, 'Instagram Post + Story', 'Fashion', 'active', '2 weeks', NOW()),
('demo-campaign-010', 'demo-brand-016', 'Monsoon Collection', 'Feature our monsoon-ready fashion line. Need creators with aesthetic rain content.', 45000, 'Instagram Post', 'Fashion', 'active', '10 days', NOW()),

-- Beauty Campaigns (10)
('demo-campaign-011', 'demo-brand-002', 'Glow Serum Launch', 'Introduce our new vitamin C serum. Looking for skincare enthusiasts with glowing skin.', 85000, 'Instagram Reel + Post', 'Beauty', 'active', '3 weeks', NOW()),
('demo-campaign-012', 'demo-brand-009', 'Affordable Beauty Range', 'Promote our budget-friendly makeup line. Need creators who focus on affordable beauty.', 40000, 'Instagram Post', 'Beauty', 'active', '2 weeks', NOW()),
('demo-campaign-013', 'demo-brand-014', 'Luxury Lipstick Collection', 'Launch our premium lipstick range. Seeking makeup artists and beauty influencers.', 120000, 'Instagram Reel', 'Beauty', 'active', '4 weeks', NOW()),
('demo-campaign-014', 'demo-brand-020', 'Acne Treatment Line', 'Promote our dermatologist-approved acne care products. Need authentic skincare reviewers.', 95000, 'Instagram Post + Story', 'Beauty', 'active', '3 weeks', NOW()),
('demo-campaign-015', 'demo-brand-002', 'Natural Beauty Campaign', 'Highlight our organic and natural beauty products. Looking for clean beauty advocates.', 70000, 'Instagram Story Series', 'Beauty', 'active', '2 weeks', NOW()),
('demo-campaign-016', 'demo-brand-009', 'Bridal Makeup Kit', 'Showcase our complete bridal makeup collection. Need bridal makeup artists.', 60000, 'Instagram Reel + Post', 'Beauty', 'active', '3 weeks', NOW()),
('demo-campaign-017', 'demo-brand-014', 'Anti-Aging Skincare', 'Promote our anti-aging product line. Seeking mature beauty influencers.', 110000, 'Instagram Post', 'Beauty', 'active', '4 weeks', NOW()),
('demo-campaign-018', 'demo-brand-020', 'Sunscreen Awareness', 'Educate about sunscreen importance while promoting our SPF range. Need skincare educators.', 75000, 'Instagram Reel', 'Beauty', 'active', '2 weeks', NOW()),
('demo-campaign-019', 'demo-brand-002', 'Men''s Grooming Line', 'Launch our men''s skincare and grooming products. Looking for male grooming influencers. Target: Men 20-40, grooming focused. Requirements: 120K+ followers, men''s grooming content, 1 Reel + 2 posts', 80000, 'Instagram Post + Reel', 'Beauty', 'active', '3 weeks', NOW()),
('demo-campaign-020', 'demo-brand-009', 'Makeup Tutorial Series', 'Create beginner-friendly makeup tutorials using our products. Need patient educators.', 50000, 'Instagram Reel Series', 'Beauty', 'active', '2 weeks', NOW()),

-- Fitness Campaigns (10)
('demo-campaign-021', 'demo-brand-003', 'Protein Powder Launch', 'Introduce our new whey protein flavors. Looking for fitness trainers and athletes.', 90000, 'Instagram Reel + Post', 'Fitness', 'active', '3 weeks', NOW()),
('demo-campaign-022', 'demo-brand-010', 'Activewear Collection', 'Showcase our new performance activewear line. Need fitness influencers with workout content.', 100000, 'Instagram Post + Story', 'Fitness', 'active', '4 weeks', NOW()),
('demo-campaign-023', 'demo-brand-015', 'Gym Membership Drive', 'Promote our premium gym memberships. Looking for transformation story creators.', 120000, 'Instagram Reel', 'Fitness', 'active', '1 month', NOW()),
('demo-campaign-024', 'demo-brand-003', 'Pre-Workout Energy', 'Launch our new pre-workout supplement. Need high-energy fitness creators.', 75000, 'Instagram Reel + Post', 'Fitness', 'active', '2 weeks', NOW()),
('demo-campaign-025', 'demo-brand-010', 'Yoga Wear Line', 'Feature our comfortable yoga apparel. Looking for yoga instructors and practitioners.', 65000, 'Instagram Post', 'Fitness', 'active', '3 weeks', NOW()),
('demo-campaign-026', 'demo-brand-018', 'Multivitamin Campaign', 'Promote our daily multivitamin supplements. Need health and wellness influencers.', 55000, 'Instagram Story Series', 'Fitness', 'active', '2 weeks', NOW()),
('demo-campaign-027', 'demo-brand-015', 'Women''s Fitness Program', 'Launch our women-specific fitness programs. Looking for female fitness trainers. Target: Women 20-40 with fitness goals. Requirements: 150K+ followers, women''s fitness content, 2 Reels + 2 posts', 85000, 'Instagram Reel + Post', 'Fitness', 'active', '3 weeks', NOW()),
('demo-campaign-028', 'demo-brand-003', 'Weight Loss Challenge', 'Promote our weight loss supplement stack. Need authentic transformation creators.', 95000, 'Instagram Post + Story', 'Fitness', 'active', '1 month', NOW()),
('demo-campaign-029', 'demo-brand-010', 'Running Gear', 'Showcase our running apparel and accessories. Looking for marathon runners and joggers.', 70000, 'Instagram Reel', 'Fitness', 'active', '2 weeks', NOW()),
('demo-campaign-030', 'demo-brand-018', 'Immunity Boosters', 'Promote our immunity-boosting supplements. Need health-focused creators.', 60000, 'Instagram Post', 'Fitness', 'active', '2 weeks', NOW()),

-- Food & Travel Campaigns (10)
('demo-campaign-031', 'demo-brand-006', 'Gourmet Subscription Box', 'Promote our monthly gourmet food subscription. Looking for food bloggers and reviewers.', 80000, 'Instagram Reel + Post', 'Food', 'active', '3 weeks', NOW()),
('demo-campaign-032', 'demo-brand-005', 'Bali Travel Package', 'Showcase our exclusive Bali travel packages. Need travel influencers with tropical content.', 200000, 'Instagram Post + Story', 'Travel', 'active', '1 month', NOW()),
('demo-campaign-033', 'demo-brand-012', 'Healthy Snack Range', 'Launch our guilt-free snack collection. Looking for health and fitness creators.', 50000, 'Instagram Post', 'Food', 'active', '2 weeks', NOW()),
('demo-campaign-034', 'demo-brand-017', 'Budget Travel Guide', 'Promote our budget travel planning services. Need backpackers and budget travelers.', 45000, 'Instagram Reel', 'Travel', 'active', '2 weeks', NOW()),
('demo-campaign-035', 'demo-brand-006', 'Artisan Coffee Launch', 'Introduce our premium coffee collection. Looking for coffee enthusiasts and cafe hoppers.', 65000, 'Instagram Post + Story', 'Food', 'active', '3 weeks', NOW()),
('demo-campaign-036', 'demo-brand-005', 'Himalayan Trek Package', 'Promote our guided Himalayan trekking experiences. Need adventure travel creators.', 150000, 'Instagram Reel + Post', 'Travel', 'active', '1 month', NOW()),
('demo-campaign-037', 'demo-brand-012', 'Protein Bars Launch', 'Launch our new protein bar flavors. Looking for fitness and food creators.', 55000, 'Instagram Reel', 'Food', 'active', '2 weeks', NOW()),
('demo-campaign-038', 'demo-brand-017', 'Solo Travel Campaign', 'Promote solo travel packages for women. Need solo female travel influencers.', 90000, 'Instagram Post + Story', 'Travel', 'active', '3 weeks', NOW()),
('demo-campaign-039', 'demo-brand-006', 'Vegan Food Box', 'Showcase our plant-based gourmet subscription. Looking for vegan food creators.', 70000, 'Instagram Reel + Post', 'Food', 'active', '3 weeks', NOW()),
('demo-campaign-040', 'demo-brand-005', 'Luxury Resort Staycation', 'Promote our luxury resort partnerships. Need luxury travel and lifestyle influencers.', 250000, 'Instagram Post + Story', 'Travel', 'active', '1 month', NOW()),

-- Tech & Lifestyle Campaigns (10)
('demo-campaign-041', 'demo-brand-004', 'Smartphone Launch', 'Launch our latest flagship smartphone. Looking for tech reviewers with unboxing content.', 180000, 'Instagram Reel + Post', 'Tech', 'active', '1 month', NOW()),
('demo-campaign-042', 'demo-brand-011', 'Home Decor Collection', 'Showcase our modern home decor range. Need home and lifestyle influencers.', 75000, 'Instagram Post + Story', 'Lifestyle', 'active', '3 weeks', NOW()),
('demo-campaign-043', 'demo-brand-013', 'Wireless Earbuds', 'Promote our new noise-cancelling earbuds. Looking for tech and music creators.', 95000, 'Instagram Reel', 'Tech', 'active', '2 weeks', NOW()),
('demo-campaign-044', 'demo-brand-007', 'Eco-Friendly Products', 'Launch our sustainable lifestyle product range. Need eco-conscious creators.', 60000, 'Instagram Post', 'Lifestyle', 'active', '3 weeks', NOW()),
('demo-campaign-045', 'demo-brand-004', 'Smartwatch Campaign', 'Feature our fitness-focused smartwatch. Looking for fitness tech enthusiasts.', 120000, 'Instagram Reel + Post', 'Tech', 'active', '3 weeks', NOW()),
('demo-campaign-046', 'demo-brand-011', 'Minimalist Living', 'Promote our minimalist furniture line. Need minimalist lifestyle creators.', 85000, 'Instagram Post + Story', 'Lifestyle', 'active', '4 weeks', NOW()),
('demo-campaign-047', 'demo-brand-013', 'Gaming Accessories', 'Launch our gaming peripherals collection. Looking for gaming influencers.', 100000, 'Instagram Reel', 'Tech', 'active', '2 weeks', NOW()),
('demo-campaign-048', 'demo-brand-007', 'Zero Waste Challenge', 'Promote our zero-waste lifestyle products. Need sustainability advocates.', 50000, 'Instagram Story Series', 'Lifestyle', 'active', '2 weeks', NOW()),
('demo-campaign-049', 'demo-brand-004', 'Laptop Launch', 'Introduce our new ultrabook for creators. Looking for content creators and professionals.', 200000, 'Instagram Reel + Post', 'Tech', 'active', '1 month', NOW()),
('demo-campaign-050', 'demo-brand-011', 'Pet-Friendly Home', 'Showcase our pet-friendly home products. Need pet parent influencers.', 65000, 'Instagram Post + Story', 'Lifestyle', 'active', '3 weeks', NOW());

