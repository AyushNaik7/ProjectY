-- Demo Creators for InstaCollab Platform
-- 50 realistic Instagram creators with diverse niches and follower counts

INSERT INTO creators (
  id,
  username,
  name,
  email,
  niche,
  bio,
  instagram_handle,
  instagram_followers,
  instagram_engagement,
  youtube_followers,
  youtube_engagement,
  tiktok_followers,
  tiktok_engagement,
  avg_views,
  verified,
  created_at
) VALUES
-- Fashion & Lifestyle Creators (10)
('demo-creator-001', 'fashionista_priya', 'Priya Sharma', 'priya.sharma@demo.com', 'Fashion', 'Mumbai-based fashion blogger | Sustainable fashion advocate | DM for collabs', '@fashionista_priya', 250000, 4.5, 0, 0, 0, 0, 15000, true, NOW()),
('demo-creator-002', 'style_with_neha', 'Neha Kapoor', 'neha.kapoor@demo.com', 'Fashion', 'Delhi fashionista | Styling tips & outfit inspo | Collab: DM', '@style_with_neha', 180000, 5.2, 0, 0, 0, 0, 12000, true, NOW()),
('demo-creator-003', 'dapper_rahul', 'Rahul Mehta', 'rahul.mehta@demo.com', 'Fashion', 'Menswear enthusiast | Grooming & style | Brand partnerships welcome', '@dapper_rahul', 320000, 3.8, 0, 0, 0, 0, 18000, true, NOW()),
('demo-creator-004', 'chic_aisha', 'Aisha Khan', 'aisha.khan@demo.com', 'Fashion', 'Luxury fashion & lifestyle | Travel | Collaborations: DM', '@chic_aisha', 450000, 4.2, 0, 0, 0, 0, 25000, true, NOW()),
('demo-creator-005', 'minimal_wardrobe', 'Kavya Reddy', 'kavya.reddy@demo.com', 'Fashion', 'Minimalist fashion | Capsule wardrobe | Sustainable living', '@minimal_wardrobe', 95000, 6.1, 0, 0, 0, 0, 8000, false, NOW()),
('demo-creator-006', 'streetstyle_arjun', 'Arjun Singh', 'arjun.singh@demo.com', 'Fashion', 'Street style & sneaker culture | Urban fashion | Open for collabs', '@streetstyle_arjun', 210000, 4.7, 0, 0, 0, 0, 14000, true, NOW()),
('demo-creator-007', 'ethnic_elegance', 'Divya Iyer', 'divya.iyer@demo.com', 'Fashion', 'Traditional Indian wear | Saree styling | Wedding fashion', '@ethnic_elegance', 175000, 5.5, 0, 0, 0, 0, 11000, true, NOW()),
('demo-creator-008', 'fashion_forward_riya', 'Riya Gupta', 'riya.gupta@demo.com', 'Fashion', 'High street fashion | Affordable style | Collab-friendly', '@fashion_forward_riya', 140000, 5.8, 0, 0, 0, 0, 9500, false, NOW()),
('demo-creator-009', 'luxury_lifestyle_raj', 'Raj Malhotra', 'raj.malhotra@demo.com', 'Fashion', 'Luxury lifestyle | Designer fashion | Premium brands only', '@luxury_lifestyle_raj', 580000, 3.2, 0, 0, 0, 0, 32000, true, NOW()),
('demo-creator-010', 'boho_vibes_maya', 'Maya Desai', 'maya.desai@demo.com', 'Fashion', 'Boho & indie fashion | Handmade jewelry | Sustainable brands', '@boho_vibes_maya', 125000, 6.3, 0, 0, 0, 0, 8500, false, NOW()),

