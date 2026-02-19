-- ============================================================
-- Indian Demo Data Seed
-- Run this in your Supabase SQL Editor to populate demo data
-- ============================================================

-- ── Creators (12 Indian creators across various niches) ──
INSERT INTO creators (id, name, email, niche, bio, instagram_handle, instagram_followers, youtube_followers, tiktok_followers, instagram_engagement, youtube_engagement, tiktok_engagement, avg_views, min_rate_private, verified)
VALUES
  ('d0000001-0001-4000-8000-000000000001', 'Ananya Sharma', 'ananya.sharma@demo.in', 'Fashion & Lifestyle', 'Fashion influencer from Mumbai. Love styling Indian ethnic & western fusion outfits. Brand collaborations for 3+ years.', 'ananyastyled', 520000, 180000, 0, 4.8, 3.2, 0, 85000, 15000, true),
  ('d0000001-0002-4000-8000-000000000002', 'Rohan Mehta', 'rohan.mehta@demo.in', 'Tech & Gadgets', 'Tech reviewer based in Bangalore. I review smartphones, laptops, and smart home gadgets with honest opinions.', 'rohanreviews', 340000, 620000, 0, 3.5, 5.1, 0, 150000, 25000, true),
  ('d0000001-0003-4000-8000-000000000003', 'Priya Patel', 'priya.patel@demo.in', 'Food & Cooking', 'Home chef from Ahmedabad sharing authentic Gujarati recipes, street food recreations, and fusion experiments.', 'priyacooks', 280000, 410000, 0, 6.2, 4.5, 0, 200000, 12000, true),
  ('d0000001-0004-4000-8000-000000000004', 'Arjun Kapoor', 'arjun.kapoor@demo.in', 'Fitness & Health', 'Certified fitness trainer from Delhi. Calisthenics, nutrition tips, and Indian diet plans for muscle building.', 'arjunfitlife', 450000, 290000, 0, 5.5, 4.1, 0, 120000, 18000, true),
  ('d0000001-0005-4000-8000-000000000005', 'Sneha Reddy', 'sneha.reddy@demo.in', 'Beauty & Skincare', 'Dermatologist-turned-influencer from Hyderabad. Science-backed skincare routines for Indian skin tones.', 'snehaglow', 680000, 320000, 0, 5.8, 4.7, 0, 180000, 22000, true),
  ('d0000001-0006-4000-8000-000000000006', 'Karan Singh', 'karan.singh@demo.in', 'Travel & Adventure', 'Solo traveller exploring offbeat India. From Ladakh to Andamans, capturing hidden gems of Incredible India.', 'karanwanders', 390000, 510000, 0, 4.3, 3.8, 0, 160000, 20000, false),
  ('d0000001-0007-4000-8000-000000000007', 'Meera Joshi', 'meera.joshi@demo.in', 'Education & Learning', 'IIT alumni from Pune. Making math and science fun for students preparing for JEE and board exams.', 'meeralearns', 210000, 870000, 0, 3.9, 6.3, 0, 350000, 10000, true),
  ('d0000001-0008-4000-8000-000000000008', 'Vikram Desai', 'vikram.desai@demo.in', 'Finance & Business', 'CA from Mumbai simplifying personal finance, stock market investing & mutual funds for young Indians.', 'vikramfinance', 310000, 540000, 0, 4.1, 5.5, 0, 220000, 30000, true),
  ('d0000001-0009-4000-8000-000000000009', 'Isha Gupta', 'isha.gupta@demo.in', 'Entertainment & Comedy', 'Stand-up comedian and sketch artist from Delhi. Creating relatable Indian family and corporate humor.', 'ishalaugh', 750000, 420000, 0, 7.2, 5.9, 0, 300000, 35000, true),
  ('d0000001-0010-4000-8000-000000000010', 'Aditya Nair', 'aditya.nair@demo.in', 'Gaming', 'Pro gamer from Kochi. BGMI, Valorant, and GTA V streams. Part of India''s top eSports community.', 'adityagamerz', 190000, 980000, 0, 3.4, 6.8, 0, 450000, 15000, false),
  ('d0000001-0011-4000-8000-000000000011', 'Divya Iyer', 'divya.iyer@demo.in', 'Fashion & Lifestyle', 'Plus-size fashion advocate from Chennai. Body positivity, ethnic wear styling, and sustainable fashion.', 'divyastyle', 220000, 95000, 0, 6.5, 4.2, 0, 70000, 8000, false),
  ('d0000001-0012-4000-8000-000000000012', 'Rahul Verma', 'rahul.verma@demo.in', 'Food & Cooking', 'Street food explorer from Lucknow. Chaat, biryani, kebabs — documenting India''s incredible food culture.', 'rahuleats', 410000, 350000, 0, 5.1, 4.9, 0, 190000, 14000, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  niche = EXCLUDED.niche,
  bio = EXCLUDED.bio,
  instagram_handle = EXCLUDED.instagram_handle,
  instagram_followers = EXCLUDED.instagram_followers,
  youtube_followers = EXCLUDED.youtube_followers,
  tiktok_followers = EXCLUDED.tiktok_followers,
  instagram_engagement = EXCLUDED.instagram_engagement,
  youtube_engagement = EXCLUDED.youtube_engagement,
  tiktok_engagement = EXCLUDED.tiktok_engagement,
  avg_views = EXCLUDED.avg_views,
  min_rate_private = EXCLUDED.min_rate_private,
  verified = EXCLUDED.verified;

-- ── Brands (6 real Indian D2C brands) ──
INSERT INTO brands (id, name, email, industry, description, website)
VALUES
  ('b0000001-0001-4000-8000-000000000001', 'boAt', 'marketing@boat.in', 'Tech & SaaS', 'India''s #1 audio & wearables brand. Stylish, affordable smart audio products built for the youth.', 'https://www.boat-lifestyle.com'),
  ('b0000001-0002-4000-8000-000000000002', 'Mamaearth', 'collab@mamaearth.in', 'Beauty & Personal Care', 'Asia''s first brand with Made Safe certified products. Natural, toxin-free skincare for Indian consumers.', 'https://www.mamaearth.in'),
  ('b0000001-0003-4000-8000-000000000003', 'Zomato', 'creators@zomato.com', 'Food & Beverages', 'India''s leading food delivery and restaurant discovery platform. Connecting foodies with their next great meal.', 'https://www.zomato.com'),
  ('b0000001-0004-4000-8000-000000000004', 'Nykaa', 'influencer@nykaa.com', 'Beauty & Personal Care', 'India''s leading beauty and fashion e-commerce platform with 5000+ brands.', 'https://www.nykaa.com'),
  ('b0000001-0005-4000-8000-000000000005', 'CRED', 'brand@cred.club', 'Finance & FinTech', 'Members-only credit card bill payment platform rewarding India''s most creditworthy. Trusted by 10M+ users.', 'https://www.cred.club'),
  ('b0000001-0006-4000-8000-000000000006', 'Lenskart', 'collab@lenskart.com', 'D2C / E-commerce', 'India''s largest eyewear brand. Premium designer frames, sunglasses, and contact lenses.', 'https://www.lenskart.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  industry = EXCLUDED.industry,
  description = EXCLUDED.description,
  website = EXCLUDED.website;

-- ── Campaigns (8 campaigns from the brands above) ──
INSERT INTO campaigns (id, brand_id, title, description, deliverable_type, budget, timeline, niche, status)
VALUES
  ('c0000001-0001-4000-8000-000000000001', 'b0000001-0001-4000-8000-000000000001', 'boAt Airdopes Launch Campaign', 'Promote our new Airdopes 191G earbuds targeting Gen Z. Create an unboxing reel showing bass quality, design, and daily use. Urban Indian lifestyle angle preferred.', 'Reel', 25000, '2 weeks', 'Tech & Gadgets', 'active'),
  ('c0000001-0002-4000-8000-000000000002', 'b0000001-0002-4000-8000-000000000002', 'Mamaearth Vitamin C Skincare', 'Create skincare routine content featuring our Vitamin C face wash, serum, and moisturizer. Show before/after glow-up results for Indian skin. Must mention toxin-free & natural ingredients.', 'Reel', 18000, '10 days', 'Beauty & Skincare', 'active'),
  ('c0000001-0003-4000-8000-000000000003', 'b0000001-0003-4000-8000-000000000003', 'Zomato Street Food Series', 'Create a 3-part series exploring iconic street food in your city via Zomato delivery. Each reel should feature ordering, unboxing, taste test, and your honest review. Tag @zomato.', 'Reel', 30000, '3 weeks', 'Food & Cooking', 'active'),
  ('c0000001-0004-4000-8000-000000000004', 'b0000001-0004-4000-8000-000000000004', 'Nykaa Wedding Season Glam', 'Create wedding guest makeup look using Nykaa products only. Traditional Indian wedding vibes — sangeet, mehendi, or reception look. Must use at least 5 Nykaa products.', 'Reel', 20000, '2 weeks', 'Beauty & Skincare', 'active'),
  ('c0000001-0005-4000-8000-000000000005', 'b0000001-0005-4000-8000-000000000005', 'CRED Money Management Tips', 'Create engaging content about smart money management for young professionals. Show how CRED helps manage credit card bills and earn rewards. Target audience: 25-35 year old Indian professionals.', 'Post', 40000, '2 weeks', 'Finance & Business', 'active'),
  ('c0000001-0006-4000-8000-000000000006', 'b0000001-0006-4000-8000-000000000006', 'Lenskart Style Your Look', 'Show how Lenskart eyewear completes different outfit looks — office, casual, party, ethnic. Use virtual try-on feature. Need fashion/lifestyle influencers with styling expertise.', 'Reel', 15000, '10 days', 'Fashion & Lifestyle', 'active'),
  ('c0000001-0007-4000-8000-000000000007', 'b0000001-0001-4000-8000-000000000001', 'boAt x Fitness Challenge', 'Create workout content featuring boAt Wave smartwatch. Track calories, heart rate, and steps during an intense workout. Show real data on screen. Fitness enthusiasts only.', 'Reel', 22000, '2 weeks', 'Fitness & Health', 'active'),
  ('c0000001-0008-4000-8000-000000000008', 'b0000001-0003-4000-8000-000000000003', 'Zomato Late Night Cravings', 'Funny/relatable content about late night food cravings solved by Zomato. Comedy angle preferred. Meme-worthy content that can go viral. Entertainment creators with comedy background.', 'Reel', 35000, '1 week', 'Entertainment & Comedy', 'active')
ON CONFLICT (id) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  deliverable_type = EXCLUDED.deliverable_type,
  budget = EXCLUDED.budget,
  timeline = EXCLUDED.timeline,
  niche = EXCLUDED.niche,
  status = EXCLUDED.status;

-- ── Collaboration Requests (8 sample requests) ──
INSERT INTO collaboration_requests (id, brand_id, creator_id, campaign_id, status, message)
VALUES
  ('r0000001-0001-4000-8000-000000000001', 'b0000001-0001-4000-8000-000000000001', 'd0000001-0002-4000-8000-000000000002', 'c0000001-0001-4000-8000-000000000001', 'accepted', 'Hi Rohan! Your tech reviews are amazing. We''d love you to do an unboxing & review of our new Airdopes 191G.'),
  ('r0000001-0002-4000-8000-000000000002', 'b0000001-0002-4000-8000-000000000002', 'd0000001-0005-4000-8000-000000000005', 'c0000001-0002-4000-8000-000000000002', 'pending', 'Hi Sneha! Your science-backed skincare content is exactly what we need. Would love to collaborate on our Vitamin C range.'),
  ('r0000001-0003-4000-8000-000000000003', 'b0000001-0003-4000-8000-000000000003', 'd0000001-0003-4000-8000-000000000003', 'c0000001-0003-4000-8000-000000000003', 'pending', 'Hi Priya! Your food content is mouth-watering. We''d love you to create a street food series with Zomato.'),
  ('r0000001-0004-4000-8000-000000000004', 'b0000001-0003-4000-8000-000000000003', 'd0000001-0012-4000-8000-000000000012', 'c0000001-0003-4000-8000-000000000003', 'accepted', 'Rahul bhai! Your street food content is legendary. Let''s create something amazing together for Zomato.'),
  ('r0000001-0005-4000-8000-000000000005', 'b0000001-0004-4000-8000-000000000004', 'd0000001-0001-4000-8000-000000000001', 'c0000001-0004-4000-8000-000000000004', 'pending', 'Hey Ananya! Your fashion styling is gorgeous. Would you like to create a wedding glam look with Nykaa products?'),
  ('r0000001-0006-4000-8000-000000000006', 'b0000001-0005-4000-8000-000000000005', 'd0000001-0008-4000-8000-000000000008', 'c0000001-0005-4000-8000-000000000005', 'rejected', 'Hi Vikram! Your finance content is top-notch. CRED would love to partner on a money management campaign.'),
  ('r0000001-0007-4000-8000-000000000007', 'b0000001-0006-4000-8000-000000000006', 'd0000001-0011-4000-8000-000000000011', 'c0000001-0006-4000-8000-000000000006', 'pending', 'Hi Divya! We love your fashion-forward approach. Would you style some Lenskart frames for different looks?'),
  ('r0000001-0008-4000-8000-000000000008', 'b0000001-0001-4000-8000-000000000001', 'd0000001-0004-4000-8000-000000000004', 'c0000001-0007-4000-8000-000000000007', 'accepted', 'Hey Arjun! Your fitness content is inspiring. We''d love you to showcase boAt Wave during workouts.')
ON CONFLICT (id) DO UPDATE SET
  brand_id = EXCLUDED.brand_id,
  creator_id = EXCLUDED.creator_id,
  campaign_id = EXCLUDED.campaign_id,
  status = EXCLUDED.status,
  message = EXCLUDED.message;
