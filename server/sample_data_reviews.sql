-- ============================================
-- REVIEWS (100+ reviews for places)
-- ============================================
-- Reviews are distributed across all places with various ratings
-- Mix of public and private reviews to test permission system

-- Reviews for Phở Hòa Pasteur (place_id = 1)
INSERT INTO reviews (place_id, user_id, content, rating, is_public, created_at) VALUES
(1, '11111111-1111-1111-1111-111111111111', 'Phở ngon tuyệt vời! Nước dùng đậm đà, thịt bò mềm. Quán đông khách nhưng phục vụ nhanh.', 5, true, NOW() - INTERVAL '5 days'),
(1, '22222222-2222-2222-2222-222222222222', 'Phở ở đây ăn từ nhỏ đến giờ, vẫn giữ được chất lượng. Giá hơi cao nhưng xứng đáng.', 5, true, NOW() - INTERVAL '10 days'),
(1, '33333333-3333-3333-3333-333333333333', 'Nước dùng ngon nhưng hơi mặn với mình. Thịt bò tươi, bánh phở dai.', 4, true, NOW() - INTERVAL '3 days'),
(1, '44444444-4444-4444-4444-444444444444', 'Quán đông lắm, phải đợi lâu. Nhưng phở ngon nên chấp nhận được.', 4, false, NOW() - INTERVAL '7 days'),

-- Reviews for Cơm Tấm Mộc (place_id = 2)
(2, '55555555-5555-5555-5555-555555555555', 'Cơm tấm sườn nướng thơm lừng, nước mắm pha chuẩn vị. Giá rẻ, phần ăn nhiều.', 5, true, NOW() - INTERVAL '2 days'),
(2, '66666666-6666-6666-6666-666666666666', 'Sườn nướng hơi khô, nhưng nhìn chung ổn. Nước mắm ngon.', 3, true, NOW() - INTERVAL '8 days'),
(2, '77777777-7777-7777-7777-777777777777', 'Quán sạch sẽ, phục vụ nhanh. Cơm tấm ngon, giá hợp lý.', 4, true, NOW() - INTERVAL '4 days'),

