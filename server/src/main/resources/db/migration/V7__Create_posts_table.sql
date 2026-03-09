-- Migration V7: Create posts table for social posting feature
-- This replaces the review-centric model with user-generated posts

-- Create posts table
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255),
    privacy VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT posts_privacy_check CHECK (privacy IN ('PUBLIC', 'FRIENDS_ONLY', 'PRIVATE')),
    CONSTRAINT posts_latitude_check CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT posts_longitude_check CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT posts_view_count_check CHECK (view_count >= 0)
);

-- Create spatial index for location-based queries using PostGIS
-- This enables efficient "nearby posts" queries
CREATE INDEX idx_posts_location ON posts USING GIST (
    ll_to_earth(latitude, longitude)
);

-- Index for user's posts query
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- Index for feed timeline query
CREATE INDEX idx_posts_created ON posts(created_at DESC);

-- Index for privacy + created_at queries
CREATE INDEX idx_posts_privacy_created ON posts(privacy, created_at DESC);

-- Comments
COMMENT ON TABLE posts IS 'User-generated posts with location and privacy settings';
COMMENT ON COLUMN posts.privacy IS 'Post visibility: PUBLIC (everyone), FRIENDS_ONLY (friends only), PRIVATE (only me)';
COMMENT ON COLUMN posts.view_count IS 'Number of times this post has been viewed';
COMMENT ON COLUMN posts.location_name IS 'Human-readable location name (e.g., "Bãi biển Vũng Tàu")';
