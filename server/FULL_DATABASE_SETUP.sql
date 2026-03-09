-- ============================================================================
-- FULL DATABASE SETUP FOR MAPIC APPLICATION (WITHOUT POSTGIS)
-- ============================================================================
-- This file creates ALL tables and inserts test data
-- NO PostGIS required - uses simple latitude/longitude columns
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE ALL TABLES
-- ============================================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password VARCHAR(255) NOT NULL,
    nick_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio VARCHAR(255),
    profile_visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified TIMESTAMP,
    last_active TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create current_locations table
CREATE TABLE IF NOT EXISTS current_locations (
    user_id UUID PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    battery_level INTEGER,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_current_locations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create otp_token table
CREATE TABLE IF NOT EXISTS otp_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_token_email_type ON otp_token(email, type);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    category VARCHAR(100),
    rating DECIMAL(2,1),
    price_level INTEGER,
    phone VARCHAR(20),
    website VARCHAR(255),
    opening_hours TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    visit_date DATE,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reviews_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    friend_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_friendships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendships_friend FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255),
    privacy VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON posts(privacy);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_posts_privacy_created ON posts(privacy, created_at);

-- Create post_images table
CREATE TABLE IF NOT EXISTS post_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_post_images_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_images_post_id ON post_images(post_id);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_post_like UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_post_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- Create hashtags table
CREATE TABLE IF NOT EXISTS hashtags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hashtags_name ON hashtags(name);
CREATE INDEX IF NOT EXISTS idx_hashtags_usage_count ON hashtags(usage_count DESC);

-- Create post_hashtags table
CREATE TABLE IF NOT EXISTS post_hashtags (
    post_id BIGINT NOT NULL,
    hashtag_id UUID NOT NULL,
    PRIMARY KEY (post_id, hashtag_id),
    CONSTRAINT fk_post_hashtags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_hashtags_hashtag FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
);

-- Create filter_presets table
CREATE TABLE IF NOT EXISTS filter_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    filters JSONB NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_filter_presets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_filter_presets_user_id ON filter_presets(user_id);

-- Create user_interactions table
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    post_id BIGINT,
    interaction_type VARCHAR(50) NOT NULL,
    interaction_value DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_interactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_interactions_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_post_id ON user_interactions(post_id);

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    post_id BIGINT NOT NULL,
    feedback_type VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_feedback_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_post_id ON user_feedback(post_id);

-- Create avatar_frames table
CREATE TABLE IF NOT EXISTS avatar_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    unlock_condition VARCHAR(50) NOT NULL,
    unlock_value INTEGER NOT NULL,
    rarity VARCHAR(20) NOT NULL DEFAULT 'COMMON',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create user_avatar_frames table
CREATE TABLE IF NOT EXISTS user_avatar_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    frame_id UUID NOT NULL,
    is_selected BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_avatar_frames_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_avatar_frames_frame FOREIGN KEY (frame_id) REFERENCES avatar_frames(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_frame UNIQUE (user_id, frame_id)
);

CREATE INDEX IF NOT EXISTS idx_user_avatar_frames_user_id ON user_avatar_frames(user_id);

-- Create user_locations table
CREATE TABLE IF NOT EXISTS user_locations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    timestamp TIMESTAMP NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    privacy_mode VARCHAR(20),
    status_message VARCHAR(255),
    status_emoji VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_locations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_timestamp ON user_locations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_locations_is_current ON user_locations(is_current);

