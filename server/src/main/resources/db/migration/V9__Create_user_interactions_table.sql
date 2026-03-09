-- Create user_interactions table for tracking user behavior
CREATE TABLE IF NOT EXISTS user_interactions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL,
    duration_seconds INTEGER,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_user_interaction_user_time ON user_interactions(user_id, timestamp DESC);
CREATE INDEX idx_user_interaction_post ON user_interactions(post_id);
CREATE INDEX idx_user_interaction_type ON user_interactions(interaction_type, timestamp DESC);
CREATE INDEX idx_user_interaction_user_post ON user_interactions(user_id, post_id);

-- Add comments
COMMENT ON TABLE user_interactions IS 'Tracks user interactions with posts for recommendations';
COMMENT ON COLUMN user_interactions.interaction_type IS 'Type: VIEW, LIKE, COMMENT, SHARE, SAVE';
COMMENT ON COLUMN user_interactions.duration_seconds IS 'Time spent viewing the post (for VIEW type)';
