-- ============================================
-- SAMPLE DATA FOR MAPIC APPLICATION
-- ============================================
-- This file contains comprehensive sample data for testing
-- Includes: Users, Places, Reviews, Friendships, and Locations
-- Location focus: Ho Chi Minh City, Vietnam
-- ============================================

-- Clear existing data (optional - uncomment if needed)
-- TRUNCATE TABLE reviews CASCADE;
-- TRUNCATE TABLE friendships CASCADE;
-- TRUNCATE TABLE current_locations CASCADE;
-- TRUNCATE TABLE places CASCADE;
-- DELETE FROM users WHERE email LIKE '%@sample.com';

-- ============================================
-- USERS (30 users with Vietnamese names)
-- ============================================
-- Password for all users: "Password123!" (BCrypt hashed)
-- $2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5

INSERT INTO users (id, username, email, phone, password, nick_name, avatar_url, bio, is_active, email_verified, profile_visibility, created_at, updated_at) VALUES
-- Active users with public profiles
('11111111-1111-1111-1111-111111111111', 'nguyenvana', 'nguyenvana@sample.com', '0901234567', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Nguyễn Văn A', 'https://i.pravatar.cc/150?img=1', 'Yêu thích khám phá ẩm thực Sài Gòn 🍜', true, NOW(), 'PUBLIC', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'tranthib', 'tranthib@sample.com', '0901234568', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Trần Thị B', 'https://i.pravatar.cc/150?img=2', 'Coffee lover ☕ | Travel enthusiast ✈️', true, NOW(), 'PUBLIC', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'lequangc', 'lequangc@sample.com', '0901234569', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Lê Quang C', 'https://i.pravatar.cc/150?img=3', 'Photographer 📸 | Saigon explorer', true, NOW(), 'PUBLIC', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'phamthid', 'phamthid@sample.com', '0901234570', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Phạm Thị D', 'https://i.pravatar.cc/150?img=4', 'Foodie 🍲 | Love trying new restaurants', true, NOW(), 'PUBLIC', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'hoangvane', 'hoangvane@sample.com', '0901234571', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Hoàng Văn E', 'https://i.pravatar.cc/150?img=5', 'Tech enthusiast 💻 | Startup founder', true, NOW(), 'PUBLIC', NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'vothif', 'vothif@sample.com', '0901234572', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Võ Thị F', 'https://i.pravatar.cc/150?img=6', 'Art lover 🎨 | Museum enthusiast', true, NOW(), 'PUBLIC', NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'dangvanG', 'dangvang@sample.com', '0901234573', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Đặng Văn G', 'https://i.pravatar.cc/150?img=7', 'Fitness trainer 💪 | Healthy lifestyle', true, NOW(), 'PUBLIC', NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'buithih', 'buithih@sample.com', '0901234574', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Bùi Thị H', 'https://i.pravatar.cc/150?img=8', 'Shopping addict 🛍️ | Fashion blogger', true, NOW(), 'PUBLIC', NOW(), NOW()),
('99999999-9999-9999-9999-999999999999', 'dovani', 'dovani@sample.com', '0901234575', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Đỗ Văn I', 'https://i.pravatar.cc/150?img=9', 'Music lover 🎵 | Concert goer', true, NOW(), 'PUBLIC', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ngothij', 'ngothij@sample.com', '0901234576', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Ngô Thị J', 'https://i.pravatar.cc/150?img=10', 'Book worm 📚 | Coffee shop hopper', true, NOW(), 'PUBLIC', NOW(), NOW()),

-- Users with FRIENDS_ONLY visibility
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'lyquangk', 'lyquangk@sample.com', '0901234577', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Lý Quang K', 'https://i.pravatar.cc/150?img=11', 'Private person | Friends only', true, NOW(), 'FRIENDS_ONLY', NOW(), NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'duongthil', 'duongthil@sample.com', '0901234578', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Dương Thị L', 'https://i.pravatar.cc/150?img=12', 'Selective sharing 🔒', true, NOW(), 'FRIENDS_ONLY', NOW(), NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'tranvanm', 'tranvanm@sample.com', '0901234579', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Trần Văn M', 'https://i.pravatar.cc/150?img=13', 'Friends circle only', true, NOW(), 'FRIENDS_ONLY', NOW(), NOW()),

-- Users with PRIVATE visibility
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'phamthin', 'phamthin@sample.com', '0901234580', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Phạm Thị N', 'https://i.pravatar.cc/150?img=14', 'Very private', true, NOW(), 'PRIVATE', NOW(), NOW()),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'levano', 'levano@sample.com', '0901234581', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Lê Văn O', 'https://i.pravatar.cc/150?img=15', 'Ghost mode 👻', true, NOW(), 'PRIVATE', NOW(), NOW()),

-- More active users
('10101010-1010-1010-1010-101010101010', 'nguyenthip', 'nguyenthip@sample.com', '0901234582', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Nguyễn Thị P', 'https://i.pravatar.cc/150?img=16', 'Nature lover 🌿 | Park explorer', true, NOW(), 'PUBLIC', NOW(), NOW()),
('20202020-2020-2020-2020-202020202020', 'trinhvanq', 'trinhvanq@sample.com', '0901234583', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Trịnh Văn Q', 'https://i.pravatar.cc/150?img=17', 'History buff 🏛️ | Museum guide', true, NOW(), 'PUBLIC', NOW(), NOW()),
('30303030-3030-3030-3030-303030303030', 'vuthir', 'vuthir@sample.com', '0901234584', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Vũ Thị R', 'https://i.pravatar.cc/150?img=18', 'Hotel reviewer ⭐ | Travel blogger', true, NOW(), 'PUBLIC', NOW(), NOW()),
('40404040-4040-4040-4040-404040404040', 'maivans', 'maivans@sample.com', '0901234585', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Mai Văn S', 'https://i.pravatar.cc/150?img=19', 'Entertainment seeker 🎬 | Movie fan', true, NOW(), 'PUBLIC', NOW(), NOW()),
('50505050-5050-5050-5050-505050505050', 'dinhthit', 'dinhthit@sample.com', '0901234586', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Đinh Thị T', 'https://i.pravatar.cc/150?img=20', 'Shopaholic 💳 | Deal hunter', true, NOW(), 'PUBLIC', NOW(), NOW()),

-- Additional users for variety
('60606060-6060-6060-6060-606060606060', 'caovanu', 'caovanu@sample.com', '0901234587', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Cao Văn U', 'https://i.pravatar.cc/150?img=21', 'Street food expert 🍜', true, NOW(), 'PUBLIC', NOW(), NOW()),
('70707070-7070-7070-7070-707070707070', 'tathiv', 'tathiv@sample.com', '0901234588', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Tạ Thị V', 'https://i.pravatar.cc/150?img=22', 'Yoga instructor 🧘 | Wellness coach', true, NOW(), 'PUBLIC', NOW(), NOW()),
('80808080-8080-8080-8080-808080808080', 'phantomw', 'phantomw@sample.com', '0901234589', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Phan Thị W', 'https://i.pravatar.cc/150?img=23', 'Dessert lover 🍰 | Bakery hopper', true, NOW(), 'PUBLIC', NOW(), NOW()),
('90909090-9090-9090-9090-909090909090', 'quachvanx', 'quachvanx@sample.com', '0901234590', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Quách Văn X', 'https://i.pravatar.cc/150?img=24', 'Craft beer enthusiast 🍺', true, NOW(), 'PUBLIC', NOW(), NOW()),
('a0a0a0a0-a0a0-a0a0-a0a0-a0a0a0a0a0a0', 'dangthiy', 'dangthiy@sample.com', '0901234591', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Đặng Thị Y', 'https://i.pravatar.cc/150?img=25', 'Vintage shop hunter 🛍️', true, NOW(), 'PUBLIC', NOW(), NOW()),

-- Last batch
('b0b0b0b0-b0b0-b0b0-b0b0-b0b0b0b0b0b0', 'nguyenvanz', 'nguyenvanz@sample.com', '0901234592', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Nguyễn Văn Z', 'https://i.pravatar.cc/150?img=26', 'Night market explorer 🌙', true, NOW(), 'PUBLIC', NOW(), NOW()),
('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0', 'tranthiaa', 'tranthiaa@sample.com', '0901234593', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Trần Thị AA', 'https://i.pravatar.cc/150?img=27', 'Rooftop bar lover 🍹', true, NOW(), 'PUBLIC', NOW(), NOW()),
('d0d0d0d0-d0d0-d0d0-d0d0-d0d0d0d0d0d0', 'levanbb', 'levanbb@sample.com', '0901234594', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Lê Văn BB', 'https://i.pravatar.cc/150?img=28', 'Cycling enthusiast 🚴', true, NOW(), 'PUBLIC', NOW(), NOW()),
('e0e0e0e0-e0e0-e0e0-e0e0-e0e0e0e0e0e0', 'phamthicc', 'phamthicc@sample.com', '0901234595', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Phạm Thị CC', 'https://i.pravatar.cc/150?img=29', 'Spa & wellness 💆', true, NOW(), 'PUBLIC', NOW(), NOW()),
('f0f0f0f0-f0f0-f0f0-f0f0-f0f0f0f0f0f0', 'hoangvandd', 'hoangvandd@sample.com', '0901234596', '$2a$10$rN8qJ5K5Z5Z5Z5Z5Z5Z5Z.Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', 'Hoàng Văn DD', 'https://i.pravatar.cc/150?img=30', 'Local guide 🗺️ | City expert', true, NOW(), 'PUBLIC', NOW(), NOW());


-- ============================================
-- PLACES (50 places in Ho Chi Minh City)
-- ============================================

INSERT INTO places (name, description, latitude, longitude, average_rating, category, cover_image_url, address, created_at, updated_at) VALUES
-- RESTAURANTS (15 places)
('Phở Hòa Pasteur', 'Quán phở truyền thống nổi tiếng với nước dùng đậm đà, thịt bò tươi ngon. Mở cửa từ năm 1968.', 10.7769, 106.6951, 4.5, 'RESTAURANT', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800', '260C Pasteur, Phường 8, Quận 3, TP.HCM', NOW(), NOW()),
('Cơm Tấm Mộc', 'Cơm tấm sườn nướng thơm ngon, giá cả phải chăng. Đặc biệt là nước mắm pha chuẩn vị.', 10.7626, 106.6820, 4.3, 'RESTAURANT', 'https://images.unsplash.com/photo-1596040033229-a0b3b7e5e3e8?w=800', '11 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM', NOW(), NOW()),
('Bánh Xèo 46A', 'Bánh xèo giòn rụm, nhân đầy đặn với tôm, thịt, giá đỗ. Kèm rau sống và nước chấm đặc biệt.', 10.7691, 106.6937, 4.6, 'RESTAURANT', 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800', '46A Đinh Công Tráng, Phường Tân Định, Quận 1, TP.HCM', NOW(), NOW()),
('Bún Bò Huế Đông Ba', 'Bún bò Huế chuẩn vị xứ Huế, nước dùng đậm đà, cay nồng. Chả cua và giò heo tự làm.', 10.7543, 106.6621, 4.4, 'RESTAURANT', 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800', '02 Lý Chính Thắng, Phường 7, Quận 3, TP.HCM', NOW(), NOW()),
('Quán Ốc Oanh', 'Hải sản tươi sống, đặc biệt là ốc hấp sả, nghêu hấp xả. Không gian thoáng mát.', 10.7821, 106.6952, 4.2, 'RESTAURANT', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', '206 Võ Văn Tần, Phường 5, Quận 3, TP.HCM', NOW(), NOW()),
('Lẩu Thái Smile', 'Lẩu Thái Tom Yum chuẩn vị, hải sản tươi ngon. Phục vụ nhiệt tình, giá hợp lý.', 10.7729, 106.7009, 4.5, 'RESTAURANT', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800', '88 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1, TP.HCM', NOW(), NOW()),
('Bò Tơ Quán Mộc', 'Bò tơ tây ninh nướng lá lốt, bò nướng sa tế thơm ngon. Không gian sân vườn thoáng mát.', 10.8012, 106.6543, 4.3, 'RESTAURANT', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', '123 Hoàng Văn Thụ, Phường 8, Quận Phú Nhuận, TP.HCM', NOW(), NOW()),
('Gà Nướng Ụ Gà', 'Gà nướng mật ong, gà nướng muối ớt thơm phức. Kèm cơm lam và rau rừng.', 10.7456, 106.6789, 4.4, 'RESTAURANT', 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800', '45 Nguyễn Thị Minh Khai, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Lẩu Nấm Ashima', 'Lẩu nấm chay thanh đạm, nước dùng ngọt từ nấm. Rau củ tươi ngon, đa dạng.', 10.7623, 106.6912, 4.1, 'RESTAURANT', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800', '67 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Cháo Lòng Bà Út', 'Cháo lòng nóng hổi, lòng heo tươi ngon. Quẩy giòn, hành phi thơm. Mở cửa từ 5h sáng.', 10.7589, 106.6734, 4.6, 'RESTAURANT', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', '234 Trần Hưng Đạo, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM', NOW(), NOW()),
('Bún Riêu Cô Ba', 'Bún riêu cua đồng chuẩn vị miền Bắc. Riêu cua tự làm, nước dùng ngọt thanh.', 10.7712, 106.6845, 4.3, 'RESTAURANT', 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800', '156 Lê Thánh Tôn, Phường Bến Thành, Quận 1, TP.HCM', NOW(), NOW()),
('Hủ Tiếu Nam Vang Mỹ Tho', 'Hủ tiếu Nam Vang nước trong, ngọt thanh. Tôm, thịt, gan, tim tươi ngon.', 10.7534, 106.6912, 4.5, 'RESTAURANT', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800', '78 Nguyễn Trãi, Phường Phạm Ngũ Lão, Quận 1, TP.HCM', NOW(), NOW()),
('Mì Quảng 1A', 'Mì Quảng Đà Nẵng chính gốc. Nước dùng đậm đà, bánh tráng nướng giòn tan.', 10.7678, 106.6823, 4.4, 'RESTAURANT', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800', '1A Nguyễn Văn Tráng, Phường Bến Thành, Quận 1, TP.HCM', NOW(), NOW()),
('Bánh Canh Cua 87', 'Bánh canh cua đồng, nước dùng ngọt từ xương heo. Cua tươi, thịt heo băm.', 10.7801, 106.6967, 4.2, 'RESTAURANT', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800', '87 Trần Quang Khải, Phường Tân Định, Quận 1, TP.HCM', NOW(), NOW()),
('Chè Thái Sầu Riêng', 'Chè Thái sầu riêng béo ngậy, trái cây tươi ngon. Nước cốt dừa thơm, đá bào mịn.', 10.7645, 106.6789, 4.7, 'RESTAURANT', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800', '123 Nguyễn Văn Cừ, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM', NOW(), NOW()),

-- HOTELS (10 places)
('Saigon Prince Hotel', 'Khách sạn 4 sao sang trọng, view đẹp, gần trung tâm. Phòng rộng rãi, tiện nghi đầy đủ.', 10.7756, 106.7019, 4.4, 'HOTEL', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', '63 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Liberty Central Saigon Riverside', 'Khách sạn ven sông Sài Gòn, view sông tuyệt đẹp. Bể bơi rooftop, nhà hàng cao cấp.', 10.7689, 106.7045, 4.5, 'HOTEL', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', '17 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Silverland Sakyo Hotel', 'Khách sạn boutique phong cách Nhật Bản. Thiết kế tối giản, sang trọng.', 10.7723, 106.7001, 4.3, 'HOTEL', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800', '45 Thái Văn Lung, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Alagon Saigon Hotel', 'Khách sạn hiện đại, vị trí trung tâm. Phòng ốc sạch sẽ, nhân viên thân thiện.', 10.7734, 106.6989, 4.2, 'HOTEL', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', '203 Nguyễn Thị Minh Khai, Phường 6, Quận 3, TP.HCM', NOW(), NOW()),
('Fusion Suites Saigon', 'Căn hộ dịch vụ cao cấp, bếp đầy đủ. Phù hợp gia đình, lưu trú dài ngày.', 10.7812, 106.6934, 4.6, 'HOTEL', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', '3 Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('The Myst Dong Khoi', 'Khách sạn boutique sang trọng, thiết kế độc đáo. Bar rooftop view đẹp.', 10.7745, 106.7023, 4.5, 'HOTEL', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', '6-8 Hồ Huấn Nghiệp, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Eastin Grand Hotel Saigon', 'Khách sạn 5 sao quốc tế, tiện nghi đẳng cấp. Spa, gym, bể bơi hiện đại.', 10.7801, 106.6956, 4.4, 'HOTEL', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', '253 Nguyễn Văn Trỗi, Phường 10, Quận Phú Nhuận, TP.HCM', NOW(), NOW()),
('Pullman Saigon Centre', 'Khách sạn 5 sao trung tâm, kết nối trung tâm thương mại. Phòng view thành phố.', 10.7789, 106.7012, 4.3, 'HOTEL', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', '148 Tran Hung Dao, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM', NOW(), NOW()),
('Majestic Saigon Hotel', 'Khách sạn lịch sử từ 1925, kiến trúc thuộc địa Pháp. View sông Sài Gòn tuyệt đẹp.', 10.7701, 106.7056, 4.7, 'HOTEL', 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800', '1 Đồng Khởi, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Caravelle Saigon', 'Khách sạn 5 sao lâu đời, nổi tiếng từ thời chiến tranh. Rooftop bar Saigon Saigon huyền thoại.', 10.7767, 106.7034, 4.6, 'HOTEL', 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800', '19 Lam Sơn Square, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),

-- PARKS (8 places)
('Công Viên Tao Đàn', 'Công viên xanh mát giữa lòng thành phố. Nhiều người tập thể dục buổi sáng, chim chóc hót líu lo.', 10.7789, 106.6923, 4.3, 'PARK', 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800', 'Trương Định, Phường Bến Thành, Quận 1, TP.HCM', NOW(), NOW()),
('Công Viên 23/9', 'Công viên rộng lớn, có hồ nước, cây xanh. Phù hợp dã ngoại, chạy bộ, đạp xe.', 10.7689, 106.6601, 4.2, 'PARK', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', 'Phạm Ngũ Lão, Phường 2, Quận 1, TP.HCM', NOW(), NOW()),
('Công Viên Gia Định', 'Công viên lớn nhất Sài Gòn, có hồ, cầu, thác nước. Không gian yên tĩnh, thoáng mát.', 10.8123, 106.6789, 4.5, 'PARK', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800', 'Hoàng Minh Giám, Phường 9, Quận Phú Nhuận, TP.HCM', NOW(), NOW()),
('Công Viên Lê Văn Tám', 'Công viên nhỏ xinh, nhiều cây xanh. Phù hợp đi dạo, ngồi thư giãn.', 10.7823, 106.6945, 4.1, 'PARK', 'https://images.unsplash.com/photo-1571988840298-3b5301d5109b?w=800', 'Điện Biên Phủ, Phường Đa Kao, Quận 1, TP.HCM', NOW(), NOW()),
('Công Viên Hoàng Văn Thụ', 'Công viên yên tĩnh, ít người. Phù hợp đọc sách, ngồi thư giãn.', 10.8034, 106.6712, 4.0, 'PARK', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM', NOW(), NOW()),
('Công Viên Văn Hóa Đầm Sen', 'Khu vui chơi giải trí lớn, có hồ sen, trò chơi. Phù hợp gia đình, trẻ em.', 10.7656, 106.6234, 4.4, 'PARK', 'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?w=800', '03 Hòa Bình, Phường 3, Quận 11, TP.HCM', NOW(), NOW()),
('Công Viên Tân Cảng', 'Công viên ven sông, view đẹp. Phù hợp chạy bộ, đạp xe, ngắm hoàng hôn.', 10.7912, 106.7123, 4.3, 'PARK', 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800', 'Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, TP.HCM', NOW(), NOW()),
('Công Viên Bách Đằng', 'Công viên nhỏ ven sông, view đẹp. Phù hợp ngồi thư giãn, ngắm sông.', 10.7734, 106.7089, 4.2, 'PARK', 'https://images.unsplash.com/photo-1587502537147-2ba64a62e3d5?w=800', 'Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),

-- MUSEUMS (7 places)
('Bảo Tàng Chứng Tích Chiến Tranh', 'Bảo tàng lịch sử chiến tranh Việt Nam. Nhiều hiện vật, tài liệu quý giá.', 10.7797, 106.6919, 4.6, 'MUSEUM', 'https://images.unsplash.com/photo-1565173953406-e4c8e6a6f0e3?w=800', '28 Võ Văn Tần, Phường 6, Quận 3, TP.HCM', NOW(), NOW()),
('Bảo Tàng Thành Phố Hồ Chí Minh', 'Bảo tàng lịch sử thành phố, kiến trúc đẹp. Trưng bày hiện vật từ thời Pháp thuộc.', 10.7701, 106.6989, 4.4, 'MUSEUM', 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800', '65 Lý Tự Trọng, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Dinh Độc Lập', 'Di tích lịch sử quan trọng, kiến trúc độc đáo. Nơi diễn ra sự kiện lịch sử 30/4/1975.', 10.7769, 106.6956, 4.7, 'MUSEUM', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800', '135 Nam Kỳ Khởi Nghĩa, Phường Bến Thành, Quận 1, TP.HCM', NOW(), NOW()),
('Bảo Tàng Mỹ Thuật', 'Bảo tàng nghệ thuật, trưng bày tranh, điêu khắc. Kiến trúc Pháp cổ đẹp.', 10.7689, 106.6934, 4.3, 'MUSEUM', 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800', '97A Phó Đức Chính, Phường Nguyễn Thái Bình, Quận 1, TP.HCM', NOW(), NOW()),
('Bảo Tàng Lịch Sử Việt Nam', 'Bảo tàng lịch sử từ thời tiền sử đến hiện đại. Nhiều hiện vật quý giá.', 10.7878, 106.7012, 4.5, 'MUSEUM', 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800', '02 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Bảo Tàng Áo Dài', 'Bảo tàng áo dài truyền thống Việt Nam. Trưng bày áo dài qua các thời kỳ.', 10.7234, 106.7123, 4.4, 'MUSEUM', 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=800', '206 Đường 61, Phường Thảo Điền, Quận 2, TP.HCM', NOW(), NOW()),
('Nhà Thờ Đức Bà', 'Nhà thờ cổ từ thời Pháp thuộc, kiến trúc Gothic đẹp. Biểu tượng của Sài Gòn.', 10.7797, 106.6990, 4.8, 'MUSEUM', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', '01 Công xã Paris, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),

-- SHOPPING (5 places)
('Vincom Center Đồng Khởi', 'Trung tâm thương mại cao cấp, nhiều thương hiệu quốc tế. Nhà hàng, rạp phim đầy đủ.', 10.7756, 106.7023, 4.4, 'SHOPPING', 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800', '72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Saigon Centre', 'Trung tâm mua sắm hiện đại, nhiều cửa hàng thời trang. Kết nối với khách sạn Pullman.', 10.7789, 106.7012, 4.3, 'SHOPPING', 'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=800', '65 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Takashimaya Saigon Centre', 'Trung tâm thương mại Nhật Bản, hàng hóa chất lượng cao. Tầng hầm có siêu thị thực phẩm Nhật.', 10.7823, 106.7001, 4.5, 'SHOPPING', 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800', '92-94 Nam Kỳ Khởi Nghĩa, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Chợ Bến Thành', 'Chợ truyền thống nổi tiếng, biểu tượng Sài Gòn. Mua sắm đồ lưu niệm, thực phẩm.', 10.7723, 106.6978, 4.2, 'SHOPPING', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 'Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM', NOW(), NOW()),
('Diamond Plaza', 'Trung tâm thương mại lâu đời, nhiều cửa hàng thời trang. Có rạp phim, khu ẩm thực.', 10.7812, 106.7023, 4.1, 'SHOPPING', 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800', '34 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),

-- ENTERTAINMENT (5 places)
('Nhà Hát Thành Phố', 'Nhà hát opera từ thời Pháp thuộc, kiến trúc đẹp. Biểu diễn nhạc kịch, ballet.', 10.7767, 106.7023, 4.6, 'ENTERTAINMENT', 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800', '07 Công Trường Lam Sơn, Phường Bến Nghé, Quận 1, TP.HCM', NOW(), NOW()),
('Rạp CGV Vincom Center', 'Rạp chiếu phim hiện đại, màn hình lớn, âm thanh tốt. Ghế ngồi thoải mái.', 10.7756, 106.7023, 4.4, 'ENTERTAINMENT', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', 'Tầng 4, Vincom Center, 72 Lê Thánh Tôn, Quận 1, TP.HCM', NOW(), NOW()),
('Acoustic Bar', 'Quán bar nhạc sống, không gian ấm cúng. Ca sĩ hát hay, nhạc acoustic nhẹ nhàng.', 10.7734, 106.7001, 4.3, 'ENTERTAINMENT', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800', '6E1 Ngo Thoi Nhiem, Phường 7, Quận 3, TP.HCM', NOW(), NOW()),
('Saigon Skydeck', 'Đài quan sát cao nhất Sài Gòn, view 360 độ. Ngắm toàn cảnh thành phố từ tầng 49.', 10.7723, 106.7045, 4.5, 'ENTERTAINMENT', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', 'Tầng 49, Bitexco Financial Tower, 2 Hải Triều, Quận 1, TP.HCM', NOW(), NOW()),
('Bowling Superbowl', 'Sân bowling hiện đại, nhiều làn chơi. Phù hợp gia đình, bạn bè vui chơi.', 10.7789, 106.7012, 4.2, 'ENTERTAINMENT', 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800', 'Tầng 5, Saigon Centre, 65 Lê Lợi, Quận 1, TP.HCM', NOW(), NOW());


-- ============================================
-- CURRENT LOCATIONS (20 users with locations)
-- ============================================

INSERT INTO current_locations (user_id, latitude, longitude, heading, speed, battery_level, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 10.7769, 106.6951, 45.5, 0.0, 85, NOW()),
('22222222-2222-2222-2222-222222222222', 10.7626, 106.6820, 120.3, 2.5, 72, NOW()),
('33333333-3333-3333-3333-333333333333', 10.7691, 106.6937, 180.0, 0.0, 90, NOW()),
('44444444-4444-4444-4444-444444444444', 10.7543, 106.6621, 270.5, 1.2, 65, NOW()),
('55555555-5555-5555-5555-555555555555', 10.7821, 106.6952, 90.0, 0.0, 88, NOW()),
('66666666-6666-6666-6666-666666666666', 10.7729, 106.7009, 45.0, 0.5, 78, NOW()),
('77777777-7777-7777-7777-777777777777', 10.8012, 106.6543, 135.0, 3.0, 55, NOW()),
('88888888-8888-8888-8888-888888888888', 10.7456, 106.6789, 225.0, 0.0, 92, NOW()),
('99999999-9999-9999-9999-999999999999', 10.7623, 106.6912, 315.0, 1.8, 70, NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 10.7589, 106.6734, 0.0, 0.0, 95, NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 10.7712, 106.6845, 60.0, 2.0, 68, NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 10.7534, 106.6912, 150.0, 0.0, 82, NOW()),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 10.7678, 106.6823, 240.0, 1.5, 75, NOW()),
('10101010-1010-1010-1010-101010101010', 10.7801, 106.6967, 330.0, 0.0, 88, NOW()),
('20202020-2020-2020-2020-202020202020', 10.7645, 106.6789, 30.0, 0.8, 91, NOW()),
('30303030-3030-3030-3030-303030303030', 10.7756, 106.7019, 120.0, 0.0, 73, NOW()),
('40404040-4040-4040-4040-404040404040', 10.7689, 106.7045, 210.0, 2.2, 66, NOW()),
('50505050-5050-5050-5050-505050505050', 10.7723, 106.7001, 300.0, 0.0, 84, NOW()),
('60606060-6060-6060-6060-606060606060', 10.7734, 106.6989, 15.0, 1.0, 79, NOW()),
('70707070-7070-7070-7070-707070707070', 10.7812, 106.6934, 105.0, 0.0, 87, NOW());

-- ============================================
-- FRIENDSHIPS (30 friendships with various statuses)
-- ============================================

INSERT INTO friendships (user_id_1, user_id_2, status, created_at) VALUES
-- ACCEPTED friendships (mutual friends)
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'ACCEPTED', NOW() - INTERVAL '30 days'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'ACCEPTED', NOW() - INTERVAL '25 days'),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'ACCEPTED', NOW() - INTERVAL '20 days'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'ACCEPTED', NOW() - INTERVAL '28 days'),
('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'ACCEPTED', NOW() - INTERVAL '15 days'),
('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'ACCEPTED', NOW() - INTERVAL '22 days'),
('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'ACCEPTED', NOW() - INTERVAL '18 days'),
('44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'ACCEPTED', NOW() - INTERVAL '12 days'),
('55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'ACCEPTED', NOW() - INTERVAL '10 days'),
('66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'ACCEPTED', NOW() - INTERVAL '14 days'),
('66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', 'ACCEPTED', NOW() - INTERVAL '8 days'),
('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ACCEPTED', NOW() - INTERVAL '16 days'),
('88888888-8888-8888-8888-888888888888', '99999999-9999-9999-9999-999999999999', 'ACCEPTED', NOW() - INTERVAL '11 days'),
('88888888-8888-8888-8888-888888888888', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ACCEPTED', NOW() - INTERVAL '9 days'),
('99999999-9999-9999-9999-999999999999', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ACCEPTED', NOW() - INTERVAL '7 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ACCEPTED', NOW() - INTERVAL '13 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'ACCEPTED', NOW() - INTERVAL '6 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'ACCEPTED', NOW() - INTERVAL '5 days'),

-- PENDING friendships (waiting for acceptance)
('11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'PENDING', NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 'PENDING', NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 'PENDING', NOW() - INTERVAL '3 days'),
('44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 'PENDING', NOW() - INTERVAL '4 days'),
('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PENDING', NOW() - INTERVAL '1 day'),
('66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PENDING', NOW() - INTERVAL '2 days'),
('10101010-1010-1010-1010-101010101010', '20202020-2020-2020-2020-202020202020', 'PENDING', NOW() - INTERVAL '1 day'),
('30303030-3030-3030-3030-303030303030', '40404040-4040-4040-4040-404040404040', 'PENDING', NOW() - INTERVAL '3 days'),

-- REJECTED friendships
('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 'REJECTED', NOW() - INTERVAL '10 days'),
('99999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'REJECTED', NOW() - INTERVAL '8 days'),

-- BLOCKED friendships
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'BLOCKED', NOW() - INTERVAL '15 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'BLOCKED', NOW() - INTERVAL '12 days');

