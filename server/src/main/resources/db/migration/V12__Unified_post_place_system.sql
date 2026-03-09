-- Migration V12: Unified Post-Place System
-- Merges Review and Post systems into a unified model
-- Posts can now be NORMAL (regular posts) or REVIEW (posts with ratings at places)

-- ============================================================================
-- STEP 1: Add new columns to posts table
-- ============================================================================

-- Add post_type column (NORMAL or REVIEW)
ALTER TABLE posts 
ADD COLUMN post_type VARCHAR(20) DEFAULT 'NORMAL' NOT NULL;

-- Add place_id foreign key (optional for NORMAL, required for REVIEW)
ALTER TABLE posts 
ADD COLUMN place_id BIGINT;

-- Add rating column (null for NORMAL, 1-5 for REVIEW)
ALTER TABLE posts 
ADD COLUMN rating INTEGER;

-- Add foreign key constraint to places
ALTER TABLE posts 
ADD CONSTRAINT fk_posts_place 
FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 2: Add constraints for data integrity
-- ============================================================================

-- Ensure rating is in valid range (1-5) or NULL
ALTER TABLE posts 
ADD CONSTRAINT chk_rating_range 
CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Ensure REVIEW posts have a place_id
ALTER TABLE posts 
ADD CONSTRAINT chk_review_has_place 
CHECK (post_type != 'REVIEW' OR place_id IS NOT NULL);

-- Ensure REVIEW posts have a rating
ALTER TABLE posts 
ADD CONSTRAINT chk_review_has_rating 
CHECK (post_type != 'REVIEW' OR rating IS NOT NULL);

-- Ensure post_type is valid
ALTER TABLE posts 
ADD CONSTRAINT chk_post_type 
CHECK (post_type IN ('NORMAL', 'REVIEW'));

-- ============================================================================
-- STEP 3: Add indexes for performance
-- ============================================================================

-- Index for querying posts by place and type
CREATE INDEX idx_posts_place_type ON posts(place_id, post_type, created_at DESC);

-- Index for querying posts by type
CREATE INDEX idx_posts_type_created ON posts(post_type, created_at DESC);

-- Index for sorting by rating (only for REVIEW posts)
CREATE INDEX idx_posts_rating ON posts(rating DESC) WHERE rating IS NOT NULL;

-- Index for place_id lookups
CREATE INDEX idx_posts_place_id ON posts(place_id) WHERE place_id IS NOT NULL;

-- ============================================================================
-- STEP 4: Add post_count and review_count to places table
-- ============================================================================

-- Add post_count column (total posts at this place)
ALTER TABLE places
ADD COLUMN post_count INTEGER DEFAULT 0 NOT NULL;

-- Add review_count column (subset of post_count, only REVIEW posts)
ALTER TABLE places
ADD COLUMN review_count INTEGER DEFAULT 0 NOT NULL;

-- Add constraint to ensure counts are non-negative
ALTER TABLE places
ADD CONSTRAINT chk_post_count_positive 
CHECK (post_count >= 0);

ALTER TABLE places
ADD CONSTRAINT chk_review_count_positive 
CHECK (review_count >= 0);

-- Add constraint to ensure review_count <= post_count
ALTER TABLE places
ADD CONSTRAINT chk_review_count_lte_post_count 
CHECK (review_count <= post_count);

-- Add index for filtering places by post count
CREATE INDEX idx_places_post_count ON places(post_count) WHERE post_count > 0;

-- Add index for sorting places by post count
CREATE INDEX idx_places_post_count_desc ON places(post_count DESC);

-- ============================================================================
-- STEP 5: Migrate existing reviews to posts table
-- ============================================================================

-- Insert reviews as REVIEW posts
INSERT INTO posts (
    user_id, 
    content, 
    post_type, 
    place_id, 
    rating, 
    latitude, 
    longitude, 
    location_name, 
    privacy, 
    view_count, 
    created_at, 
    updated_at
)
SELECT 
    r.user_id,
    r.content,
    'REVIEW' as post_type,
    r.place_id,
    r.rating,
    p.latitude,
    p.longitude,
    p.name as location_name,
    CASE 
        WHEN r.is_public THEN 'PUBLIC' 
        ELSE 'FRIENDS_ONLY' 
    END as privacy,
    0 as view_count,
    r.created_at,
    r.created_at as updated_at
FROM reviews r
JOIN places p ON r.place_id = p.id
WHERE NOT EXISTS (
    -- Avoid duplicates if migration is run multiple times
    SELECT 1 FROM posts 
    WHERE post_type = 'REVIEW' 
    AND user_id = r.user_id 
    AND place_id = r.place_id 
    AND created_at = r.created_at
);

-- ============================================================================
-- STEP 6: Update place counts based on migrated data
-- ============================================================================

-- Update post_count for all places
UPDATE places p
SET post_count = (
    SELECT COUNT(*) 
    FROM posts 
    WHERE place_id = p.id
);

-- Update review_count for all places
UPDATE places p
SET review_count = (
    SELECT COUNT(*) 
    FROM posts 
    WHERE place_id = p.id 
    AND post_type = 'REVIEW'
);

-- ============================================================================
-- STEP 7: Mark reviews table as deprecated
-- ============================================================================

-- Rename reviews table to indicate it's deprecated
ALTER TABLE reviews RENAME TO reviews_deprecated;

-- Add comment to warn developers
COMMENT ON TABLE reviews_deprecated IS 
'DEPRECATED: This table has been migrated to the posts table with post_type=REVIEW. 
All new reviews should be created as posts with post_type=REVIEW.
This table is kept for backup purposes and can be safely dropped after verification.
Migration date: ' || CURRENT_TIMESTAMP;

-- ============================================================================
-- STEP 8: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN posts.post_type IS 
'Type of post: NORMAL (regular post) or REVIEW (post with rating at a place)';

COMMENT ON COLUMN posts.place_id IS 
'Foreign key to places table. Required for REVIEW posts, optional for NORMAL posts';

COMMENT ON COLUMN posts.rating IS 
'Rating from 1-5 stars. Required for REVIEW posts, NULL for NORMAL posts';

COMMENT ON COLUMN places.post_count IS 
'Total number of posts (NORMAL + REVIEW) at this place';

COMMENT ON COLUMN places.review_count IS 
'Number of REVIEW posts at this place (subset of post_count)';

-- ============================================================================
-- Migration Statistics
-- ============================================================================

-- Log migration statistics
DO $$
DECLARE
    total_reviews INTEGER;
    migrated_posts INTEGER;
    places_with_posts INTEGER;
BEGIN
    -- Count original reviews
    SELECT COUNT(*) INTO total_reviews FROM reviews_deprecated;
    
    -- Count migrated REVIEW posts
    SELECT COUNT(*) INTO migrated_posts FROM posts WHERE post_type = 'REVIEW';
    
    -- Count places with posts
    SELECT COUNT(*) INTO places_with_posts FROM places WHERE post_count > 0;
    
    -- Log results
    RAISE NOTICE '=== Migration V12 Statistics ===';
    RAISE NOTICE 'Total reviews in deprecated table: %', total_reviews;
    RAISE NOTICE 'Total REVIEW posts created: %', migrated_posts;
    RAISE NOTICE 'Places with posts: %', places_with_posts;
    RAISE NOTICE 'Migration completed successfully!';
END $$;