-- Beauty & Skincare Creators (10)
('demo-creator-011', 'glow_with_sneha', 'Sneha Patel', 'sneha.patel@demo.com', 'Beauty', 'Skincare enthusiast | Product reviews | Glowing skin tips', '@glow_with_sneha', 380000, 4.8, 0, 0, 0, 0, 22000, true, NOW()),
('demo-creator-012', 'makeup_by_pooja', 'Pooja Sharma', 'pooja.sharma@demo.com', 'Beauty', 'Makeup artist | Bridal makeup | Tutorials & tips', '@makeup_by_pooja', 290000, 5.1, 0, 0, 0, 0, 17000, true, NOW()),
('demo-creator-013', 'skincare_science', 'Dr. Anjali Verma', 'anjali.verma@demo.com', 'Beauty', 'Dermatologist | Evidence-based skincare | Product analysis', '@skincare_science', 520000, 3.9, 0, 0, 0, 0, 28000, true, NOW()),
('demo-creator-014', 'natural_beauty_nisha', 'Nisha Agarwal', 'nisha.agarwal@demo.com', 'Beauty', 'Natural & organic beauty | DIY skincare | Chemical-free living', '@natural_beauty_nisha', 165000, 5.7, 0, 0, 0, 0, 10500, false, NOW()),
('demo-creator-015', 'glam_queen_tanya', 'Tanya Khanna', 'tanya.khanna@demo.com', 'Beauty', 'Glam makeup looks | Party makeup | Collab inquiries: DM', '@glam_queen_tanya', 410000, 4.3, 0, 0, 0, 0, 24000, true, NOW()),
('demo-creator-016', 'budget_beauty_tips', 'Ritu Singh', 'ritu.singh@demo.com', 'Beauty', 'Affordable beauty | Drugstore finds | Budget-friendly tips', '@budget_beauty_tips', 220000, 6.2, 0, 0, 0, 0, 15000, true, NOW()),
('demo-creator-017', 'haircare_with_meera', 'Meera Nair', 'meera.nair@demo.com', 'Beauty', 'Hair care specialist | Natural hair growth | Product reviews', '@haircare_with_meera', 195000, 5.4, 0, 0, 0, 0, 12500, false, NOW()),
('demo-creator-018', 'korean_beauty_india', 'Sana Malik', 'sana.malik@demo.com', 'Beauty', 'K-beauty enthusiast | Korean skincare | Glass skin routine', '@korean_beauty_india', 340000, 4.6, 0, 0, 0, 0, 20000, true, NOW()),
('demo-creator-019', 'makeup_minimalist', 'Isha Joshi', 'isha.joshi@demo.com', 'Beauty', 'Minimal makeup | Natural looks | Everyday beauty', '@makeup_minimalist', 155000, 5.9, 0, 0, 0, 0, 10000, false, NOW()),
('demo-creator-020', 'beauty_decoded', 'Simran Kaur', 'simran.kaur@demo.com', 'Beauty', 'Beauty product reviews | Honest opinions | No BS beauty', '@beauty_decoded', 275000, 5.0, 0, 0, 0, 0, 16500, true, NOW()),