-- Reviews for Bánh Xèo 46A (place_id = 3)
(3, '88888888-8888-8888-8888-888888888888', 'Bánh xèo giòn rụm, nhân đầy đặn. Rau sống tươi, nước chấm đặc biệt ngon!', 5, true, NOW() - INTERVAL '1 day'),
(3, '99999999-9999-9999-9999-999999999999', 'Ngon nhất Sài Gòn! Bánh giòn, không ngấy. Nhân tôm thịt nhiều.', 5, true, NOW() - INTERVAL '6 days'),
(3, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Quán đông khách, phải đợi. Bánh xèo ngon nhưng hơi nhiều dầu.', 4, true, NOW() - INTERVAL '9 days'),
(3, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bánh xèo ổn, nhưng không đặc biệt lắm. Giá hơi cao.', 3, false, NOW() - INTERVAL '12 days'),

-- Reviews for Bún Bò Huế Đông Ba (place_id = 4)
(4, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bún bò Huế chuẩn vị xứ Huế! Cay nồng, nước dùng đậm đà. Chả cua ngon.', 5, true, NOW() - INTERVAL '3 days'),
(4, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Ngon nhưng hơi cay với mình. Giò heo mềm, thơm.', 4, true, NOW() - INTERVAL '7 days'),
(4, '11111111-1111-1111-1111-111111111111', 'Bún bò ngon, nhưng phần ăn hơi ít. Giá hợp lý.', 4, false, NOW() - INTERVAL '11 days'),

-- Reviews for Quán Ốc Oanh (place_id = 5)
(5, '22222222-2222-2222-2222-222222222222', 'Ốc tươi, nấu ngon. Ốc hấp sả thơm phức, nghêu hấp xả ngọt.', 4, true, NOW() - INTERVAL '2 days'),
(5, '33333333-3333-3333-3333-333333333333', 'Hải sản tươi sống, giá hợp lý. Không gian thoáng mát.', 4, true, NOW() - INTERVAL '5 days'),
(5, '44444444-4444-4444-4444-444444444444', 'Ốc ngon nhưng phục vụ hơi chậm. Quán đông khách.', 3, true, NOW() - INTERVAL '8 days'),

-- Reviews for Lẩu Thái Smile (place_id = 6)
(6, '55555555-5555-5555-5555-555555555555', 'Lẩu Thái Tom Yum chuẩn vị! Cay chua ngọt hài hòa. Hải sản tươi.', 5, true, NOW() - INTERVAL '1 day'),
(6, '66666666-6666-6666-6666-666666666666', 'Nước lẩu ngon, hải sản tươi. Phục vụ nhiệt tình. Sẽ quay lại!', 5, true, NOW() - INTERVAL '4 days'),
(6, '77777777-7777-7777-7777-777777777777', 'Lẩu ngon nhưng hơi cay. Giá hơi cao so với chất lượng.', 4, false, NOW() - INTERVAL '9 days'),


-- Reviews for Bò Tơ Quán Mộc (place_id = 7)
(7, '88888888-8888-8888-8888-888888888888', 'Bò tơ Tây Ninh nướng lá lốt thơm ngon! Không gian sân vườn mát mẻ.', 4, true, NOW() - INTERVAL '6 days'),
(7, '99999999-9999-9999-9999-999999999999', 'Bò nướng sa tế cay nồng, thơm. Giá hợp lý, phục vụ tốt.', 4, true, NOW() - INTERVAL '10 days'),

-- Reviews for Gà Nướng Ụ Gà (place_id = 8)
(8, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Gà nướng mật ong ngon tuyệt! Da giòn, thịt mềm. Cơm lam thơm.', 5, true, NOW() - INTERVAL '3 days'),
(8, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gà nướng muối ớt cay nồng, thơm phức. Rau rừng tươi ngon.', 4, true, NOW() - INTERVAL '7 days'),
(8, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gà ngon nhưng hơi khô. Giá hơi cao.', 3, false, NOW() - INTERVAL '12 days'),

-- Reviews for Lẩu Nấm Ashima (place_id = 9)
(9, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lẩu nấm chay thanh đạm, ngọt từ nấm. Rau củ tươi, đa dạng.', 4, true, NOW() - INTERVAL '5 days'),
(9, '11111111-1111-1111-1111-111111111111', 'Nước lẩu ngọt thanh, không ngấy. Phù hợp ăn chay.', 4, true, NOW() - INTERVAL '9 days'),

-- Reviews for Cháo Lòng Bà Út (place_id = 10)
(10, '22222222-2222-2222-2222-222222222222', 'Cháo lòng nóng hổi, lòng heo tươi ngon. Quẩy giòn tan!', 5, true, NOW() - INTERVAL '1 day'),
(10, '33333333-3333-3333-3333-333333333333', 'Cháo ngon, lòng nhiều. Hành phi thơm. Giá rẻ!', 5, true, NOW() - INTERVAL '4 days'),
(10, '44444444-4444-4444-4444-444444444444', 'Quán mở sớm, tiện ăn sáng. Cháo lòng đậm đà.', 4, true, NOW() - INTERVAL '8 days'),

-- Reviews for Bún Riêu Cô Ba (place_id = 11)
(11, '55555555-5555-5555-5555-555555555555', 'Bún riêu cua đồng chuẩn vị miền Bắc. Riêu cua nhiều, nước dùng ngọt.', 4, true, NOW() - INTERVAL '2 days'),
(11, '66666666-6666-6666-6666-666666666666', 'Riêu cua tự làm, thơm ngon. Nước dùng trong, ngọt thanh.', 4, true, NOW() - INTERVAL '6 days'),

-- Reviews for Hủ Tiếu Nam Vang Mỹ Tho (place_id = 12)
(12, '77777777-7777-7777-7777-777777777777', 'Hủ tiếu Nam Vang nước trong, ngọt thanh. Tôm tươi, thịt mềm.', 5, true, NOW() - INTERVAL '3 days'),
(12, '88888888-8888-8888-8888-888888888888', 'Hủ tiếu ngon, nước dùng đậm đà. Gan, tim tươi.', 4, true, NOW() - INTERVAL '7 days'),

-- Reviews for Mì Quảng 1A (place_id = 13)
(13, '99999999-9999-9999-9999-999999999999', 'Mì Quảng Đà Nẵng chính gốc! Nước dùng đậm, bánh tráng giòn.', 4, true, NOW() - INTERVAL '4 days'),
(13, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mì Quảng ngon, nhưng phần ăn hơi ít. Giá hợp lý.', 4, false, NOW() - INTERVAL '9 days'),

-- Reviews for Bánh Canh Cua 87 (place_id = 14)
(14, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bánh canh cua đồng ngon! Nước dùng ngọt từ xương heo.', 4, true, NOW() - INTERVAL '5 days'),
(14, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Cua tươi, thịt heo băm thơm. Bánh canh dai, ngon.', 4, true, NOW() - INTERVAL '10 days'),

-- Reviews for Chè Thái Sầu Riêng (place_id = 15)
(15, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Chè Thái sầu riêng béo ngậy! Trái cây tươi, nước cốt dừa thơm.', 5, true, NOW() - INTERVAL '1 day'),
(15, '11111111-1111-1111-1111-111111111111', 'Chè ngon tuyệt! Sầu riêng nhiều, đá bào mịn. Giá hợp lý.', 5, true, NOW() - INTERVAL '3 days'),
(15, '22222222-2222-2222-2222-222222222222', 'Chè Thái ngon nhất Sài Gòn! Sẽ quay lại nhiều lần.', 5, true, NOW() - INTERVAL '6 days'),


-- Reviews for Hotels (place_id 16-25)
(16, '33333333-3333-3333-3333-333333333333', 'Khách sạn sang trọng, view đẹp. Phòng rộng rãi, sạch sẽ. Nhân viên thân thiện.', 4, true, NOW() - INTERVAL '15 days'),
(16, '44444444-4444-4444-4444-444444444444', 'Vị trí trung tâm, tiện đi lại. Giá hợp lý, chất lượng tốt.', 4, true, NOW() - INTERVAL '20 days'),

(17, '55555555-5555-5555-5555-555555555555', 'View sông Sài Gòn tuyệt đẹp! Bể bơi rooftop đẹp. Nhà hàng ngon.', 5, true, NOW() - INTERVAL '10 days'),
(17, '66666666-6666-6666-6666-666666666666', 'Khách sạn đẹp, phục vụ tốt. Giá hơi cao nhưng xứng đáng.', 4, true, NOW() - INTERVAL '18 days'),

(18, '77777777-7777-7777-7777-777777777777', 'Phong cách Nhật Bản tối giản, sang trọng. Phòng sạch, yên tĩnh.', 4, true, NOW() - INTERVAL '12 days'),
(18, '88888888-8888-8888-8888-888888888888', 'Thiết kế đẹp, tiện nghi đầy đủ. Nhân viên chuyên nghiệp.', 4, false, NOW() - INTERVAL '22 days'),

(19, '99999999-9999-9999-9999-999999999999', 'Vị trí trung tâm, gần chợ Bến Thành. Phòng sạch, giá tốt.', 4, true, NOW() - INTERVAL '8 days'),
(19, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Khách sạn ổn, phục vụ tốt. Giá hợp lý.', 4, true, NOW() - INTERVAL '16 days'),

(20, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Căn hộ dịch vụ rộng rãi, có bếp. Phù hợp gia đình, lưu trú dài ngày.', 5, true, NOW() - INTERVAL '25 days'),
(20, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tiện nghi đầy đủ, sạch sẽ. Nhân viên nhiệt tình. Sẽ quay lại!', 5, true, NOW() - INTERVAL '30 days'),

(21, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Khách sạn boutique sang trọng. Bar rooftop view đẹp, cocktail ngon.', 5, true, NOW() - INTERVAL '14 days'),
(21, '11111111-1111-1111-1111-111111111111', 'Thiết kế độc đáo, ấn tượng. Phòng đẹp, phục vụ tốt.', 4, false, NOW() - INTERVAL '21 days'),

(22, '22222222-2222-2222-2222-222222222222', 'Khách sạn 5 sao đẳng cấp. Spa tuyệt vời, gym hiện đại.', 4, true, NOW() - INTERVAL '19 days'),
(22, '33333333-3333-3333-3333-333333333333', 'Tiện nghi cao cấp, phục vụ chuyên nghiệp. Giá cao nhưng xứng đáng.', 4, true, NOW() - INTERVAL '27 days'),

(23, '44444444-4444-4444-4444-444444444444', 'Vị trí trung tâm, kết nối mall. Phòng view thành phố đẹp.', 4, true, NOW() - INTERVAL '11 days'),
(23, '55555555-5555-5555-5555-555555555555', 'Khách sạn hiện đại, tiện nghi đầy đủ. Nhân viên thân thiện.', 4, true, NOW() - INTERVAL '17 days'),

(24, '66666666-6666-6666-6666-666666666666', 'Khách sạn lịch sử, kiến trúc đẹp. View sông Sài Gòn tuyệt vời!', 5, true, NOW() - INTERVAL '23 days'),
(24, '77777777-7777-7777-7777-777777777777', 'Phong cách cổ điển sang trọng. Phục vụ đẳng cấp 5 sao.', 5, true, NOW() - INTERVAL '28 days'),

(25, '88888888-8888-8888-8888-888888888888', 'Khách sạn lâu đời, nổi tiếng. Rooftop bar Saigon Saigon tuyệt vời!', 5, true, NOW() - INTERVAL '13 days'),
(25, '99999999-9999-9999-9999-999999999999', 'Vị trí đẹp, view quảng trường. Phòng sang trọng, phục vụ tốt.', 4, true, NOW() - INTERVAL '24 days'),


-- Reviews for Parks (place_id 26-33)
(26, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Công viên xanh mát, yên tĩnh. Phù hợp tập thể dục buổi sáng.', 4, true, NOW() - INTERVAL '7 days'),
(26, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nhiều cây xanh, chim chóc hót. Không gian thư giãn tốt.', 4, true, NOW() - INTERVAL '14 days'),

(27, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Công viên rộng, có hồ nước đẹp. Phù hợp dã ngoại gia đình.', 4, true, NOW() - INTERVAL '9 days'),
(27, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Không gian thoáng mát, phù hợp chạy bộ, đạp xe.', 4, true, NOW() - INTERVAL '16 days'),

(28, '11111111-1111-1111-1111-111111111111', 'Công viên lớn nhất Sài Gòn! Có hồ, cầu, thác nước. Rất đẹp!', 5, true, NOW() - INTERVAL '5 days'),
(28, '22222222-2222-2222-2222-222222222222', 'Không gian yên tĩnh, thoáng mát. Phù hợp thư giãn cuối tuần.', 4, true, NOW() - INTERVAL '12 days'),

(29, '33333333-3333-3333-3333-333333333333', 'Công viên nhỏ xinh, nhiều cây xanh. Phù hợp đi dạo.', 4, true, NOW() - INTERVAL '8 days'),
(29, '44444444-4444-4444-4444-444444444444', 'Yên tĩnh, ít người. Phù hợp ngồi đọc sách.', 4, false, NOW() - INTERVAL '15 days'),

(30, '55555555-5555-5555-5555-555555555555', 'Công viên yên tĩnh, ít người biết. Phù hợp thư giãn.', 4, true, NOW() - INTERVAL '10 days'),
(30, '66666666-6666-6666-6666-666666666666', 'Không gian xanh mát, thoáng đãng. Phù hợp tập yoga.', 4, true, NOW() - INTERVAL '18 days'),

(31, '77777777-7777-7777-7777-777777777777', 'Khu vui chơi lớn, nhiều trò chơi. Con trẻ rất thích!', 4, true, NOW() - INTERVAL '6 days'),
(31, '88888888-8888-8888-8888-888888888888', 'Hồ sen đẹp, không gian rộng. Phù hợp gia đình.', 4, true, NOW() - INTERVAL '13 days'),

(32, '99999999-9999-9999-9999-999999999999', 'Công viên ven sông, view đẹp. Phù hợp chạy bộ, đạp xe.', 4, true, NOW() - INTERVAL '11 days'),
(32, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ngắm hoàng hôn ở đây rất đẹp! Không gian thoáng mát.', 4, true, NOW() - INTERVAL '19 days'),

(33, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Công viên nhỏ ven sông, view đẹp. Phù hợp ngồi thư giãn.', 4, true, NOW() - INTERVAL '9 days'),
(33, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Yên tĩnh, ít người. Phù hợp ngắm sông Sài Gòn.', 4, false, NOW() - INTERVAL '17 days'),

-- Reviews for Museums (place_id 34-40)
(34, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bảo tàng lịch sử chiến tranh ý nghĩa. Nhiều hiện vật quý giá.', 5, true, NOW() - INTERVAL '20 days'),
(34, '11111111-1111-1111-1111-111111111111', 'Nên đến tham quan để hiểu về lịch sử. Rất cảm động.', 5, true, NOW() - INTERVAL '25 days'),

(35, '22222222-2222-2222-2222-222222222222', 'Bảo tàng đẹp, kiến trúc Pháp cổ. Trưng bày nhiều hiện vật.', 4, true, NOW() - INTERVAL '18 days'),
(35, '33333333-3333-3333-3333-333333333333', 'Tìm hiểu lịch sử thành phố rất thú vị. Nên ghé thăm.', 4, true, NOW() - INTERVAL '22 days'),

(36, '44444444-4444-4444-4444-444444444444', 'Di tích lịch sử quan trọng! Kiến trúc độc đáo, ý nghĩa.', 5, true, NOW() - INTERVAL '15 days'),
(36, '55555555-5555-5555-5555-555555555555', 'Nơi diễn ra sự kiện lịch sử 30/4. Rất đáng tham quan!', 5, true, NOW() - INTERVAL '21 days'),

(37, '66666666-6666-6666-6666-666666666666', 'Bảo tàng nghệ thuật đẹp. Nhiều tranh, điêu khắc quý.', 4, true, NOW() - INTERVAL '12 days'),
(37, '77777777-7777-7777-7777-777777777777', 'Kiến trúc Pháp cổ đẹp. Trưng bày nghệ thuật phong phú.', 4, false, NOW() - INTERVAL '19 days'),

(38, '88888888-8888-8888-8888-888888888888', 'Bảo tàng lịch sử phong phú. Nhiều hiện vật từ thời tiền sử.', 5, true, NOW() - INTERVAL '16 days'),
(38, '99999999-9999-9999-9999-999999999999', 'Tìm hiểu lịch sử Việt Nam rất thú vị. Nên ghé thăm.', 4, true, NOW() - INTERVAL '23 days'),

(39, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bảo tàng áo dài độc đáo! Trưng bày áo dài qua các thời kỳ.', 4, true, NOW() - INTERVAL '14 days'),
(39, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tìm hiểu văn hóa áo dài Việt Nam. Rất đẹp và ý nghĩa.', 4, true, NOW() - INTERVAL '20 days'),

(40, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Nhà thờ Đức Bà - biểu tượng Sài Gòn! Kiến trúc Gothic tuyệt đẹp.', 5, true, NOW() - INTERVAL '10 days'),
(40, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Kiến trúc cổ từ thời Pháp thuộc. Rất đẹp, nên chụp ảnh!', 5, true, NOW() - INTERVAL '17 days'),


-- Reviews for Shopping (place_id 41-45)
(41, '11111111-1111-1111-1111-111111111111', 'Trung tâm thương mại cao cấp. Nhiều thương hiệu quốc tế, nhà hàng ngon.', 4, true, NOW() - INTERVAL '8 days'),
(41, '22222222-2222-2222-2222-222222222222', 'Mua sắm thoải mái, không gian đẹp. Giá hơi cao.', 4, true, NOW() - INTERVAL '15 days'),

(42, '33333333-3333-3333-3333-333333333333', 'Trung tâm mua sắm hiện đại. Nhiều cửa hàng thời trang.', 4, true, NOW() - INTERVAL '11 days'),
(42, '44444444-4444-4444-4444-444444444444', 'Vị trí trung tâm, tiện đi lại. Mua sắm đa dạng.', 4, false, NOW() - INTERVAL '18 days'),

(43, '55555555-5555-5555-5555-555555555555', 'Trung tâm thương mại Nhật Bản. Hàng hóa chất lượng cao, siêu thị Nhật ngon!', 5, true, NOW() - INTERVAL '13 days'),
(43, '66666666-6666-6666-6666-666666666666', 'Mua sắm thoải mái, hàng Nhật đa dạng. Giá hợp lý.', 4, true, NOW() - INTERVAL '20 days'),

(44, '77777777-7777-7777-7777-777777777777', 'Chợ Bến Thành - biểu tượng Sài Gòn! Mua đồ lưu niệm, ăn vặt.', 4, true, NOW() - INTERVAL '9 days'),
(44, '88888888-8888-8888-8888-888888888888', 'Chợ truyền thống, đông đúc. Nhớ mặc cả giá!', 4, true, NOW() - INTERVAL '16 days'),

(45, '99999999-9999-9999-9999-999999999999', 'Trung tâm thương mại lâu đời. Nhiều cửa hàng, rạp phim.', 4, true, NOW() - INTERVAL '12 days'),
(45, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mua sắm tiện lợi, khu ẩm thực đa dạng.', 4, false, NOW() - INTERVAL '19 days'),

-- Reviews for Entertainment (place_id 46-50)
(46, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nhà hát opera đẹp! Kiến trúc Pháp cổ tuyệt vời. Xem ballet rất hay.', 5, true, NOW() - INTERVAL '22 days'),
(46, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Biểu diễn chuyên nghiệp, âm thanh tốt. Nên xem một lần!', 5, true, NOW() - INTERVAL '28 days'),

(47, 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Rạp phim hiện đại, màn hình lớn. Ghế ngồi thoải mái, âm thanh tốt.', 4, true, NOW() - INTERVAL '5 days'),
(47, '11111111-1111-1111-1111-111111111111', 'Rạp đẹp, phim đa dạng. Giá vé hợp lý.', 4, true, NOW() - INTERVAL '11 days'),

(48, '22222222-2222-2222-2222-222222222222', 'Quán bar nhạc sống tuyệt vời! Ca sĩ hát hay, không gian ấm cúng.', 4, true, NOW() - INTERVAL '7 days'),
(48, '33333333-3333-3333-3333-333333333333', 'Nhạc acoustic nhẹ nhàng, thư giãn. Đồ uống ngon.', 4, false, NOW() - INTERVAL '14 days'),

(49, '44444444-4444-4444-4444-444444444444', 'Đài quan sát cao nhất Sài Gòn! View 360 độ tuyệt đẹp. Nên lên lúc hoàng hôn!', 5, true, NOW() - INTERVAL '18 days'),
(49, '55555555-5555-5555-5555-555555555555', 'Ngắm toàn cảnh thành phố từ trên cao. Rất đẹp, đáng giá!', 5, true, NOW() - INTERVAL '24 days'),

(50, '66666666-6666-6666-6666-666666666666', 'Sân bowling hiện đại, nhiều làn chơi. Phù hợp vui chơi bạn bè.', 4, true, NOW() - INTERVAL '10 days'),
(50, '77777777-7777-7777-7777-777777777777', 'Bowling vui, nhân viên hướng dẫn nhiệt tình. Giá hợp lý.', 4, true, NOW() - INTERVAL '16 days');

-- ============================================
-- END OF SAMPLE DATA
-- ============================================

-- Summary:
-- - 30 Users (various visibility settings)
-- - 50 Places (15 restaurants, 10 hotels, 8 parks, 7 museums, 5 shopping, 5 entertainment)
-- - 20 Current Locations
-- - 30 Friendships (18 accepted, 8 pending, 2 rejected, 2 blocked)
-- - 100+ Reviews (mix of public and private)

