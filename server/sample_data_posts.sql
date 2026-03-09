-- Sample data for social posts feature
-- Run this after migrations to populate test data

-- Sample posts from different users at various locations in Vietnam

-- Post 1: John Doe at Hoan Kiem Lake, Hanoi
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE username = 'john_doe'),
    'Beautiful morning at Hoan Kiem Lake! 🌅 #hanoi #morning #travel',
    21.028511,
    105.852219,
    'Hồ Hoàn Kiếm, Hà Nội',
    'PUBLIC',
    42,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
);

-- Post 2: Jane Smith at Ben Thanh Market, HCMC
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE username = 'jane_smith'),
    'Exploring the vibrant Ben Thanh Market! So many amazing foods 🍜 #saigon #food #market',
    10.772461,
    106.698055,
    'Chợ Bến Thành, TP.HCM',
    'PUBLIC',
    128,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
);

-- Post 3: Bob Johnson at Da Nang Beach
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE username = 'bob_johnson'),
    'Perfect beach day in Da Nang! 🏖️ #danang #beach #sunset #vietnam',
    16.054407,
    108.202164,
    'Bãi biển Mỹ Khê, Đà Nẵng',
    'PUBLIC',
    89,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
);

-- Post 4: Alice Brown at Hoi An Ancient Town
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE username = 'alice_brown'),
    'Wandering through the magical streets of Hoi An 🏮 #hoian #travel #culture',
    15.879186,
    108.335800,
    'Phố cổ Hội An',
    'PUBLIC',
    156,
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours'
);

-- Post 5: Charlie Wilson at Sapa
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE username = 'charlie_wilson'),
    'Breathtaking rice terraces in Sapa! 🌾 #sapa #nature #mountains',
    22.336667,
    103.844444,
    'Ruộng bậc thang Sapa',
    'PUBLIC',
    203,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
);

-- Post 6: John Doe - Friends only post
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE username = 'john_doe'),
    'Having coffee with friends at this cozy cafe ☕ #coffee #friends',
    21.027764,
    105.834160,
    'Cafe Giảng, Hà Nội',
    'FRIENDS_ONLY',
    15,
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '6 hours'
);

-- Post 7: Jane Smith at Phu Quoc
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE username = 'jane_smith'),
    'Paradise found! 🌴 Phu Quoc is absolutely stunning #phuquoc #island #paradise',
    10.289574,
    103.983429,
    'Bãi Sao, Phú Quốc',
    'PUBLIC',
    312,
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours'
);

-- Post 8: Bob Johnson at Nha Trang
INSERT INTO posts (user_id, content, latitude, longitude, location_name, privacy, view_count, created_at, updated_at)
VALUES (
    (SELECT id FROM users WHERE username = 'bob_johnson'),
    'Snorkeling adventure in Nha Trang! 🤿 #nhatrang #diving #ocean',
    12.238791,
    109.196749,
    'Bãi biển Nha Trang',
    'PUBLIC',
    97,
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '8 hours'
);

-- Add sample images to posts
INSERT INTO post_images (post_id, image_url, thumbnail_url, display_order)
VALUES
    (1, 'https://example.com/images/hoankiemlake1.jpg', 'https://example.com/thumbnails/hoankiemlake1.jpg', 0),
    (1, 'https://example.com/images/hoankiemlake2.jpg', 'https://example.com/thumbnails/hoankiemlake2.jpg', 1),
    (2, 'https://example.com/images/benthanh1.jpg', 'https://example.com/thumbnails/benthanh1.jpg', 0),
    (3, 'https://example.com/images/danang1.jpg', 'https://example.com/thumbnails/danang1.jpg', 0),
    (3, 'https://example.com/images/danang2.jpg', 'https://example.com/thumbnails/danang2.jpg', 1),
    (3, 'https://example.com/images/danang3.jpg', 'https://example.com/thumbnails/danang3.jpg', 2),
    (4, 'https://example.com/images/hoian1.jpg', 'https://example.com/thumbnails/hoian1.jpg', 0),
    (5, 'https://example.com/images/sapa1.jpg', 'https://example.com/thumbnails/sapa1.jpg', 0),
    (7, 'https://example.com/images/phuquoc1.jpg', 'https://example.com/thumbnails/phuquoc1.jpg', 0),
    (8, 'https://example.com/images/nhatrang1.jpg', 'https://example.com/thumbnails/nhatrang1.jpg', 0);

