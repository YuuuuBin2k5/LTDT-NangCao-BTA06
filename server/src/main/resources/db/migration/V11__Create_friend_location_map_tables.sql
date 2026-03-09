-- Friend Location Map Feature Migration

-- Enable PostGIS extension for geographic data types
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create user_locations table for location history
CREATE TABLE IF NOT EXISTS user_locations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy FLOAT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT true,
    privacy_mode VARCHAR(20) DEFAULT 'ALL_FRIENDS',
    status_message VARCHAR(50),
    status_emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_locations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create spatial index for fast proximity queries
CREATE INDEX IF NOT EXISTS idx_user_locations_geography ON user_locations USING GIST (location);

-- Create composite index for current location queries
CREATE INDEX IF NOT EXISTS idx_user_locations_current ON user_locations (user_id, is_current) WHERE is_current = true;

-- Create index for timestamp queries
CREATE INDEX IF NOT EXISTS idx_user_locations_timestamp ON user_locations (timestamp);

-- Create partial index for recent/online users
CREATE INDEX IF NOT EXISTS idx_user_locations_recent ON user_locations (timestamp) WHERE timestamp > NOW() - INTERVAL '5 minutes';

-- Create friend_interactions table for interaction effects
CREATE TABLE IF NOT EXISTS friend_interactions (
    id BIGSERIAL PRIMARY KEY,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('HEART', 'WAVE', 'POKE', 'FIRE', 'STAR', 'HUG')),
    from_latitude DOUBLE PRECISION,
    from_longitude DOUBLE PRECISION,
    to_latitude DOUBLE PRECISION,
    to_longitude DOUBLE PRECISION,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_friend_interactions_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_interactions_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for friend_interactions
CREATE INDEX IF NOT EXISTS idx_friend_interactions_to_user ON friend_interactions (to_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_from_user ON friend_interactions (from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_created_at ON friend_interactions (created_at);

-- Create avatar_frames table
CREATE TABLE IF NOT EXISTS avatar_frames (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frame_type VARCHAR(20) NOT NULL CHECK (frame_type IN ('CIRCULAR', 'SQUARE', 'HEART', 'STAR', 'HEXAGON', 'DIAMOND', 'FLOWER', 'CLOUD', 'BADGE', 'NEON')),
    svg_path TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    unlock_condition VARCHAR(100),
    unlock_requirement_value INT,
    display_order INT,
    is_seasonal BOOLEAN DEFAULT false,
    available_from DATE,
    available_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for display order
CREATE INDEX IF NOT EXISTS idx_avatar_frames_display_order ON avatar_frames (display_order);

-- Create user_avatar_frames table for user's unlocked frames
CREATE TABLE IF NOT EXISTS user_avatar_frames (
    user_id UUID NOT NULL,
    frame_id VARCHAR(50) NOT NULL,
    is_selected BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, frame_id),
    CONSTRAINT fk_user_avatar_frames_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_avatar_frames_frame FOREIGN KEY (frame_id) REFERENCES avatar_frames(id) ON DELETE CASCADE
);

-- Create index for selected frame lookup
CREATE INDEX IF NOT EXISTS idx_user_avatar_frames_selected ON user_avatar_frames (user_id, is_selected) WHERE is_selected = true;

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_value INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, achievement_type)
);

-- Create index for achievement lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements (user_id);

-- Create proximity_notifications table
CREATE TABLE IF NOT EXISTS proximity_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    friend_id UUID NOT NULL,
    distance_meters FLOAT NOT NULL,
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proximity_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_proximity_notifications_friend FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for proximity notification lookups
CREATE INDEX IF NOT EXISTS idx_proximity_notifications_user_time ON proximity_notifications (user_id, notified_at);