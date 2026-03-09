-- Add profile_visibility column to users table
DO $$
BEGIN
    -- Add profile_visibility column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'profile_visibility'
    ) THEN
        -- Step 1: Add column as nullable first
        ALTER TABLE users ADD COLUMN profile_visibility VARCHAR(20);
        
        -- Step 2: Set default value for existing rows
        UPDATE users SET profile_visibility = 'PUBLIC' WHERE profile_visibility IS NULL;
        
        -- Step 3: Now make it NOT NULL with default
        ALTER TABLE users ALTER COLUMN profile_visibility SET NOT NULL;
        ALTER TABLE users ALTER COLUMN profile_visibility SET DEFAULT 'PUBLIC';
        
        -- Step 4: Add CHECK constraint for valid enum values
        ALTER TABLE users ADD CONSTRAINT chk_profile_visibility 
            CHECK (profile_visibility IN ('PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'));
    END IF;
END $$;

-- Create composite index on (profile_visibility, nick_name) for search optimization
CREATE INDEX IF NOT EXISTS idx_users_visibility_nick_name ON users(profile_visibility, nick_name);

-- Create index on username for search optimization (if not already exists)
CREATE INDEX IF NOT EXISTS idx_users_username_search ON users(username);
