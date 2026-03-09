-- Migration V8: Create post_images table
-- Supports multiple images per post with ordering

CREATE TABLE post_images (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT post_images_order_check CHECK (display_order >= 0)
);

-- Index for fetching images of a post in order
CREATE INDEX idx_post_images_post_order ON post_images(post_id, display_order);

-- Comments
COMMENT ON TABLE post_images IS 'Images attached to posts, supports multiple images per post';
COMMENT ON COLUMN post_images.thumbnail_url IS 'Thumbnail version for map markers and previews';
COMMENT ON COLUMN post_images.display_order IS 'Order of images in carousel (0-based)';
