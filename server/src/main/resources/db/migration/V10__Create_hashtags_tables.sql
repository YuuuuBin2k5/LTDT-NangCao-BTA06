-- Migration V10: Create hashtags tables for post tagging

-- Create hashtags table
CREATE TABLE hashtags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT hashtags_usage_count_check CHECK (usage_count >= 0)
);

-- Indexes for hashtags
CREATE INDEX idx_hashtags_name ON hashtags(name);
CREATE INDEX idx_hashtags_usage ON hashtags(usage_count DESC);

-- Create post_hashtags junction table
CREATE TABLE post_hashtags (
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id BIGINT NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY(post_id, hashtag_id)
);

-- Index for finding posts by hashtag
CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);

-- Comments
COMMENT ON TABLE hashtags IS 'Hashtags extracted from post content';
COMMENT ON COLUMN hashtags.usage_count IS 'Number of posts using this hashtag';
COMMENT ON TABLE post_hashtags IS 'Many-to-many relationship between posts and hashtags';
