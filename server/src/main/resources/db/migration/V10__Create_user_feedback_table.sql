-- Create user_feedback table for tracking user feedback on posts
CREATE TABLE IF NOT EXISTS user_feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one feedback per user per post
    UNIQUE(user_id, post_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_feedback_user ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_post ON user_feedback(post_id);
CREATE INDEX idx_user_feedback_type ON user_feedback(feedback_type);
CREATE INDEX idx_user_feedback_created ON user_feedback(created_at DESC);

-- Add comments
COMMENT ON TABLE user_feedback IS 'Tracks user feedback on posts for improving recommendations';
COMMENT ON COLUMN user_feedback.feedback_type IS 'Type: NOT_INTERESTED, HIDE_POST, REPORT_SPAM, HELPFUL, NOT_RELEVANT';
COMMENT ON COLUMN user_feedback.reason IS 'Optional reason for negative feedback';
