ALTER TABLE places 
ADD COLUMN IF NOT EXISTS post_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count BIGINT DEFAULT 0;

-- Update existing counts based on posts table if needed
UPDATE places p
SET post_count = (SELECT COUNT(id) FROM posts post WHERE LOWER(post.location_name) = LOWER(p.name));

UPDATE places p
SET review_count = (SELECT COUNT(id) FROM posts post WHERE LOWER(post.location_name) = LOWER(p.name) AND post.post_type = 'REVIEW');
