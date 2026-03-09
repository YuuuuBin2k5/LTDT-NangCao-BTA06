-- Check if friend locations exist in database

-- 1. Check users
SELECT id, username, email FROM users ORDER BY username;

-- 2. Check friendships
SELECT * FROM friendships WHERE status = 'ACCEPTED';

-- 3. Check user_locations (current locations)
SELECT 
    ul.id,
    u.username,
    ul.latitude,
    ul.longitude,
    ul.is_current,
    ul.status_message,
    ul.created_at
FROM user_locations ul
JOIN users u ON ul.user_id = u.id
WHERE ul.is_current = TRUE
ORDER BY u.username;

-- 4. Count friend locations for testuser
SELECT COUNT(*) as friend_count
FROM friendships f
WHERE (f.user_id = (SELECT id FROM users WHERE email = 'testuser@mapic.com')
   OR f.friend_id = (SELECT id FROM users WHERE email = 'testuser@mapic.com'))
  AND f.status = 'ACCEPTED';
