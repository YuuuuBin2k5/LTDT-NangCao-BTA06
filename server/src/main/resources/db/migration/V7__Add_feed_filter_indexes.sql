-- Add indexes for feed filter performance

-- Composite index for user posts sorted by date
CREATE INDEX IF NOT EXISTS idx_posts_user_created 
ON posts(user_id, created_at DESC);

-- Spatial index for location-based queries (already using earthdistance)
CREATE INDEX IF NOT EXISTS idx_posts_location 
ON posts USING GIST(ll_to_earth(latitude, longitude));

-- Index for public posts sorted by date
CREATE INDEX IF NOT EXISTS idx_posts_privacy_created 
ON posts(privacy, created_at DESC) 
WHERE privacy = 'PUBLIC';

-- Partial index for recent trending posts
CREATE INDEX IF NOT EXISTS idx_posts_trending 
ON posts(created_at DESC)
WHERE created_at > NOW() - INTERVAL '7 days';

-- Index for friendships to speed up friend queries
CREATE INDEX IF NOT EXISTS idx_friendships_user_status 
ON friendships(user_id, status) 
WHERE status = 'ACCEPTED';

CREATE INDEX IF NOT EXISTS idx_friendships_friend_status 
ON friendships(friend_id, status) 
WHERE status = 'ACCEPTED';

-- Index for posts with location names (check-ins)
CREATE INDEX IF NOT EXISTS idx_posts_location_name 
ON posts(location_name, created_at DESC)
WHERE location_name IS NOT NULL;

-- Index for content length (for long_posts filter)
CREATE INDEX IF NOT EXISTS idx_posts_content_length 
ON posts(LENGTH(content), created_at DESC);
