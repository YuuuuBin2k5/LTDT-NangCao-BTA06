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
