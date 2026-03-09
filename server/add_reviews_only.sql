-- ============================================
-- ADD REVIEWS ONLY
-- ============================================
-- This script only adds reviews to existing places
-- Run this AFTER you've already inserted users and places
-- ============================================

DO $$
DECLARE
    place_ids BIGINT[];
BEGIN
    -- Get array of place IDs (ordered by id)
    SELECT ARRAY_AGG(id ORDER BY id) INTO place_ids FROM places LIMIT 50;
    
    -- Check if we have places
    IF place_ids IS NULL OR array_length(place_ids, 1) IS NULL THEN
        RAISE NOTICE 'No places found in database. Please insert places first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found % places. Adding reviews...', array_length(place_ids, 1);
    
    -- Insert reviews for place 1
    IF array_length(place_ids, 1) >= 1 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[1], '11111111-1111-1111-1111-111111111111', 'Phở ngon tuyệt vời! Nước dùng đậm đà, thịt bò mềm. Quán đông khách nhưng phục vụ nhanh.', 5, true, NOW() - INTERVAL '5 days'),
        (place_ids[1], '22222222-2222-2222-2222-222222222222', 'Phở ở đây ăn từ nhỏ đến giờ, vẫn giữ được chất lượng. Giá hơi cao nhưng xứng đáng.', 5, true, NOW() - INTERVAL '10 days'),
        (place_ids[1], '33333333-3333-3333-3333-333333333333', 'Nước dùng ngon nhưng hơi mặn với mình. Thịt bò tươi, bánh phở dai.', 4, true, NOW() - INTERVAL '3 days'),
        (place_ids[1], '44444444-4444-4444-4444-444444444444', 'Quán đông lắm, phải đợi lâu. Nhưng phở ngon nên chấp nhận được.', 4, false, NOW() - INTERVAL '7 days');
    END IF;
    
    -- Insert reviews for place 2
    IF array_length(place_ids, 1) >= 2 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[2], '55555555-5555-5555-5555-555555555555', 'Cơm tấm sườn nướng thơm lừng, nước mắm pha chuẩn vị. Giá rẻ, phần ăn nhiều.', 5, true, NOW() - INTERVAL '2 days'),
        (place_ids[2], '66666666-6666-6666-6666-666666666666', 'Sườn nướng hơi khô, nhưng nhìn chung ổn. Nước mắm ngon.', 3, true, NOW() - INTERVAL '8 days'),
        (place_ids[2], '77777777-7777-7777-7777-777777777777', 'Quán sạch sẽ, phục vụ nhanh. Cơm tấm ngon, giá hợp lý.', 4, true, NOW() - INTERVAL '4 days');
    END IF;
    
    -- Insert reviews for place 3
    IF array_length(place_ids, 1) >= 3 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[3], '88888888-8888-8888-8888-888888888888', 'Bánh xèo giòn rụm, nhân đầy đặn. Rau sống tươi, nước chấm đặc biệt ngon!', 5, true, NOW() - INTERVAL '1 day'),
        (place_ids[3], '99999999-9999-9999-9999-999999999999', 'Ngon nhất Sài Gòn! Bánh giòn, không ngấy. Nhân tôm thịt nhiều.', 5, true, NOW() - INTERVAL '6 days'),
        (place_ids[3], 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Quán đông khách, phải đợi. Bánh xèo ngon nhưng hơi nhiều dầu.', 4, true, NOW() - INTERVAL '9 days'),
        (place_ids[3], 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bánh xèo ổn, nhưng không đặc biệt lắm. Giá hơi cao.', 3, false, NOW() - INTERVAL '12 days');
    END IF;
    
    -- Insert reviews for place 4
    IF array_length(place_ids, 1) >= 4 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[4], 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bún bò Huế chuẩn vị xứ Huế! Cay nồng, nước dùng đậm đà. Chả cua ngon.', 5, true, NOW() - INTERVAL '3 days'),
        (place_ids[4], 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Ngon nhưng hơi cay với mình. Giò heo mềm, thơm.', 4, true, NOW() - INTERVAL '7 days'),
        (place_ids[4], '11111111-1111-1111-1111-111111111111', 'Bún bò ngon, nhưng phần ăn hơi ít. Giá hợp lý.', 4, false, NOW() - INTERVAL '11 days');
    END IF;
    
    -- Insert reviews for place 5
    IF array_length(place_ids, 1) >= 5 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[5], '22222222-2222-2222-2222-222222222222', 'Ốc tươi, nấu ngon. Ốc hấp sả thơm phức, nghêu hấp xả ngọt.', 4, true, NOW() - INTERVAL '2 days'),
        (place_ids[5], '33333333-3333-3333-3333-333333333333', 'Hải sản tươi sống, giá hợp lý. Không gian thoáng mát.', 4, true, NOW() - INTERVAL '5 days'),
        (place_ids[5], '44444444-4444-4444-4444-444444444444', 'Ốc ngon nhưng phục vụ hơi chậm. Quán đông khách.', 3, true, NOW() - INTERVAL '8 days');
    END IF;
    
    -- Insert reviews for place 6
    IF array_length(place_ids, 1) >= 6 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[6], '55555555-5555-5555-5555-555555555555', 'Lẩu Thái Tom Yum chuẩn vị! Cay chua ngọt hài hòa. Hải sản tươi.', 5, true, NOW() - INTERVAL '1 day'),
        (place_ids[6], '66666666-6666-6666-6666-666666666666', 'Nước lẩu ngon, hải sản tươi. Phục vụ nhiệt tình. Sẽ quay lại!', 5, true, NOW() - INTERVAL '4 days'),
        (place_ids[6], '77777777-7777-7777-7777-777777777777', 'Lẩu ngon nhưng hơi cay. Giá hơi cao so với chất lượng.', 4, false, NOW() - INTERVAL '9 days');
    END IF;
    
    -- Insert reviews for place 7
    IF array_length(place_ids, 1) >= 7 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[7], '88888888-8888-8888-8888-888888888888', 'Bò tơ Tây Ninh nướng lá lốt thơm ngon! Không gian sân vườn mát mẻ.', 4, true, NOW() - INTERVAL '6 days'),
        (place_ids[7], '99999999-9999-9999-9999-999999999999', 'Bò nướng sa tế cay nồng, thơm. Giá hợp lý, phục vụ tốt.', 4, true, NOW() - INTERVAL '10 days');
    END IF;
    
    -- Insert reviews for place 8
    IF array_length(place_ids, 1) >= 8 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[8], 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Gà nướng mật ong ngon tuyệt! Da giòn, thịt mềm. Cơm lam thơm.', 5, true, NOW() - INTERVAL '3 days'),
        (place_ids[8], 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gà nướng muối ớt cay nồng, thơm phức. Rau rừng tươi ngon.', 4, true, NOW() - INTERVAL '7 days'),
        (place_ids[8], 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gà ngon nhưng hơi khô. Giá hơi cao.', 3, false, NOW() - INTERVAL '12 days');
    END IF;
    
    -- Insert reviews for place 9
    IF array_length(place_ids, 1) >= 9 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[9], 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lẩu nấm chay thanh đạm, ngọt từ nấm. Rau củ tươi, đa dạng.', 4, true, NOW() - INTERVAL '5 days'),
        (place_ids[9], '11111111-1111-1111-1111-111111111111', 'Nước lẩu ngọt thanh, không ngấy. Phù hợp ăn chay.', 4, true, NOW() - INTERVAL '9 days');
    END IF;
    
    -- Insert reviews for place 10
    IF array_length(place_ids, 1) >= 10 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[10], '22222222-2222-2222-2222-222222222222', 'Cháo lòng nóng hổi, lòng heo tươi ngon. Quẩy giòn tan!', 5, true, NOW() - INTERVAL '1 day'),
        (place_ids[10], '33333333-3333-3333-3333-333333333333', 'Cháo ngon, lòng nhiều. Hành phi thơm. Giá rẻ!', 5, true, NOW() - INTERVAL '4 days'),
        (place_ids[10], '44444444-4444-4444-4444-444444444444', 'Quán mở sớm, tiện ăn sáng. Cháo lòng đậm đà.', 4, true, NOW() - INTERVAL '8 days');
    END IF;
    
    -- Add more reviews for places 11-15
    IF array_length(place_ids, 1) >= 15 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[11], '55555555-5555-5555-5555-555555555555', 'Bún riêu cua đồng chuẩn vị miền Bắc. Riêu cua nhiều, nước dùng ngọt.', 4, true, NOW() - INTERVAL '2 days'),
        (place_ids[12], '77777777-7777-7777-7777-777777777777', 'Hủ tiếu Nam Vang nước trong, ngọt thanh. Tôm tươi, thịt mềm.', 5, true, NOW() - INTERVAL '3 days'),
        (place_ids[13], '99999999-9999-9999-9999-999999999999', 'Mì Quảng Đà Nẵng chính gốc! Nước dùng đậm, bánh tráng giòn.', 4, true, NOW() - INTERVAL '4 days'),
        (place_ids[14], 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bánh canh cua đồng ngon! Nước dùng ngọt từ xương heo.', 4, true, NOW() - INTERVAL '5 days'),
        (place_ids[15], 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Chè Thái sầu riêng béo ngậy! Trái cây tươi, nước cốt dừa thơm.', 5, true, NOW() - INTERVAL '1 day'),
        (place_ids[15], '11111111-1111-1111-1111-111111111111', 'Chè ngon tuyệt! Sầu riêng nhiều, đá bào mịn. Giá hợp lý.', 5, true, NOW() - INTERVAL '3 days'),
        (place_ids[15], '22222222-2222-2222-2222-222222222222', 'Chè Thái ngon nhất Sài Gòn! Sẽ quay lại nhiều lần.', 5, true, NOW() - INTERVAL '6 days');
    END IF;
    
    -- Add reviews for hotels (places 16-25)
    IF array_length(place_ids, 1) >= 20 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[16], '33333333-3333-3333-3333-333333333333', 'Khách sạn sang trọng, view đẹp. Phòng rộng rãi, sạch sẽ.', 4, true, NOW() - INTERVAL '15 days'),
        (place_ids[17], '55555555-5555-5555-5555-555555555555', 'View sông Sài Gòn tuyệt đẹp! Bể bơi rooftop đẹp.', 5, true, NOW() - INTERVAL '10 days'),
        (place_ids[18], '77777777-7777-7777-7777-777777777777', 'Phong cách Nhật Bản tối giản, sang trọng. Phòng sạch, yên tĩnh.', 4, true, NOW() - INTERVAL '12 days'),
        (place_ids[20], 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Căn hộ dịch vụ rộng rãi, có bếp. Phù hợp gia đình.', 5, true, NOW() - INTERVAL '25 days');
    END IF;
    
    -- Add reviews for parks (places 26-33)
    IF array_length(place_ids, 1) >= 30 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[26], 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Công viên xanh mát, yên tĩnh. Phù hợp tập thể dục buổi sáng.', 4, true, NOW() - INTERVAL '7 days'),
        (place_ids[27], 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Công viên rộng, có hồ nước đẹp. Phù hợp dã ngoại gia đình.', 4, true, NOW() - INTERVAL '9 days'),
        (place_ids[28], '11111111-1111-1111-1111-111111111111', 'Công viên lớn nhất Sài Gòn! Có hồ, cầu, thác nước. Rất đẹp!', 5, true, NOW() - INTERVAL '5 days');
    END IF;
    
    -- Add reviews for museums (places 34-40)
    IF array_length(place_ids, 1) >= 40 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[34], 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bảo tàng lịch sử chiến tranh ý nghĩa. Nhiều hiện vật quý giá.', 5, true, NOW() - INTERVAL '20 days'),
        (place_ids[35], '22222222-2222-2222-2222-222222222222', 'Bảo tàng đẹp, kiến trúc Pháp cổ. Trưng bày nhiều hiện vật.', 4, true, NOW() - INTERVAL '18 days'),
        (place_ids[36], '44444444-4444-4444-4444-444444444444', 'Di tích lịch sử quan trọng! Kiến trúc độc đáo, ý nghĩa.', 5, true, NOW() - INTERVAL '15 days'),
        (place_ids[40], 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Nhà thờ Đức Bà - biểu tượng Sài Gòn! Kiến trúc Gothic tuyệt đẹp.', 5, true, NOW() - INTERVAL '10 days');
    END IF;
    
    -- Add reviews for shopping & entertainment (places 41-50)
    IF array_length(place_ids, 1) >= 46 THEN
        INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
        (place_ids[41], '11111111-1111-1111-1111-111111111111', 'Trung tâm thương mại cao cấp. Nhiều thương hiệu quốc tế.', 4, true, NOW() - INTERVAL '8 days'),
        (place_ids[44], '77777777-7777-7777-7777-777777777777', 'Chợ Bến Thành - biểu tượng Sài Gòn! Mua đồ lưu niệm.', 4, true, NOW() - INTERVAL '9 days'),
        (place_ids[46], 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nhà hát opera đẹp! Kiến trúc Pháp cổ tuyệt vời.', 5, true, NOW() - INTERVAL '22 days'),
        (place_ids[49], '44444444-4444-4444-4444-444444444444', 'Đài quan sát cao nhất Sài Gòn! View 360 độ tuyệt đẹp.', 5, true, NOW() - INTERVAL '18 days');
    END IF;
    
    RAISE NOTICE 'Reviews added successfully!';
    
END $$;

-- Show summary
SELECT 'Reviews added successfully!' AS status;
SELECT COUNT(*) AS total_reviews FROM reviews;
SELECT place_id, COUNT(*) AS review_count 
FROM reviews 
GROUP BY place_id 
ORDER BY place_id 
LIMIT 20;