-- Add hashtags
INSERT INTO hashtags (name, usage_count) VALUES
    ('hanoi', 2),
    ('morning', 1),
    ('travel', 3),
    ('saigon', 1),
    ('food', 1),
    ('market', 1),
    ('danang', 1),
    ('beach', 2),
    ('sunset', 1),
    ('vietnam', 1),
    ('hoian', 1),
    ('culture', 1),
    ('sapa', 1),
    ('nature', 1),
    ('mountains', 1),
    ('coffee', 1),
    ('friends', 1),
    ('phuquoc', 1),
    ('island', 1),
    ('paradise', 1),
    ('nhatrang', 1),
    ('diving', 1),
    ('ocean', 1)
ON CONFLICT (name) DO UPDATE SET usage_count = hashtags.usage_count + 1;

-- Link posts to hashtags
INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 1, id FROM hashtags WHERE name IN ('hanoi', 'morning', 'travel');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 2, id FROM hashtags WHERE name IN ('saigon', 'food', 'market');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 3, id FROM hashtags WHERE name IN ('danang', 'beach', 'sunset', 'vietnam');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 4, id FROM hashtags WHERE name IN ('hoian', 'travel', 'culture');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 5, id FROM hashtags WHERE name IN ('sapa', 'nature', 'mountains');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 6, id FROM hashtags WHERE name IN ('coffee', 'friends');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 7, id FROM hashtags WHERE name IN ('phuquoc', 'island', 'paradise');

INSERT INTO post_hashtags (post_id, hashtag_id)
SELECT 8, id FROM hashtags WHERE name IN ('nhatrang', 'diving', 'ocean');

-- Add some likes
INSERT INTO post_likes (post_id, user_id, created_at)
SELECT 1, id, NOW() - INTERVAL '1 day' FROM users WHERE username IN ('jane_smith', 'bob_johnson', 'alice_brown');

INSERT INTO post_likes (post_id, user_id, created_at)
SELECT 2, id, NOW() - INTERVAL '12 hours' FROM users WHERE username IN ('john_doe', 'charlie_wilson');

INSERT INTO post_likes (post_id, user_id, created_at)
SELECT 3, id, NOW() - INTERVAL '2 hours' FROM users WHERE username IN ('jane_smith', 'alice_brown', 'charlie_wilson');

INSERT INTO post_likes (post_id, user_id, created_at)
SELECT 7, id, NOW() - INTERVAL '6 hours' FROM users WHERE username IN ('john_doe', 'bob_johnson', 'alice_brown', 'charlie_wilson');

-- Add some comments
INSERT INTO post_comments (post_id, user_id, content, created_at, updated_at)
VALUES
    (1, (SELECT id FROM users WHERE username = 'jane_smith'), 'Looks amazing! I need to visit Hanoi soon!', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (1, (SELECT id FROM users WHERE username = 'bob_johnson'), 'Beautiful photo! 📸', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '20 hours'),
    (2, (SELECT id FROM users WHERE username = 'john_doe'), 'The food there is incredible!', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours'),
    (3, (SELECT id FROM users WHERE username = 'alice_brown'), 'Perfect beach day! 🌊', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
    (7, (SELECT id FROM users WHERE username = 'charlie_wilson'), 'Wow! Adding this to my bucket list!', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
    (7, (SELECT id FROM users WHERE username = 'john_doe'), 'Phu Quoc is the best! 🏝️', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours');

-- Summary
SELECT 'Sample posts data inserted successfully!' as message;
SELECT COUNT(*) as total_posts FROM posts;
SELECT COUNT(*) as total_images FROM post_images;
SELECT COUNT(*) as total_hashtags FROM hashtags;
SELECT COUNT(*) as total_likes FROM post_likes;
SELECT COUNT(*) as total_comments FROM post_comments;
