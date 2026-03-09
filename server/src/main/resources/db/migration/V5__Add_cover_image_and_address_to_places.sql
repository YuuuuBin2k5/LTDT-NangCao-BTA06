-- Add cover_image_url and address fields to places table
ALTER TABLE places ADD COLUMN cover_image_url VARCHAR(500);
ALTER TABLE places ADD COLUMN address VARCHAR(500);
