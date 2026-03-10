-- ============================================================
-- EXPLORE MISSIONS — Database Schema
-- MAPIC App
-- ============================================================

-- 1. Mission Categories (Danh mục nhiệm vụ)
CREATE TABLE IF NOT EXISTS mission_categories (
    id      BIGSERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,   -- "Ẩm thực", "Văn hóa", "Thiên nhiên", "Giải trí"
    icon    VARCHAR(50),             -- emoji: "🍜", "🏛️", "🌿", "🎉"
    color   VARCHAR(7)              -- hex: "#FF6B6B"
);

-- 2. Missions (Nhiệm vụ)
CREATE TABLE IF NOT EXISTS missions (
    id             BIGSERIAL PRIMARY KEY,
    title          VARCHAR(255)         NOT NULL,
    description    TEXT,
    category_id    BIGINT               REFERENCES mission_categories(id),
    place_id       BIGINT               REFERENCES places(id),
    latitude       DOUBLE PRECISION     NOT NULL,
    longitude      DOUBLE PRECISION     NOT NULL,
    radius_meters  INTEGER              NOT NULL DEFAULT 100,
    xp_reward      INTEGER              NOT NULL DEFAULT 50,
    badge_name     VARCHAR(100),                            -- tên badge nhận khi hoàn thành
    difficulty     SMALLINT             NOT NULL DEFAULT 1, -- 1=dễ 2=trung bình 3=khó
    deadline       TIMESTAMP,                               -- null = không giới hạn
    is_active      BOOLEAN              NOT NULL DEFAULT true,
    created_at     TIMESTAMP            NOT NULL DEFAULT NOW()
);

