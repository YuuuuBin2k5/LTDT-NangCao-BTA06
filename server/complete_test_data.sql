-- ============================================================================
-- COMPLETE TEST DATA FOR FRIEND LOCATION MAP FEATURE
-- ============================================================================
-- This file contains comprehensive test data for testing:
-- 1. Users with various profiles
-- 2. Friendships between users
-- 3. Posts with locations (TP.HCM area)
-- 4. Friend locations (current positions)
-- 5. Avatar frames
-- 6. Friend interactions
-- ============================================================================

-- Enable PostGIS extension (REQUIRED!)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- ============================================================================
-- STEP 1: CLEAN UP EXISTING DATA (Optional - comment out if you want to keep existing data)
-- ============================================================================
TRUNCATE TABLE friend_interactions CASCADE;
TRUNCATE TABLE user_locations CASCADE;
TRUNCATE TABLE user_avatar_frames CASCADE;
TRUNCATE TABLE avatar_frames CASCADE;
TRUNCATE TABLE post_comments CASCADE;
TRUNCATE TABLE post_likes CASCADE;
TRUNCATE TABLE post_images CASCADE;
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE friendships CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE avatar_frames_id_seq RESTART WITH 1;

-- ============================================================================
-- STEP 2: CREATE TEST USERS
-- ============================================================================
-- Password for all users: "password123" (BCrypt encoded)
-- Location: TP.HCM area (around District 1)