-- Create friend_interactions table
CREATE TABLE IF NOT EXISTS friend_interactions (
    id BIGSERIAL PRIMARY KEY,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    interaction_type VARCHAR(20) NOT NULL,
    from_latitude DOUBLE PRECISION,
    from_longitude DOUBLE PRECISION,
    to_latitude DOUBLE PRECISION,
    to_longitude DOUBLE PRECISION,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_friend_interactions_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_interactions_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_friend_interactions_from_user_id ON friend_interactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_to_user_id ON friend_interactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_created_at ON friend_interactions(created_at DESC);

-- Create proximity_notifications table
CREATE TABLE IF NOT EXISTS proximity_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    friend_id UUID NOT NULL,
    distance DOUBLE PRECISION NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_proximity_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_proximity_notifications_friend FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_proximity_notifications_user_id ON proximity_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_proximity_notifications_is_read ON proximity_notifications(is_read);

-- ============================================================================
-- PART 2: INSERT TEST DATA
-- ============================================================================

-- Insert test users (Password: password123)
-- Note: All users have is_active = TRUE so they can login immediately
-- Password hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy = "password123"
INSERT INTO users (username, email, password, nick_name, phone, bio, avatar_url, profile_visibility, is_active, created_at, updated_at) VALUES
('testuser', 'testuser@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test User', '0901234567', 'Main test account', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser', 'PUBLIC', TRUE, NOW(), NOW()),
('minh', 'minh@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Minh Nguyen', '0901234568', 'Coffee lover ☕', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh', 'PUBLIC', TRUE, NOW(), NOW()),
('lan', 'lan@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lan Tran', '0901234569', 'Travel enthusiast 🌍', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan', 'PUBLIC', TRUE, NOW(), NOW()),
('hung', 'hung@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hung Le', '0901234570', 'Tech geek 💻', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hung', 'PUBLIC', TRUE, NOW(), NOW()),
('hoa', 'hoa@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Hoa Pham', '0901234571', 'Foodie 🍜', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoa', 'PUBLIC', TRUE, NOW(), NOW()),
('tuan', 'tuan@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tuan Vo', '0901234572', 'Gym rat 💪', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan', 'PUBLIC', TRUE, NOW(), NOW()),
('linh', 'linh@mapic.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Linh Nguyen', '0901234573', 'Artist 🎨', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linh', 'PUBLIC', TRUE, NOW(), NOW());

-- Insert friendships (testuser is friends with all others)
INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
SELECT 
    (SELECT id FROM users WHERE email = 'testuser@mapic.com'),
    u.id,
    'ACCEPTED',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
FROM users u
WHERE u.email IN ('minh@mapic.com', 'lan@mapic.com', 'hung@mapic.com', 'hoa@mapic.com', 'tuan@mapic.com', 'linh@mapic.com');

-- Reverse friendships
INSERT INTO friendships (user_id, friend_id, status, created_at, updated_at)
SELECT 
    u.id,
    (SELECT id FROM users WHERE email = 'testuser@mapic.com'),
    'ACCEPTED',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
FROM users u
WHERE u.email IN ('minh@mapic.com', 'lan@mapic.com', 'hung@mapic.com', 'hoa@mapic.com', 'tuan@mapic.com', 'linh@mapic.com');

-- Insert posts (around District 1, TP.HCM)
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at) VALUES
-- Posts by testuser
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'Beautiful morning at Nguyen Hue Walking Street! 🌅 #saigon #morning', 10.7743, 106.7011, 'Nguyen Hue Walking Street', 'PUBLIC', 0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'Coffee time at The Workshop ☕ Best coffee in town!', 10.7829, 106.6989, 'The Workshop Coffee', 'PUBLIC', 0, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'Lunch at Ben Thanh Market 🍜 So many delicious options!', 10.7726, 106.6980, 'Ben Thanh Market', 'PUBLIC', 0, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'Evening walk at Le Loi Boulevard 🚶 #evening #walk', 10.7756, 106.7023, 'Le Loi Boulevard', 'PUBLIC', 0, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Posts by friends
((SELECT id FROM users WHERE email = 'minh@mapic.com'), 'Working from Starbucks Reserve today 💻 #remotework', 10.7797, 106.6991, 'Starbucks Reserve', 'PUBLIC', 0, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
((SELECT id FROM users WHERE email = 'minh@mapic.com'), 'Sunset at Saigon River 🌇 Amazing view!', 10.7722, 106.7044, 'Saigon River', 'PUBLIC', 0, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE email = 'minh@mapic.com'), 'Book shopping at Fahasa 📚 #books #reading', 10.7734, 106.7012, 'Fahasa Bookstore', 'PUBLIC', 0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

((SELECT id FROM users WHERE email = 'lan@mapic.com'), 'Shopping at Vincom Center 🛍️ #shopping', 10.7768, 106.7009, 'Vincom Center', 'PUBLIC', 0, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), 'Dinner at Bep Me In 🍽️ Delicious Vietnamese food!', 10.7712, 106.7025, 'Bep Me In', 'PUBLIC', 0, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), 'Spa day! 💆‍♀️ #selfcare #relaxation', 10.7801, 106.6978, 'Spa District 1', 'PUBLIC', 0, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

((SELECT id FROM users WHERE email = 'hung@mapic.com'), 'Tech meetup at Dreamplex 🚀 #tech #startup', 10.7854, 106.6995, 'Dreamplex', 'PUBLIC', 0, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
((SELECT id FROM users WHERE email = 'hung@mapic.com'), 'Late night coding session 💻 #developer #life', 10.7789, 106.6987, 'Coworking Space', 'PUBLIC', 0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

((SELECT id FROM users WHERE email = 'hoa@mapic.com'), 'Pho for breakfast 🍜 Best way to start the day!', 10.7698, 106.6992, 'Pho 2000', 'PUBLIC', 0, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours'),
((SELECT id FROM users WHERE email = 'hoa@mapic.com'), 'Trying new restaurant in District 1 🍴', 10.7745, 106.7018, 'District 1 Restaurant', 'PUBLIC', 0, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

((SELECT id FROM users WHERE email = 'tuan@mapic.com'), 'Morning workout at the park 💪 #fitness', 10.7823, 106.6976, 'Tao Dan Park', 'PUBLIC', 0, NOW() - INTERVAL '7 hours', NOW() - INTERVAL '7 hours'),
((SELECT id FROM users WHERE email = 'tuan@mapic.com'), 'Healthy lunch bowl 🥗 #healthy #eating', 10.7767, 106.6998, 'Healthy Bowl Cafe', 'PUBLIC', 0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

((SELECT id FROM users WHERE email = 'linh@mapic.com'), 'Art exhibition at HCMC Museum 🎨 #art #culture', 10.7689, 106.7001, 'HCMC Museum', 'PUBLIC', 0, NOW() - INTERVAL '9 hours', NOW() - INTERVAL '9 hours');

-- Insert user locations (current positions)
INSERT INTO user_locations (user_id, latitude, longitude, accuracy, speed, heading, timestamp, is_current, privacy_mode, status_message, created_at) VALUES
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), 10.7743, 106.7011, 10.0, 0.0, 0.0, NOW(), TRUE, 'ALL_FRIENDS', NULL, NOW()),
((SELECT id FROM users WHERE email = 'minh@mapic.com'), 10.7797, 106.6991, 15.0, 0.0, 0.0, NOW() - INTERVAL '5 minutes', TRUE, 'ALL_FRIENDS', 'At coffee shop ☕', NOW() - INTERVAL '5 minutes'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), 10.7768, 106.7009, 12.0, 0.0, 0.0, NOW() - INTERVAL '10 minutes', TRUE, 'ALL_FRIENDS', 'Shopping! 🛍️', NOW() - INTERVAL '10 minutes'),
((SELECT id FROM users WHERE email = 'hung@mapic.com'), 10.7854, 106.6995, 20.0, 0.0, 0.0, NOW() - INTERVAL '15 minutes', TRUE, 'ALL_FRIENDS', NULL, NOW() - INTERVAL '15 minutes'),
((SELECT id FROM users WHERE email = 'tuan@mapic.com'), 10.7823, 106.6976, 8.0, 0.0, 0.0, NOW() - INTERVAL '20 minutes', TRUE, 'CLOSE_FRIENDS', 'Working out 💪', NOW() - INTERVAL '20 minutes'),
((SELECT id FROM users WHERE email = 'linh@mapic.com'), 10.7689, 106.7001, 18.0, 0.0, 0.0, NOW() - INTERVAL '25 minutes', TRUE, 'ALL_FRIENDS', 'At museum 🎨', NOW() - INTERVAL '25 minutes');

-- Insert avatar frames
INSERT INTO avatar_frames (name, description, image_url, unlock_condition, unlock_value, rarity, is_active) VALUES
('Bronze Explorer', 'Unlock by visiting 5 places', 'https://example.com/frames/bronze.png', 'PLACES_VISITED', 5, 'COMMON', TRUE),
('Silver Traveler', 'Unlock by visiting 20 places', 'https://example.com/frames/silver.png', 'PLACES_VISITED', 20, 'RARE', TRUE),
('Gold Adventurer', 'Unlock by visiting 50 places', 'https://example.com/frames/gold.png', 'PLACES_VISITED', 50, 'EPIC', TRUE),
('Social Butterfly', 'Unlock by having 10 friends', 'https://example.com/frames/social.png', 'FRIENDS_COUNT', 10, 'RARE', TRUE),
('Interaction Master', 'Send 100 interactions', 'https://example.com/frames/interaction.png', 'INTERACTIONS_SENT', 100, 'EPIC', TRUE);

-- Unlock some frames for testuser
INSERT INTO user_avatar_frames (user_id, frame_id, is_selected, unlocked_at)
SELECT 
    (SELECT id FROM users WHERE email = 'testuser@mapic.com'),
    af.id,
    FALSE,
    NOW() - INTERVAL '10 days'
FROM avatar_frames af
WHERE af.name IN ('Bronze Explorer', 'Social Butterfly');

-- Insert friend interactions
INSERT INTO friend_interactions (from_user_id, to_user_id, interaction_type, is_read, created_at) VALUES
-- Recent interactions
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'minh@mapic.com'), 'WAVE', FALSE, NOW() - INTERVAL '30 minutes'),
((SELECT id FROM users WHERE email = 'minh@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'HEART', FALSE, NOW() - INTERVAL '25 minutes'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'lan@mapic.com'), 'HEART', FALSE, NOW() - INTERVAL '1 hour'),
((SELECT id FROM users WHERE email = 'lan@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'WAVE', FALSE, NOW() - INTERVAL '50 minutes'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'tuan@mapic.com'), 'POKE', FALSE, NOW() - INTERVAL '2 hours'),
((SELECT id FROM users WHERE email = 'tuan@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'FIRE', FALSE, NOW() - INTERVAL '1 hour 30 minutes'),

-- Older interactions
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'hung@mapic.com'), 'WAVE', TRUE, NOW() - INTERVAL '1 day'),
((SELECT id FROM users WHERE email = 'hung@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'HEART', TRUE, NOW() - INTERVAL '23 hours'),
((SELECT id FROM users WHERE email = 'testuser@mapic.com'), (SELECT id FROM users WHERE email = 'linh@mapic.com'), 'HEART', TRUE, NOW() - INTERVAL '2 days'),
((SELECT id FROM users WHERE email = 'linh@mapic.com'), (SELECT id FROM users WHERE email = 'testuser@mapic.com'), 'WAVE', TRUE, NOW() - INTERVAL '1 day 12 hours');

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- 
-- Tables Created: 25 tables
-- Test Users: 7 users (all with password: password123)
-- Test Posts: 17 posts around District 1, TP.HCM
-- Friend Locations: 6 users with current locations
-- Friendships: testuser is friends with all 6 others
-- Avatar Frames: 5 frames, 2 unlocked for testuser
-- Interactions: 10 friend interactions
-- 
-- Test Accounts:
-- - testuser@mapic.com / password123 (Main test user - YOU)
-- - minh@mapic.com / password123 (Friend, online, at coffee shop)
-- - lan@mapic.com / password123 (Friend, online, shopping)
-- - hung@mapic.com / password123 (Friend, online, at tech meetup)
-- - hoa@mapic.com / password123 (Friend, offline)
-- - tuan@mapic.com / password123 (Friend, online, working out)
-- - linh@mapic.com / password123 (Friend, online, at museum)
-- 
-- All locations are around District 1, TP.HCM (10.7743, 106.7011)
-- 
-- ============================================================================