-- 3. Mission Carts (Giỏ hàng nhiệm vụ — mỗi user có 1 cart active)
CREATE TABLE IF NOT EXISTS mission_carts (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status      VARCHAR(20)     NOT NULL DEFAULT 'PENDING',  -- PENDING | ACTIVE | COMPLETED
    started_at  TIMESTAMP,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 4. Mission Cart Items (Items trong giỏ = từng nhiệm vụ đã chọn)
CREATE TABLE IF NOT EXISTS mission_cart_items (
    id                  BIGSERIAL PRIMARY KEY,
    cart_id             BIGINT          NOT NULL REFERENCES mission_carts(id) ON DELETE CASCADE,
    mission_id          BIGINT          NOT NULL REFERENCES missions(id),
    status              VARCHAR(30)     NOT NULL DEFAULT 'AVAILABLE',
    -- AVAILABLE → ACTIVE → IN_PROGRESS → AT_LOCATION → COMPLETED / CANCELLED / CANCEL_REQUESTED
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    cancelled_at        TIMESTAMP,
    check_in_photo_url  TEXT,
    UNIQUE (cart_id, mission_id)
);

-- 5. User XP (Điểm kinh nghiệm tích lũy)
CREATE TABLE IF NOT EXISTS user_xp (
    user_id             UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_xp            INTEGER     NOT NULL DEFAULT 0,
    level               INTEGER     NOT NULL DEFAULT 1,
    missions_completed  INTEGER     NOT NULL DEFAULT 0,
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- 6. User Badges (Huy hiệu đã đạt)
CREATE TABLE IF NOT EXISTS user_badges (
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_name  VARCHAR(100) NOT NULL,
    earned_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_missions_category ON missions(category_id);
CREATE INDEX IF NOT EXISTS idx_missions_active    ON missions(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_user          ON mission_carts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart    ON mission_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_status  ON mission_cart_items(status);

-- ============================================================
-- SEED DATA — 4 categories + 10 missions TP.HCM
-- ============================================================

INSERT INTO mission_categories (name, icon, color) VALUES
    ('Ẩm thực',    '🍜', '#FF6B6B'),
    ('Văn hóa',    '🏛️', '#4ECDC4'),
    ('Thiên nhiên','🌿', '#45B7D1'),
    ('Giải trí',   '🎉', '#96CEB4')
ON CONFLICT DO NOTHING;

-- Các mission sẽ insert sau khi có place_id thực tế
-- Dùng INSERT với lat/lng của địa điểm thực TP.HCM
INSERT INTO missions (title, description, category_id, latitude, longitude, radius_meters, xp_reward, badge_name, difficulty) VALUES
    ('Phở Hà Nội Cầu Kiệu', 'Check-in quán phở nổi tiếng trên đường Cầu Kiệu, Q. Phú Nhuận', 1, 10.7969, 106.6812, 100, 30, 'Phở Lover', 1),
    ('Cà Phê Apartments', 'Khám phá cà phê tầng thượng view đẹp tại Bùi Viện', 1, 10.7678, 106.6929, 100, 40, 'Coffee Explorer', 1),
    ('Bảo Tàng Lịch Sử TP.HCM', 'Check-in tại Bảo Tàng Lịch Sử TP.HCM – Đinh Tiên Hoàng', 2, 10.7874, 106.7056, 150, 80, 'History Buff', 2),
    ('Nhà Thờ Đức Bà', 'Khám phá công trình kiến trúc Pháp cổ điển ở trung tâm', 2, 10.7797, 106.6990, 150, 70, 'Architecture Fan', 2),
    ('Chùa Ngọc Hoàng', 'Tìm hiểu lịch sử ngôi chùa 100 tuổi tại Q.1', 2, 10.7880, 106.7000, 120, 60, 'Pagoda Walker', 2),
    ('Công Viên Tao Đàn', 'Đến công viên xanh mát giữa lòng thành phố', 3, 10.7746, 106.6950, 120, 35, 'Nature Seeker', 1),
    ('Thảo Cầm Viên', 'Check-in tại vườn thú lâu đời nhất Đông Nam Á', 3, 10.7888, 106.7057, 200, 50, 'Zoo Adventurer', 1),
    ('Phố Đi Bộ Nguyễn Huệ', 'Trải nghiệm phố đi bộ sôi động nhất Sài Gòn', 4, 10.7743, 106.7039, 100, 30, 'City Walker', 1),
    ('Khu Phố Bùi Viện', 'Khám phá phố Tây nổi tiếng về đêm', 4, 10.7678, 106.6929, 100, 45, 'Night Owl', 2),
    ('Chợ Bến Thành', 'Check-in chợ biểu tượng của Sài Gòn', 4, 10.7725, 106.6983, 150, 40, 'Market Explorer', 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- AVATAR FRAMES & LOCATION MAP
-- ============================================================

-- Create user_locations table for location history
CREATE TABLE IF NOT EXISTS user_locations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy FLOAT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT true,
    privacy_mode VARCHAR(20) DEFAULT 'ALL_FRIENDS',
    status_message VARCHAR(50),
    status_emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index (B-tree placeholder for proximity based on lat/lng)
CREATE INDEX IF NOT EXISTS idx_user_locations_lat_lng ON user_locations (latitude, longitude);

-- Create composite index for current location queries
CREATE INDEX IF NOT EXISTS idx_user_locations_current ON user_locations (user_id, is_current) WHERE is_current = true;

-- Create friend_interactions table
CREATE TABLE IF NOT EXISTS friend_interactions (
    id BIGSERIAL PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('HEART', 'WAVE', 'POKE', 'FIRE', 'STAR', 'HUG')),
    from_latitude DOUBLE PRECISION,
    from_longitude DOUBLE PRECISION,
    to_latitude DOUBLE PRECISION,
    to_longitude DOUBLE PRECISION,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create avatar_frames table
CREATE TABLE IF NOT EXISTS avatar_frames (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frame_type VARCHAR(20) NOT NULL,
    svg_path TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    unlock_condition VARCHAR(100),
    unlock_requirement_value INT,
    display_order INT,
    is_seasonal BOOLEAN DEFAULT false,
    available_from DATE,
    available_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FIX: Ensure all columns exist in avatar_frames (Manual migration for partially-created tables)
DO $$ 
BEGIN 
    -- frame_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='frame_type') THEN
        ALTER TABLE avatar_frames ADD COLUMN frame_type VARCHAR(20) NOT NULL DEFAULT 'CIRCULAR';
    END IF;
    -- svg_path
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='svg_path') THEN
        ALTER TABLE avatar_frames ADD COLUMN svg_path TEXT NOT NULL DEFAULT '';
    END IF;
    -- is_premium
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='is_premium') THEN
        ALTER TABLE avatar_frames ADD COLUMN is_premium BOOLEAN DEFAULT false;
    END IF;
    -- is_seasonal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='is_seasonal') THEN
        ALTER TABLE avatar_frames ADD COLUMN is_seasonal BOOLEAN DEFAULT false;
    END IF;
    -- unlock_condition
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='unlock_condition') THEN
        ALTER TABLE avatar_frames ADD COLUMN unlock_condition VARCHAR(100);
    END IF;
    -- unlock_requirement_value
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='unlock_requirement_value') THEN
        ALTER TABLE avatar_frames ADD COLUMN unlock_requirement_value INT;
    END IF;
    -- display_order
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='display_order') THEN
        ALTER TABLE avatar_frames ADD COLUMN display_order INT;
    END IF;
    -- available_from
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='available_from') THEN
        ALTER TABLE avatar_frames ADD COLUMN available_from DATE;
    END IF;
    -- available_until
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='avatar_frames' AND column_name='available_until') THEN
        ALTER TABLE avatar_frames ADD COLUMN available_until DATE;
    END IF;
END $$;

-- Create user_avatar_frames table
CREATE TABLE IF NOT EXISTS user_avatar_frames (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    frame_id VARCHAR(50) NOT NULL REFERENCES avatar_frames(id) ON DELETE CASCADE,
    is_selected BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, frame_id)
);

-- Create proximity_notifications table
CREATE TABLE IF NOT EXISTS proximity_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    distance_meters FLOAT NOT NULL,
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- FIX: SCHEMA TYPE MISMATCHES (Hibernate DDL Auto)
-- ============================================================
DROP TABLE IF EXISTS user_feedback CASCADE;
DROP TABLE IF EXISTS user_interactions CASCADE;

DO $$ 
BEGIN
    ALTER TABLE user_avatar_frames DROP CONSTRAINT IF EXISTS fk_user_avatar_frames_frame;
    ALTER TABLE avatar_frames ALTER COLUMN id TYPE VARCHAR(50) USING id::text;
    ALTER TABLE user_avatar_frames ALTER COLUMN frame_id TYPE VARCHAR(50) USING frame_id::text;
    ALTER TABLE user_avatar_frames ADD CONSTRAINT fk_user_avatar_frames_frame FOREIGN KEY (frame_id) REFERENCES avatar_frames(id) ON DELETE CASCADE;
EXCEPTION
    WHEN others THEN
        -- Ignore if it fails
END $$;