INSERT INTO users (id, email, password, nick_name, phone, bio, avatar_url, profile_visibility, created_at, updated_at) VALUES
-- Main test user (YOU)
(gen_random_uuid(), 'testuser@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test User', '0901234567', 'Main test account', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser', 'PUBLIC', NOW(), NOW()),

-- Friend 1: Minh (Online, close by)
(gen_random_uuid(), 'minh@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Minh Nguyen', '0901234568', 'Coffee lover ☕', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh', 'PUBLIC', NOW(), NOW()),

-- Friend 2: Lan (Online, nearby)
(gen_random_uuid(), 'lan@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lan Tran', '0901234569', 'Travel enthusiast 🌍', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan', 'PUBLIC', NOW(), NOW()),

-- Friend 3: Hung (Online, bit far)
(gen_random_uuid(), 'hung@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hung Le', '0901234570', 'Tech geek 💻', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hung', 'PUBLIC', NOW(), NOW()),

-- Friend 4: Hoa (Offline)
(gen_random_uuid(), 'hoa@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hoa Pham', '0901234571', 'Foodie 🍜', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoa', 'PUBLIC', NOW(), NOW()),

-- Friend 5: Tuan (Online, close friend)
(gen_random_uuid(), 'tuan@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tuan Vo', '0901234572', 'Gym rat 💪', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan', 'PUBLIC', NOW(), NOW()),

-- Friend 6: Linh (Online, with status)
(gen_random_uuid(), 'linh@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Linh Nguyen', '0901234573', 'Artist 🎨', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linh', 'PUBLIC', NOW(), NOW()),

-- Non-friend user (for testing)
(gen_random_uuid(), 'stranger@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Stranger', '0901234574', 'Random user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stranger', 'PUBLIC', NOW(), NOW());

-- ============================================================================
-- STEP 3: CREATE FRIENDSHIPS
-- ============================================================================
-- All users are friends with testuser@mapic.com

INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
SELECT 
    (SELECT id FROM users WHERE email = 'testuser@mapic.com'),
    u.id,
    'ACCEPTED',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
FROM users u
WHERE u.email IN ('minh@mapic.com', 'lan@mapic.com', 'hung@mapic.com', 'hoa@mapic.com', 'tuan@mapic.com', 'linh@mapic.com');

-- Reverse friendships (bidirectional)
INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
SELECT 
    u.id,
    (SELECT id FROM users WHERE email = 'testuser@mapic.com'),
    'ACCEPTED',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
FROM users u
WHERE u.email IN ('minh@mapic.com', 'lan@mapic.com', 'hung@mapic.com', 'hoa@mapic.com', 'tuan@mapic.com', 'linh@mapic.com');

-- Some friendships between other users
INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at) VALUES
((SELECT id FROM users WHERE email = 'minh@mapic.com'), (SELECT id FROM users WHERE email = 'lan@mapic.com'), 'ACCEPTED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), (SELECT id FROM users WHERE email = 'minh@mapic.com'), 'ACCEPTED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
((SELECT id FROM users WHERE email = 'hung@mapic.com'), (SELECT id FROM users WHERE email = 'tuan@mapic.com'), 'ACCEPTED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
((SELECT id FROM users WHERE email = 'tuan@mapic.com'), (SELECT id FROM users WHERE email = 'hung@mapic.com'), 'ACCEPTED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

-- ============================================================================
-- STEP 4: CREATE POSTS WITH LOCATIONS (TP.HCM Area)
-- ============================================================================
-- Posts around District 1, TP.HCM (latitude: ~10.77-10.85, longitude: ~106.69-106.80)

INSERT INTO posts (user_id, content, latitude, longitude, visibility, created_at, updated_at) VALUES
-- Posts by testuser
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'Beautiful morning at Nguyen Hue Walking Street! 🌅 #saigon #morning', 10.7743, 106.7011, 'PUBLIC', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'Coffee time at The Workshop ☕ Best coffee in town!', 10.7829, 106.6989, 'PUBLIC', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'Lunch at Ben Thanh Market 🍜 So many delicious options!', 10.7726, 106.6980, 'PUBLIC', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Posts by Minh
((SELECT id FROM users WHERE email = 'minh@mapic.com'), 'Working from Starbucks Reserve today 💻 #remotework', 10.7797, 106.6991, 'PUBLIC', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
((SELECT id FROM users WHERE email = 'minh@mapic.com'), 'Sunset at Saigon River 🌇 Amazing view!', 10.7722, 106.7044, 'PUBLIC', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Posts by Lan
((SELECT id FROM users WHERE email = 'lan@mapic.com'), 'Shopping at Vincom Center 🛍️ #shopping #fashion', 10.7768, 106.7009, 'PUBLIC', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), 'Dinner at Bitexco Tower 🍽️ The view is incredible!', 10.7718, 106.7038, 'PUBLIC', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Posts by Hung
((SELECT id FROM users WHERE email = 'hung@mapic.com'), 'Tech meetup at Dreamplex 🚀 #startup #tech', 10.7875, 106.6988, 'PUBLIC', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
((SELECT id FROM users WHERE email = 'hung@mapic.com'), 'Late night coding session 👨‍💻 #developer #coding', 10.7823, 106.6995, 'PUBLIC', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),

-- Posts by Hoa
((SELECT id FROM users WHERE email = 'hoa@mapic.com'), 'Pho for breakfast! 🍲 Nothing beats Vietnamese pho', 10.7689, 106.6912, 'PUBLIC', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),
((SELECT id FROM users WHERE email = 'hoa@mapic.com'), 'Trying new restaurant at Bui Vien Street 🍜', 10.7676, 106.6923, 'PUBLIC', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Posts by Tuan
((SELECT id FROM users WHERE email = 'tuan@mapic.com'), 'Morning workout at Tao Dan Park 💪 #fitness #health', 10.7789, 106.6934, 'PUBLIC', NOW() - INTERVAL '7 hours', NOW() - INTERVAL '7 hours'),
((SELECT id FROM users WHERE email = 'tuan@mapic.com'), 'Protein shake time! 🥤 #gym #nutrition', 10.7812, 106.6956, 'PUBLIC', NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours'),

-- Posts by Linh
((SELECT id FROM users WHERE email = 'linh@mapic.com'), 'Art exhibition at HCMC Fine Arts Museum 🎨 #art #culture', 10.7698, 106.7001, 'PUBLIC', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
((SELECT id FROM users WHERE email = 'linh@mapic.com'), 'Sketching at Notre Dame Cathedral ✏️ #drawing', 10.7798, 106.6990, 'PUBLIC', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- More posts for variety
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'Evening walk at Le Loi Boulevard 🚶 #evening #walk', 10.7756, 106.7023, 'PUBLIC', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
((SELECT id FROM users WHERE email = 'minh@mapic.com'), 'Book shopping at Fahasa 📚 #books #reading', 10.7734, 106.7012, 'PUBLIC', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), 'Spa day! 💆‍♀️ #selfcare #relaxation', 10.7801, 106.6978, 'PUBLIC', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- ============================================================================
-- STEP 5: CREATE FRIEND LOCATIONS (Current Positions)
-- ============================================================================
-- Using PostGIS geography type for accurate distance calculations

-- Test User (YOU) - at Nguyen Hue Walking Street
INSERT INTO user_locations (user_id, latitude, longitude, location, accuracy, speed, heading, timestamp, is_current, privacy_mode, created_at)
VALUES (
    (SELECT id FROM users WHERE email = 'testuser@mapic.com'),
    10.7743,
    106.7011,
    ST_GeogFromText('POINT(106.7011 10.7743)'),
    10.0,
    0.0,
    0.0,
    NOW(),
    true,
    'ALL_FRIENDS',
    NOW()
);

-- Minh - at The Coffee House (500m away)
INSERT INTO user_locations (user_id, latitude, longitude, location, accuracy, speed, heading, timestamp, is_current, privacy_mode, status_message, status_emoji, created_at)
VALUES (
    (SELECT id FROM users WHERE email = 'minh@mapic.com'),
    10.7789,
    106.7001,
    ST_GeogFromText('POINT(106.7001 10.7789)'),
    12.0,
    0.0,
    0.0,
    NOW() - INTERVAL '2 minutes',
    true,
    'ALL_FRIENDS',
    'Working from cafe',
    '☕',
    NOW() - INTERVAL '2 minutes'
);

-- Lan - at Vincom Center (300m away)
INSERT INTO user_locations (user_id, latitude, longitude, location, accuracy, speed, heading, timestamp, is_current, privacy_mode, status_message, status_emoji, created_at)
VALUES (
    (SELECT id FROM users WHERE email = 'lan@mapic.com'),
    10.7768,
    106.7009,
    ST_GeogFromText('POINT(106.7009 10.7768)'),
    8.0,
    0.0,
    0.0,
    NOW() - INTERVAL '5 minutes',
    true,
    'ALL_FRIENDS',
    'Shopping time',
    '🛍️',
    NOW() - INTERVAL '5 minutes'
);

-- Hung - at District 3 (2km away)
INSERT INTO user_locations (user_id, latitude, longitude, location, accuracy, speed, heading, timestamp, is_current, privacy_mode, created_at)
VALUES (
    (SELECT id FROM users WHERE email = 'hung@mapic.com'),
    10.7875,
    106.6988,
    ST_GeogFromText('POINT(106.6988 10.7875)'),
    15.0,
    0.0,
    0.0,
    NOW() - INTERVAL '10 minutes',
    true,
    'ALL_FRIENDS',
    NOW() - INTERVAL '10 minutes'
);

-- Hoa - last seen 2 hours ago (offline)
INSERT INTO user_locations (user_id, latitude, longitude, location, accuracy, speed, heading, timestamp, is_current, privacy_mode, created_at)
VALUES (
    (SELECT id FROM users WHERE email = 'hoa@mapic.com'),
    10.7689,
    106.6912,
    ST_GeogFromText('POINT(106.6912 10.7689)'),
    20.0,
    0.0,
    0.0,
    NOW() - INTERVAL '2 hours',
    true,
    'ALL_FRIENDS',
    NOW() - INTERVAL '2 hours'
);

-- Tuan - at gym (1km away, close friend)
INSERT INTO user_locations (user_id, latitude, longitude, location, accuracy, speed, heading, timestamp, is_current, privacy_mode, status_message, status_emoji, created_at)
VALUES (
    (SELECT id FROM users WHERE email = 'tuan@mapic.com'),
    10.7789,
    106.6934,
    ST_GeogFromText('POINT(106.6934 10.7789)'),
    10.0,
    0.0,
    0.0,
    NOW() - INTERVAL '1 minute',
    true,
    'CLOSE_FRIENDS',
    'At the gym',
    '💪',
    NOW() - INTERVAL '1 minute'
);

-- Linh - at art museum (very close, 200m)
INSERT INTO user_locations (user_id, latitude, longitude, location, accuracy, speed, heading, timestamp, is_current, privacy_mode, status_message, status_emoji, created_at)
VALUES (
    (SELECT id FROM users WHERE email = 'linh@mapic.com'),
    10.7698,
    106.7001,
    ST_GeogFromText('POINT(106.7001 10.7698)'),
    8.0,
    0.0,
    0.0,
    NOW() - INTERVAL '3 minutes',
    true,
    'ALL_FRIENDS',
    'At art museum',
    '🎨',
    NOW() - INTERVAL '3 minutes'
);

-- ============================================================================
-- STEP 6: CREATE AVATAR FRAMES
-- ============================================================================

INSERT INTO avatar_frames (name, svg_path, unlock_condition, is_premium, created_at) VALUES
('Default', '/frames/default.svg', 'Available by default', false, NOW()),
('Gold Star', '/frames/gold-star.svg', 'Send 10 interactions', false, NOW()),
('Heart', '/frames/heart.svg', 'Send 5 heart interactions', false, NOW()),
('Fire', '/frames/fire.svg', 'Be online for 7 consecutive days', false, NOW()),
('Diamond', '/frames/diamond.svg', 'Premium frame', true, NOW()),
('Rainbow', '/frames/rainbow.svg', 'Premium frame', true, NOW()),
('Crown', '/frames/crown.svg', 'Send 50 interactions', false, NOW()),
('Lightning', '/frames/lightning.svg', 'Be within 100m of 5 different friends', false, NOW());

-- Assign default frame to all users
INSERT INTO user_avatar_frames (user_id, frame_id, is_selected, unlocked_at)
SELECT 
    u.id,
    (SELECT id FROM avatar_frames WHERE name = 'Default'),
    true,
    NOW()
FROM users u;

-- Unlock some frames for test user
INSERT INTO user_avatar_frames (user_id, frame_id, is_selected, unlocked_at)
SELECT 
    (SELECT id FROM users WHERE email = 'testuser@mapic.com'),
    af.id,
    false,
    NOW() - INTERVAL '5 days'
FROM avatar_frames af
WHERE af.name IN ('Gold Star', 'Heart', 'Fire');

-- Unlock frames for Minh
INSERT INTO user_avatar_frames (user_id, frame_id, is_selected, unlocked_at)
VALUES (
    (SELECT id FROM users WHERE email = 'minh@mapic.com'),
    (SELECT id FROM avatar_frames WHERE name = 'Gold Star'),
    false,
    NOW() - INTERVAL '10 days'
);

-- ============================================================================
-- STEP 7: CREATE FRIEND INTERACTIONS
-- ============================================================================

INSERT INTO friend_interactions (sender_id, receiver_id, interaction_type, created_at) VALUES
-- Recent interactions
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'minh@mapic.com'), 'WAVE', NOW() - INTERVAL '30 minutes'),
((SELECT id FROM users WHERE email = 'minh@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'HEART', NOW() - INTERVAL '25 minutes'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'lan@mapic.com'), 'HEART', NOW() - INTERVAL '1 hour'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'WAVE', NOW() - INTERVAL '50 minutes'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'tuan@mapic.com'), 'POKE', NOW() - INTERVAL '2 hours'),
((SELECT id FROM users WHERE email = 'tuan@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'THUMBS_UP', NOW() - INTERVAL '1 hour 30 minutes'),

-- Older interactions
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'hung@mapic.com'), 'WAVE', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE email = 'hung@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'HEART', NOW() - INTERVAL '23 hours'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'linh@mapic.com'), 'HEART', NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE email = 'linh@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'WAVE', NOW() - INTERVAL '1 day 12 hours'),

-- Interactions between other users
((SELECT id FROM users WHERE email = 'minh@mapic.com'), (SELECT id FROM users WHERE email = 'lan@mapic.com'), 'WAVE', NOW() - INTERVAL '3 hours'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), (SELECT id FROM users WHERE email = 'minh@mapic.com'), 'HEART', NOW() - INTERVAL '2 hours 30 minutes'),
((SELECT id FROM users WHERE email = 'hung@mapic.com'), (SELECT id FROM users WHERE email = 'tuan@mapic.com'), 'THUMBS_UP', NOW() - INTERVAL '5 hours'),
((SELECT id FROM users WHERE email = 'tuan@mapic.com'), (SELECT id FROM users WHERE email = 'hung@mapic.com'), 'POKE', NOW() - INTERVAL '4 hours');

-- ============================================================================
-- STEP 8: ADD POST LIKES AND COMMENTS
-- ============================================================================

-- Likes on posts
INSERT INTO post_likes (post_id, user_id, created_at)
SELECT 
    p.id,
    (SELECT id FROM users WHERE email = 'minh@mapic.com'),
    NOW() - INTERVAL '1 hour'
FROM posts p
WHERE p.user_id = (SELECT id FROM users WHERE email = 'testuser@mapic.com')
LIMIT 2;

INSERT INTO post_likes (post_id, user_id, created_at)
SELECT 
    p.id,
    (SELECT id FROM users WHERE email = 'lan@mapic.com'),
    NOW() - INTERVAL '2 hours'
FROM posts p
WHERE p.user_id = (SELECT id FROM users WHERE email = 'testuser@mapic.com')
LIMIT 1;

-- Comments on posts
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at)
SELECT 
    p.id,
    (SELECT id FROM users WHERE email = 'minh@mapic.com'),
    'Looks amazing! 😍',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
FROM posts p
WHERE p.content LIKE '%Nguyen Hue%'
LIMIT 1;

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at)
SELECT 
    p.id,
    (SELECT id FROM users WHERE email = 'lan@mapic.com'),
    'I want to go there too! 🙌',
    NOW() - INTERVAL '45 minutes',
    NOW() - INTERVAL '45 minutes'
FROM posts p
WHERE p.content LIKE '%Coffee%'
LIMIT 1;

INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at)
SELECT 
    p.id,
    (SELECT id FROM users WHERE email = 'tuan@mapic.com'),
    'Nice spot! 👍',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
FROM posts p
WHERE p.content LIKE '%Ben Thanh%'
LIMIT 1;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check users
SELECT 'Users created:' as info, COUNT(*) as count FROM users;

-- Check friendships
SELECT 'Friendships created:' as info, COUNT(*) as count FROM friendships;

-- Check posts
SELECT 'Posts created:' as info, COUNT(*) as count FROM posts;

-- Check friend locations
SELECT 'Friend locations created:' as info, COUNT(*) as count FROM user_locations;

-- Check avatar frames
SELECT 'Avatar frames created:' as info, COUNT(*) as count FROM avatar_frames;

-- Check interactions
SELECT 'Friend interactions created:' as info, COUNT(*) as count FROM friend_interactions;

-- Show online friends with their locations
SELECT 
    u.nick_name,
    ul.latitude,
    ul.longitude,
    ul.status_message,
    ul.status_emoji,
    ul.privacy_mode,
    EXTRACT(EPOCH FROM (NOW() - ul.timestamp))/60 as minutes_ago
FROM user_locations ul
JOIN users u ON ul.user_id = u.id
WHERE ul.is_current = true
  AND ul.timestamp > NOW() - INTERVAL '15 minutes'
ORDER BY ul.timestamp DESC;

-- Show posts near test user location (within 2km)
SELECT 
    u.nick_name,
    p.content,
    p.latitude,
    p.longitude,
    ST_Distance(
        ST_GeogFromText('POINT(106.7011 10.7743)'),
        ST_GeogFromText('POINT(' || p.longitude || ' ' || p.latitude || ')')
    ) as distance_meters
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE ST_DWithin(
    ST_GeogFromText('POINT(106.7011 10.7743)'),
    ST_GeogFromText('POINT(' || p.longitude || ' ' || p.latitude || ')'),
    2000
)
ORDER BY distance_meters;

-- ============================================================================
-- DONE!
-- ============================================================================
-- Test data has been created successfully!
-- 
-- Test Accounts:
-- - testuser@mapic.com / password123 (Main test user - YOU)
-- - minh@mapic.com / password123 (Friend, online, 500m away)
-- - lan@mapic.com / password123 (Friend, online, 300m away)
-- - hung@mapic.com / password123 (Friend, online, 2km away)
-- - hoa@mapic.com / password123 (Friend, offline)
-- - tuan@mapic.com / password123 (Friend, online, close friend)
-- - linh@mapic.com / password123 (Friend, online, 200m away)
-- 
-- All locations are around District 1, TP.HCM
-- Center point: 10.7743, 106.7011 (Nguyen Hue Walking Street)
-- ============================================================================
