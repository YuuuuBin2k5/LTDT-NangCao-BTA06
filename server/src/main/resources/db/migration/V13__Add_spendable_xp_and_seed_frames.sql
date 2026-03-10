-- Avatar Frame Levels Setup
-- 1. Add spendable_xp column to user_xp table
ALTER TABLE user_xp ADD COLUMN spendable_xp INTEGER NOT NULL DEFAULT 0;

-- Set initial spendable_xp equal to total_xp for existing users so they don't lose progress
UPDATE user_xp SET spendable_xp = total_xp;

-- 2. Clear existing avatar frames (Optional but good for clean start, relying on id for update)
-- We will just insert specific defined frames.
-- Level 1: Basic (0 EXP)
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order)
VALUES ('frame-1-basic', 'Người mới', 'Khung cơ bản dành cho mọi người', 'SQUARE', '', false, 'Đạt cấp độ 1', 0, 1)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, description = EXCLUDED.description, frame_type = EXCLUDED.frame_type, 
    is_premium = EXCLUDED.is_premium, unlock_requirement_value = EXCLUDED.unlock_requirement_value, display_order = EXCLUDED.display_order;

-- Level 2: Bronze (100 EXP)
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order)
VALUES ('frame-2-bronze', 'Đồng', 'Khung đồng dành cho người mới bắt đầu', 'CIRCULAR', '', false, 'Chi phí: 100 EXP', 100, 2)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, description = EXCLUDED.description, frame_type = EXCLUDED.frame_type, 
    is_premium = EXCLUDED.is_premium, unlock_requirement_value = EXCLUDED.unlock_requirement_value, display_order = EXCLUDED.display_order;

-- Level 3: Silver (500 EXP)
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order)
VALUES ('frame-3-silver', 'Bạc', 'Khung bạc mang lại vẻ đẹp chuyên nghiệp', 'CIRCULAR', '', false, 'Chi phí: 500 EXP', 500, 3)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, description = EXCLUDED.description, frame_type = EXCLUDED.frame_type, 
    is_premium = EXCLUDED.is_premium, unlock_requirement_value = EXCLUDED.unlock_requirement_value, display_order = EXCLUDED.display_order;

-- Level 4: Gold (1000 EXP)
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order)
VALUES ('frame-4-gold', 'Vàng', 'Khung vàng sang trọng', 'STAR', '', true, 'Chi phí: 1000 EXP', 1000, 4)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, description = EXCLUDED.description, frame_type = EXCLUDED.frame_type, 
    is_premium = EXCLUDED.is_premium, unlock_requirement_value = EXCLUDED.unlock_requirement_value, display_order = EXCLUDED.display_order;

-- Level 5: Diamond (2000 EXP)
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order)
VALUES ('frame-5-diamond', 'Kim cương', 'Khung kim cương lấp lánh', 'HEART', '', true, 'Chi phí: 2000 EXP', 2000, 5)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, description = EXCLUDED.description, frame_type = EXCLUDED.frame_type, 
    is_premium = EXCLUDED.is_premium, unlock_requirement_value = EXCLUDED.unlock_requirement_value, display_order = EXCLUDED.display_order;

-- Level 6: Neon (5000 EXP)
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order)
VALUES ('frame-6-neon', 'Neon', 'Khung Neon rực rỡ nhất', 'NEON', '', true, 'Chi phí: 5000 EXP', 5000, 6)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, description = EXCLUDED.description, frame_type = EXCLUDED.frame_type, 
    is_premium = EXCLUDED.is_premium, unlock_requirement_value = EXCLUDED.unlock_requirement_value, display_order = EXCLUDED.display_order;