-- Fitness & Health Creators (10)
('demo-creator-021', 'fit_with_vikram', 'Vikram Rao', 'vikram.rao@demo.com', 'Fitness', 'Certified fitness trainer | Transformation coach | DM for programs', '@fit_with_vikram', 420000, 4.1, 0, 0, 0, 0, 23000, true, NOW()),
('demo-creator-022', 'yoga_with_priya', 'Priya Menon', 'priya.menon@demo.com', 'Fitness', 'Yoga instructor | Mindfulness | Holistic wellness', '@yoga_with_priya', 310000, 4.9, 0, 0, 0, 0, 18500, true, NOW()),
('demo-creator-023', 'gym_bro_rohan', 'Rohan Khanna', 'rohan.khanna@demo.com', 'Fitness', 'Bodybuilding | Muscle gain | Workout tips & nutrition', '@gym_bro_rohan', 385000, 3.7, 0, 0, 0, 0, 21000, true, NOW()),
('demo-creator-024', 'healthy_living_ananya', 'Ananya Bose', 'ananya.bose@demo.com', 'Fitness', 'Nutritionist | Healthy recipes | Weight loss journey', '@healthy_living_ananya', 265000, 5.3, 0, 0, 0, 0, 16000, true, NOW()),
('demo-creator-025', 'home_workouts_neha', 'Neha Deshmukh', 'neha.deshmukh@demo.com', 'Fitness', 'Home workouts | No equipment needed | Busy mom fitness', '@home_workouts_neha', 190000, 6.0, 0, 0, 0, 0, 12000, false, NOW()),
('demo-creator-026', 'running_enthusiast', 'Karan Sethi', 'karan.sethi@demo.com', 'Fitness', 'Marathon runner | Running tips | Endurance training', '@running_enthusiast', 145000, 5.6, 0, 0, 0, 0, 9500, false, NOW()),
('demo-creator-027', 'pilates_with_sara', 'Sara Ahmed', 'sara.ahmed@demo.com', 'Fitness', 'Pilates instructor | Core strength | Flexibility training', '@pilates_with_sara', 175000, 5.2, 0, 0, 0, 0, 11000, true, NOW()),
('demo-creator-028', 'vegan_athlete', 'Arjun Nambiar', 'arjun.nambiar@demo.com', 'Fitness', 'Plant-based athlete | Vegan nutrition | Sustainable fitness', '@vegan_athlete', 230000, 4.8, 0, 0, 0, 0, 14500, true, NOW()),
('demo-creator-029', 'dance_fitness_riya', 'Riya Chatterjee', 'riya.chatterjee@demo.com', 'Fitness', 'Zumba instructor | Dance fitness | Fun workouts', '@dance_fitness_riya', 205000, 5.7, 0, 0, 0, 0, 13000, false, NOW()),
('demo-creator-030', 'strength_training_pro', 'Aditya Kumar', 'aditya.kumar@demo.com', 'Fitness', 'Strength & conditioning coach | Powerlifting | Athletic performance', '@strength_training_pro', 295000, 4.4, 0, 0, 0, 0, 17500, true, NOW()),

-- Food & Travel Creators (10)
('demo-creator-031', 'foodie_diaries_mumbai', 'Tanvi Shah', 'tanvi.shah@demo.com', 'Food', 'Mumbai food blogger | Restaurant reviews | Street food lover', '@foodie_diaries_mumbai', 360000, 4.7, 0, 0, 0, 0, 21000, true, NOW()),
('demo-creator-032', 'travel_with_kabir', 'Kabir Malhotra', 'kabir.malhotra@demo.com', 'Travel', 'Travel photographer | Adventure seeker | 50+ countries', '@travel_with_kabir', 480000, 3.8, 0, 0, 0, 0, 26000, true, NOW()),
('demo-creator-033', 'home_chef_recipes', 'Lakshmi Iyer', 'lakshmi.iyer@demo.com', 'Food', 'Home chef | Traditional recipes | South Indian cuisine', '@home_chef_recipes', 215000, 5.5, 0, 0, 0, 0, 14000, true, NOW()),
('demo-creator-034', 'backpacker_india', 'Rohan Verma', 'rohan.verma@demo.com', 'Travel', 'Budget travel | Backpacking India | Travel hacks', '@backpacker_india', 325000, 4.5, 0, 0, 0, 0, 19000, true, NOW()),
('demo-creator-035', 'baking_with_love', 'Naina Kapoor', 'naina.kapoor@demo.com', 'Food', 'Baker | Dessert recipes | Cake decorating', '@baking_with_love', 185000, 6.1, 0, 0, 0, 0, 12500, false, NOW()),
('demo-creator-036', 'luxury_travel_diaries', 'Siddharth Oberoi', 'siddharth.oberoi@demo.com', 'Travel', 'Luxury travel | 5-star experiences | Premium destinations', '@luxury_travel_diaries', 550000, 3.4, 0, 0, 0, 0, 30000, true, NOW()),
('demo-creator-037', 'cafe_hopping_delhi', 'Aarti Gupta', 'aarti.gupta@demo.com', 'Food', 'Cafe reviews | Coffee lover | Aesthetic food photography', '@cafe_hopping_delhi', 240000, 5.0, 0, 0, 0, 0, 15500, true, NOW()),
('demo-creator-038', 'solo_female_traveler', 'Meera Reddy', 'meera.reddy@demo.com', 'Travel', 'Solo female traveler | Safety tips | Empowering women to travel', '@solo_female_traveler', 395000, 4.3, 0, 0, 0, 0, 22500, true, NOW()),
('demo-creator-039', 'healthy_recipes_daily', 'Pooja Nair', 'pooja.nair@demo.com', 'Food', 'Healthy recipes | Meal prep | Nutrition tips', '@healthy_recipes_daily', 270000, 5.4, 0, 0, 0, 0, 16500, true, NOW()),
('demo-creator-040', 'mountain_wanderer', 'Aakash Thakur', 'aakash.thakur@demo.com', 'Travel', 'Mountain trekking | Himalayan adventures | Nature photography', '@mountain_wanderer', 285000, 4.6, 0, 0, 0, 0, 17000, true, NOW()),

