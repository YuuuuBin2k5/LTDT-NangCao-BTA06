-- BẢN SỬA LỖI HOÀN CHỈNH CHO DATABASE CỦA MAPIC
-- Vấn đề: Script FULL_DATABASE_SETUP.sql tạo bảng places và reviews với ID là UUID,
-- trong khi Backend Java (Place.java, Review.java) lại sử dụng kiểu Long (BIGINT).
-- Việc này gây lỗi không tương thích khoá ngoại và lỗi Crash Backend khi query Place.

-- 1. Xoá bỏ các bảng bị sai kiểu dữ liệu (Sẽ không ảnh hưởng vì hiện tại DB chưa có data Place nào)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS places CASCADE;

-- 2. Tạo lại bảng places với cấu trúc CHUẨN (id là BIGSERIAL) và CỘT MỚI (post_count, review_count)
CREATE TABLE places (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    average_rating DOUBLE PRECISION,
    category VARCHAR(50) NOT NULL,
    cover_image_url VARCHAR(500),
    address VARCHAR(500),
    post_count INTEGER NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tạo lại bảng reviews với cấu trúc CHUẨN
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    place_id BIGINT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Thêm các cột V12 còn thiếu vào bảng posts 
ALTER TABLE posts DROP COLUMN IF EXISTS post_type;
ALTER TABLE posts ADD COLUMN post_type VARCHAR(20) DEFAULT 'NORMAL' NOT NULL;

ALTER TABLE posts DROP COLUMN IF EXISTS place_id;
ALTER TABLE posts ADD COLUMN place_id BIGINT REFERENCES places(id) ON DELETE SET NULL;

ALTER TABLE posts DROP COLUMN IF EXISTS rating;
ALTER TABLE posts ADD COLUMN rating INTEGER;
