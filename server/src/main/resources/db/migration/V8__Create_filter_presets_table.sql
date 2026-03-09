-- Create filter_presets table
CREATE TABLE IF NOT EXISTS filter_presets (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    filters JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(64) UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_filter_preset_user ON filter_presets(user_id);
CREATE INDEX idx_filter_preset_share_token ON filter_presets(share_token);
CREATE INDEX idx_filter_preset_usage ON filter_presets(user_id, usage_count DESC);

-- Add unique constraint for user_id + name
CREATE UNIQUE INDEX idx_filter_preset_user_name ON filter_presets(user_id, name);

-- Add comment
COMMENT ON TABLE filter_presets IS 'Stores user-defined filter presets for feed';
COMMENT ON COLUMN filter_presets.filters IS 'JSONB array of filter configurations';
COMMENT ON COLUMN filter_presets.share_token IS 'Token for sharing preset with other users';
COMMENT ON COLUMN filter_presets.usage_count IS 'Number of times this preset has been used';
