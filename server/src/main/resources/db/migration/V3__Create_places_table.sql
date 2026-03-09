-- Create places table
CREATE TABLE IF NOT EXISTS places (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    average_rating DOUBLE PRECISION,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create composite index for query optimization (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_place_category_rating_name') THEN
        CREATE INDEX idx_place_category_rating_name ON places (category, average_rating, name);
    END IF;
END $$;

-- Add check constraint for category enum values (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_place_category') THEN
        ALTER TABLE places ADD CONSTRAINT check_place_category 
            CHECK (category IN ('RESTAURANT', 'HOTEL', 'PARK', 'MUSEUM', 'SHOPPING', 'ENTERTAINMENT', 'OTHER'));
    END IF;
END $$;

-- Add check constraint for rating range (0-5) (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_average_rating') THEN
        ALTER TABLE places ADD CONSTRAINT check_average_rating 
            CHECK (average_rating IS NULL OR (average_rating >= 0 AND average_rating <= 5));
    END IF;
END $$;

-- Add check constraint for valid coordinates (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_latitude') THEN
        ALTER TABLE places ADD CONSTRAINT check_latitude 
            CHECK (latitude >= -90 AND latitude <= 90);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_longitude') THEN
        ALTER TABLE places ADD CONSTRAINT check_longitude 
            CHECK (longitude >= -180 AND longitude <= 180);
    END IF;
END $$;
