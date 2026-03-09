-- Seed Avatar Frames Data
-- This file contains 20+ avatar frames with various types and unlock conditions

-- Free Basic Frames (Always unlocked for all users)
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order, is_seasonal, available_from, available_until) VALUES
('frame_basic_circle', 'Classic Circle', 'Simple circular frame', 'CIRCULAR', 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 Z', false, null, null, 1, false, null, null),
('frame_basic_square', 'Classic Square', 'Simple square frame', 'SQUARE', 'M10,10 L90,10 L90,90 L10,90 Z', false, null, null, 2, false, null, null),
('frame_basic_heart', 'Lovely Heart', 'Heart-shaped frame', 'HEART', 'M50,85 L20,55 Q10,45 10,35 Q10,20 25,15 Q35,10 45,20 L50,25 L55,20 Q65,10 75,15 Q90,20 90,35 Q90,45 80,55 Z', false, null, null, 3, false, null, null);

-- Frames unlocked by interactions
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order, is_seasonal, available_from, available_until) VALUES
('frame_social_star', 'Social Star', 'For active socializers', 'STAR', 'M50,10 L60,40 L90,40 L65,60 L75,90 L50,70 L25,90 L35,60 L10,40 L40,40 Z', false, 'SEND_INTERACTIONS', 50, 4, false, null, null),
('frame_heart_sender', 'Heart Sender', 'Send 100 hearts', 'HEART', 'M50,85 L20,55 Q10,45 10,35 Q10,20 25,15 Q35,10 45,20 L50,25 L55,20 Q65,10 75,15 Q90,20 90,35 Q90,45 80,55 Z', false, 'SEND_HEARTS', 100, 5, false, null, null),
('frame_wave_master', 'Wave Master', 'Send 100 waves', 'CIRCULAR', 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 Z', false, 'SEND_WAVES', 100, 6, false, null, null);

-- Frames unlocked by location check-ins
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order, is_seasonal, available_from, available_until) VALUES
('frame_explorer', 'Explorer', 'Visit 10 different places', 'HEXAGON', 'M50,10 L85,30 L85,70 L50,90 L15,70 L15,30 Z', false, 'VISIT_PLACES', 10, 7, false, null, null),
('frame_wanderer', 'Wanderer', 'Visit 50 different places', 'DIAMOND', 'M50,10 L90,50 L50,90 L10,50 Z', false, 'VISIT_PLACES', 50, 8, false, null, null),
('frame_globe_trotter', 'Globe Trotter', 'Visit 100 different places', 'STAR', 'M50,10 L60,40 L90,40 L65,60 L75,90 L50,70 L25,90 L35,60 L10,40 L40,40 Z', false, 'VISIT_PLACES', 100, 9, false, null, null);

-- Premium Frames
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order, is_seasonal, available_from, available_until) VALUES
('frame_premium_neon', 'Neon Glow', 'Glowing neon frame', 'NEON', 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 Z', true, 'PREMIUM', null, 10, false, null, null),
('frame_premium_diamond', 'Diamond Elite', 'Exclusive diamond frame', 'DIAMOND', 'M50,10 L90,50 L50,90 L10,50 Z', true, 'PREMIUM', null, 11, false, null, null),
('frame_premium_flower', 'Blooming Flower', 'Beautiful flower frame', 'FLOWER', 'M50,20 Q60,10 70,20 Q80,30 70,40 Q80,50 70,60 Q80,70 70,80 Q60,90 50,80 Q40,90 30,80 Q20,70 30,60 Q20,50 30,40 Q20,30 30,20 Q40,10 50,20 Z', true, 'PREMIUM', null, 12, false, null, null);

-- Seasonal Frames
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order, is_seasonal, available_from, available_until) VALUES
('frame_summer_sun', 'Summer Sun', 'Bright summer frame', 'STAR', 'M50,10 L60,40 L90,40 L65,60 L75,90 L50,70 L25,90 L35,60 L10,40 L40,40 Z', false, 'SEASONAL', null, 13, true, '2024-06-01', '2024-08-31'),
('frame_winter_snow', 'Winter Snowflake', 'Icy winter frame', 'STAR', 'M50,10 L60,40 L90,40 L65,60 L75,90 L50,70 L25,90 L35,60 L10,40 L40,40 Z', false, 'SEASONAL', null, 14, true, '2024-12-01', '2025-02-28'),
('frame_spring_flower', 'Spring Blossom', 'Fresh spring frame', 'FLOWER', 'M50,20 Q60,10 70,20 Q80,30 70,40 Q80,50 70,60 Q80,70 70,80 Q60,90 50,80 Q40,90 30,80 Q20,70 30,60 Q20,50 30,40 Q20,30 30,20 Q40,10 50,20 Z', false, 'SEASONAL', null, 15, true, '2024-03-01', '2024-05-31'),
('frame_autumn_leaf', 'Autumn Leaves', 'Warm autumn frame', 'HEART', 'M50,85 L20,55 Q10,45 10,35 Q10,20 25,15 Q35,10 45,20 L50,25 L55,20 Q65,10 75,15 Q90,20 90,35 Q90,45 80,55 Z', false, 'SEASONAL', null, 16, true, '2024-09-01', '2024-11-30');