-- Tech & Lifestyle Creators (10)
('demo-creator-041', 'tech_reviewer_india', 'Varun Sharma', 'varun.sharma@demo.com', 'Tech', 'Tech reviewer | Gadget unboxing | Honest reviews', '@tech_reviewer_india', 620000, 3.5, 0, 0, 0, 0, 35000, true, NOW()),
('demo-creator-042', 'lifestyle_with_riya', 'Riya Malhotra', 'riya.malhotra@demo.com', 'Lifestyle', 'Lifestyle blogger | Daily vlogs | Mom life', '@lifestyle_with_riya', 340000, 4.4, 0, 0, 0, 0, 20000, true, NOW()),
('demo-creator-043', 'gaming_guru_india', 'Harsh Patel', 'harsh.patel@demo.com', 'Gaming', 'Mobile gaming | BGMI | Free Fire | Gaming tips', '@gaming_guru_india', 450000, 4.0, 0, 0, 0, 0, 25000, true, NOW()),
('demo-creator-044', 'productivity_hacks', 'Shreya Joshi', 'shreya.joshi@demo.com', 'Lifestyle', 'Productivity tips | Time management | Student life', '@productivity_hacks', 195000, 5.8, 0, 0, 0, 0, 12500, false, NOW()),
('demo-creator-045', 'photography_basics', 'Aryan Khanna', 'aryan.khanna@demo.com', 'Tech', 'Photography tutorials | Camera gear | Editing tips', '@photography_basics', 310000, 4.2, 0, 0, 0, 0, 18500, true, NOW()),
('demo-creator-046', 'sustainable_living', 'Kavita Menon', 'kavita.menon@demo.com', 'Lifestyle', 'Zero waste living | Eco-friendly products | Sustainable lifestyle', '@sustainable_living', 225000, 5.6, 0, 0, 0, 0, 14500, true, NOW()),
('demo-creator-047', 'finance_simplified', 'Rahul Agarwal', 'rahul.agarwal@demo.com', 'Finance', 'Personal finance | Investment tips | Money management', '@finance_simplified', 380000, 4.1, 0, 0, 0, 0, 21500, true, NOW()),
('demo-creator-048', 'home_decor_ideas', 'Anjali Desai', 'anjali.desai@demo.com', 'Lifestyle', 'Home decor | Interior design | DIY projects', '@home_decor_ideas', 265000, 5.1, 0, 0, 0, 0, 16000, true, NOW()),
('demo-creator-049', 'book_lover_india', 'Ishaan Kapoor', 'ishaan.kapoor@demo.com', 'Lifestyle', 'Book reviews | Reading recommendations | Literary discussions', '@book_lover_india', 145000, 6.4, 0, 0, 0, 0, 9500, false, NOW()),
('demo-creator-050', 'pet_parent_diaries', 'Nidhi Sharma', 'nidhi.sharma@demo.com', 'Lifestyle', 'Pet care tips | Dog training | Pet product reviews', '@pet_parent_diaries', 280000, 5.3, 0, 0, 0, 0, 17000, true, NOW());
