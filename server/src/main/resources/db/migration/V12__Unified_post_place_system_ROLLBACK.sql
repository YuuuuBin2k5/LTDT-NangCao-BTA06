-- Rollback script for V12: Unified Post-Place System
-- WARNING: This will delete all REVIEW posts created after migration
-- Only use this if you need to revert to the old review system

-- ============================================================================
-- STEP 1: Restore reviews table
-- ============================================================================

-- Rename back to reviews
ALTER TABLE reviews_deprecated RENAME TO reviews;

-- Remove deprecation comment
COMMENT ON TABLE reviews IS 'User reviews for places with ratings';

-- ============================================================================
-- STEP 2: Remove place count columns
-- ============================================================================

-- Drop indexes first
DROP INDEX IF EXISTS idx_places_post_count;
DROP INDEX IF EXISTS idx_places_post_count_desc;

-- Drop constraints
ALTER TABLE places DROP CONSTRAINT IF EXISTS chk_post_count_positive;
ALTER TABLE places DROP CONSTRAINT IF EXISTS chk_review_count_positive;
ALTER TABLE places DROP CONSTRAINT IF EXISTS chk_review_count_lte_post_count;

-- Drop columns
ALTER TABLE places DROP COLUMN IF EXISTS post_count;
ALTER TABLE places DROP COLUMN IF EXISTS review_count;

-- ============================================================================
-- STEP 3: Remove indexes from posts table
-- ============================================================================

DROP INDEX IF EXISTS idx_posts_place_type;
DROP INDEX IF EXISTS idx_posts_type_created;
DROP INDEX IF EXISTS idx_posts_rating;
DROP INDEX IF EXISTS idx_posts_place_id;

-- ============================================================================
-- STEP 4: Remove constraints from posts table
-- ============================================================================

ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_rating_range;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_review_has_place;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_review_has_rating;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS chk_post_type;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_place;

-- ============================================================================
-- STEP 5: Remove columns from posts table
-- ============================================================================

ALTER TABLE posts DROP COLUMN IF EXISTS post_type;
ALTER TABLE posts DROP COLUMN IF EXISTS place_id;
ALTER TABLE posts DROP COLUMN IF EXISTS rating;

-- ============================================================================
-- Rollback Complete
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== Rollback V12 Complete ===';
    RAISE NOTICE 'Reviews table restored';
    RAISE NOTICE 'Posts table reverted to original schema';
    RAISE NOTICE 'WARNING: Any REVIEW posts created after migration have been lost';
END $$;