-- Achievement-based Frames
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order, is_seasonal, available_from, available_until) VALUES
('frame_friend_magnet', 'Friend Magnet', 'Have 50 friends', 'CIRCULAR', 'M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10 Z', false, 'FRIEND_COUNT', 50, 17, false, null, null),
('frame_social_butterfly', 'Social Butterfly', 'Have 100 friends', 'FLOWER', 'M50,20 Q60,10 70,20 Q80,30 70,40 Q80,50 70,60 Q80,70 70,80 Q60,90 50,80 Q40,90 30,80 Q20,70 30,60 Q20,50 30,40 Q20,30 30,20 Q40,10 50,20 Z', false, 'FRIEND_COUNT', 100, 18, false, null, null);

-- Special Event Frames
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order, is_seasonal, available_from, available_until) VALUES
('frame_birthday', 'Birthday Special', 'Celebrate your birthday', 'BADGE', 'M50,10 L65,35 L90,35 L70,55 L80,80 L50,65 L20,80 L30,55 L10,35 L35,35 Z', false, 'BIRTHDAY', null, 19, false, null, null),
('frame_anniversary', 'Anniversary', 'One year on the app', 'BADGE', 'M50,10 L65,35 L90,35 L70,55 L80,80 L50,65 L20,80 L30,55 L10,35 L35,35 Z', false, 'ANNIVERSARY', 365, 20, false, null, null);

-- Creative Frames
INSERT INTO avatar_frames (id, name, description, frame_type, svg_path, is_premium, unlock_condition, unlock_requirement_value, display_order, is_seasonal, available_from, available_until) VALUES
('frame_cloud', 'Dreamy Cloud', 'Soft cloud frame', 'CLOUD', 'M20,50 Q20,30 35,25 Q40,15 55,20 Q70,15 80,25 Q90,30 85,45 Q90,60 75,65 Q70,75 55,70 Q40,75 30,65 Q15,60 20,50 Z', false, 'SEND_INTERACTIONS', 200, 21, false, null, null),
('frame_hexagon_tech', 'Tech Hexagon', 'Modern hexagonal frame', 'HEXAGON', 'M50,10 L85,30 L85,70 L50,90 L15,70 L15,30 Z', false, 'VISIT_PLACES', 25, 22, false, null, null),
('frame_double_heart', 'Double Love', 'Two hearts intertwined', 'HEART', 'M35,85 L10,60 Q5,50 5,40 Q5,25 20,20 Q30,15 40,25 L45,30 L50,25 Q60,15 70,20 Q85,25 85,40 Q85,50 80,60 L55,85 L45,75 Z', false, 'SEND_HEARTS', 500, 23, false, null, null);

-- Unlock the basic frames for all existing users
-- This would typically be done in application code when a user signs up
-- For now, we'll leave it to be handled by the application
