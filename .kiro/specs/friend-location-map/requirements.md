# Requirements Document - Friend Location Map

## Introduction

Tính năng Friend Location Map cho phép người dùng xem vị trí real-time của bạn bè trên bản đồ, tương tự như ứng dụng Bump. Người dùng có thể tùy chỉnh cách hiển thị avatar của mình với các khung ảnh độc đáo và tương tác với bạn bè thông qua các hiệu ứng động như bắn tim, poke, wave, v.v.

## Glossary

- **Friend Location System**: Hệ thống quản lý và hiển thị vị trí của bạn bè trên bản đồ
- **Avatar Frame**: Khung ảnh trang trí xung quanh avatar người dùng trên bản đồ
- **Location Marker**: Điểm đánh dấu vị trí của người dùng trên bản đồ
- **Interaction Effect**: Hiệu ứng động để tương tác với bạn bè (tim, poke, wave, etc.)
- **Last Seen Location**: Vị trí cuối cùng mà người dùng được ghi nhận online
- **Location Privacy**: Cài đặt quyền riêng tư về việc chia sẻ vị trí
- **Ghost Mode**: Chế độ ẩn vị trí của người dùng
- **Location Sharing**: Chia sẻ vị trí real-time với bạn bè
- **Interaction Animation**: Hoạt ảnh hiển thị khi có tương tác giữa người dùng

## Requirements

### Requirement 1: Location Tracking & Storage

**User Story:** Là người dùng, tôi muốn vị trí của mình được cập nhật tự động khi tôi di chuyển, để bạn bè có thể thấy tôi đang ở đâu.

#### Acceptance Criteria

1. WHEN người dùng mở ứng dụng và cho phép truy cập vị trí, THEN hệ thống SHALL ghi nhận và lưu trữ vị trí hiện tại (latitude, longitude, timestamp)
2. WHILE ứng dụng đang chạy ở foreground, THEN hệ thống SHALL cập nhật vị trí mỗi 30 giây hoặc khi người dùng di chuyển hơn 50 mét
3. WHEN người dùng tắt ứng dụng hoặc mất kết nối, THEN hệ thống SHALL lưu vị trí cuối cùng với timestamp
4. WHEN vị trí được cập nhật, THEN hệ thống SHALL gửi thông báo đến server để đồng bộ với bạn bè
5. WHEN người dùng bật Ghost Mode, THEN hệ thống SHALL ngừng cập nhật vị trí và ẩn marker trên bản đồ

### Requirement 2: Friend Location Display

**User Story:** Là người dùng, tôi muốn xem vị trí của tất cả bạn bè trên bản đồ, để biết họ đang ở đâu và có thể gặp gỡ.

#### Acceptance Criteria

1. WHEN người dùng mở tab bản đồ, THEN hệ thống SHALL hiển thị vị trí của tất cả bạn bè đang online hoặc có vị trí trong 24 giờ qua
2. WHEN hiển thị friend marker, THEN hệ thống SHALL bao gồm avatar, tên, thời gian cập nhật cuối, và khung ảnh đã chọn
3. WHEN bạn bè đang online (cập nhật trong 5 phút), THEN marker SHALL có indicator màu xanh lá
4. WHEN bạn bè offline (cập nhật hơn 5 phút), THEN marker SHALL hiển thị thời gian "X phút/giờ trước"
5. WHEN người dùng tap vào friend marker, THEN hệ thống SHALL hiển thị bottom sheet với thông tin chi tiết và các tùy chọn tương tác

### Requirement 3: Avatar Frame Customization

**User Story:** Là người dùng, tôi muốn tùy chỉnh khung ảnh hiển thị trên bản đồ, để thể hiện cá tính và phong cách riêng của mình.

#### Acceptance Criteria

1. WHEN người dùng vào settings, THEN hệ thống SHALL hiển thị gallery với ít nhất 20 khung ảnh khác nhau
2. WHEN người dùng chọn một khung ảnh, THEN hệ thống SHALL hiển thị preview real-time trên bản đồ
3. WHEN người dùng lưu khung ảnh mới, THEN hệ thống SHALL cập nhật marker của người dùng trên bản đồ của tất cả bạn bè
4. WHERE khung ảnh premium, THEN hệ thống SHALL yêu cầu unlock thông qua điểm thưởng hoặc thành tựu
5. WHEN hiển thị khung ảnh, THEN hệ thống SHALL hỗ trợ các kiểu: circular, square, heart, star, hexagon, diamond, flower, cloud, badge, neon

### Requirement 4: Interactive Effects System

**User Story:** Là người dùng, tôi muốn gửi các hiệu ứng tương tác đến bạn bè trên bản đồ, để thể hiện cảm xúc và tạo sự vui vẻ.

#### Acceptance Criteria

1. WHEN người dùng tap vào friend marker, THEN hệ thống SHALL hiển thị menu với các hiệu ứng: Heart (❤️), Wave (👋), Poke (👉), Fire (🔥), Star (⭐), Hug (🤗)
2. WHEN người dùng chọn một hiệu ứng, THEN hệ thống SHALL tạo animation bay từ vị trí người dùng đến vị trí bạn bè
3. WHEN hiệu ứng đến đích, THEN hệ thống SHALL hiển thị explosion effect và gửi notification đến bạn bè
4. WHEN bạn bè nhận được hiệu ứng, THEN hệ thống SHALL hiển thị notification với tên người gửi và loại hiệu ứng
5. WHEN người dùng gửi hiệu ứng, THEN hệ thống SHALL có cooldown 10 giây giữa các lần gửi để tránh spam
6. WHEN hiệu ứng đang bay, THEN animation SHALL mượt mà với trajectory cong tự nhiên và particle effects

### Requirement 5: Location Privacy Controls

**User Story:** Là người dùng, tôi muốn kiểm soát ai có thể thấy vị trí của mình, để bảo vệ quyền riêng tư.

#### Acceptance Criteria

1. WHEN người dùng vào privacy settings, THEN hệ thống SHALL cung cấp các tùy chọn: All Friends, Close Friends Only, Ghost Mode
2. WHEN người dùng chọn Close Friends Only, THEN hệ thống SHALL chỉ hiển thị vị trí cho danh sách bạn thân đã chọn
3. WHEN người dùng bật Ghost Mode, THEN marker của người dùng SHALL biến mất khỏi bản đồ của tất cả bạn bè
4. WHEN Ghost Mode được bật, THEN hệ thống SHALL hiển thị indicator trong app để người dùng biết họ đang ẩn
5. WHEN người dùng tắt location permission, THEN hệ thống SHALL tự động chuyển sang Ghost Mode

### Requirement 6: Real-time Location Updates

**User Story:** Là người dùng, tôi muốn thấy vị trí bạn bè cập nhật real-time, để biết họ đang di chuyển đến đâu.

#### Acceptance Criteria

1. WHEN bạn bè di chuyển, THEN marker SHALL di chuyển mượt mà trên bản đồ với smooth animation
2. WHEN nhận được location update, THEN hệ thống SHALL cập nhật marker trong vòng 2 giây
3. WHEN nhiều bạn bè cập nhật cùng lúc, THEN hệ thống SHALL xử lý batch updates để tối ưu performance
4. WHEN kết nối mạng yếu, THEN hệ thống SHALL queue updates và sync khi kết nối ổn định
5. WHEN người dùng zoom out bản đồ, THEN hệ thống SHALL cluster các markers gần nhau để tránh overlap

### Requirement 7: Friend Proximity Notifications

**User Story:** Là người dùng, tôi muốn nhận thông báo khi bạn bè ở gần, để có thể gặp gỡ.

#### Acceptance Criteria

1. WHEN bạn bè ở trong bán kính 500m, THEN hệ thống SHALL gửi notification "Tên bạn đang ở gần bạn!"
2. WHEN người dùng tap vào notification, THEN ứng dụng SHALL mở bản đồ và focus vào vị trí bạn bè
3. WHEN nhiều bạn bè ở gần, THEN hệ thống SHALL gộp thành một notification "3 người bạn đang ở gần"
4. WHERE người dùng tắt proximity notifications, THEN hệ thống SHALL không gửi thông báo này
5. WHEN bạn bè rời khỏi vùng gần, THEN hệ thống SHALL không gửi notification rời đi

### Requirement 8: Location History & Timeline

**User Story:** Là người dùng, tôi muốn xem lịch sử di chuyển của mình, để nhớ lại những nơi đã đến.

#### Acceptance Criteria

1. WHEN người dùng vào profile, THEN hệ thống SHALL hiển thị timeline với các địa điểm đã check-in trong 7 ngày qua
2. WHEN hiển thị location history, THEN mỗi điểm SHALL bao gồm địa chỉ, thời gian, và khoảng cách di chuyển
3. WHEN người dùng tap vào một điểm trong history, THEN bản đồ SHALL zoom đến vị trí đó
4. WHERE người dùng muốn xóa history, THEN hệ thống SHALL cung cấp tùy chọn xóa toàn bộ hoặc từng điểm
5. WHEN lưu trữ history, THEN hệ thống SHALL tự động xóa dữ liệu cũ hơn 30 ngày

### Requirement 9: Map Interaction & Navigation

**User Story:** Là người dùng, tôi muốn dễ dàng điều hướng trên bản đồ và tìm đường đến bạn bè, để có thể gặp họ.

#### Acceptance Criteria

1. WHEN người dùng tap vào friend marker, THEN hệ thống SHALL hiển thị nút "Chỉ đường"
2. WHEN người dùng chọn "Chỉ đường", THEN hệ thống SHALL mở Google Maps hoặc Apple Maps với route đến vị trí bạn bè
3. WHEN người dùng pinch-to-zoom, THEN bản đồ SHALL zoom mượt mà với animation
4. WHEN người dùng tap nút "My Location", THEN bản đồ SHALL center về vị trí hiện tại của người dùng
5. WHEN hiển thị route, THEN hệ thống SHALL tính và hiển thị khoảng cách và thời gian di chuyển ước tính

### Requirement 10: Avatar Frame Gallery & Unlocks

**User Story:** Là người dùng, tôi muốn thu thập và unlock các khung ảnh đặc biệt, để có nhiều lựa chọn tùy chỉnh.

#### Acceptance Criteria

1. WHEN người dùng mở frame gallery, THEN hệ thống SHALL hiển thị tất cả frames với trạng thái locked/unlocked
2. WHEN frame bị locked, THEN hệ thống SHALL hiển thị điều kiện unlock (ví dụ: "Check-in 10 địa điểm", "Gửi 50 hearts")
3. WHEN người dùng đạt điều kiện unlock, THEN hệ thống SHALL tự động unlock frame và hiển thị celebration animation
4. WHEN unlock frame mới, THEN hệ thống SHALL gửi notification "Bạn đã mở khóa khung ảnh mới!"
5. WHERE frame đặc biệt (seasonal, event), THEN hệ thống SHALL chỉ available trong thời gian giới hạn

### Requirement 11: Interaction Statistics & Achievements

**User Story:** Là người dùng, tôi muốn xem thống kê tương tác với bạn bè, để biết mình đã gửi bao nhiêu hiệu ứng.

#### Acceptance Criteria

1. WHEN người dùng vào profile, THEN hệ thống SHALL hiển thị số lượng hearts, waves, pokes đã gửi và nhận
2. WHEN người dùng đạt milestone (100 hearts, 500 interactions), THEN hệ thống SHALL unlock achievement badge
3. WHEN hiển thị friend profile, THEN hệ thống SHALL show interaction history với bạn đó
4. WHEN người dùng gửi nhiều interactions, THEN hệ thống SHALL tính "Best Friend" dựa trên tần suất tương tác
5. WHERE người dùng muốn xem leaderboard, THEN hệ thống SHALL hiển thị top friends theo số lượng interactions

### Requirement 12: Offline Mode & Sync

**User Story:** Là người dùng, tôi muốn app vẫn hoạt động khi mất kết nối, và tự động sync khi có mạng trở lại.

#### Acceptance Criteria

1. WHEN người dùng mất kết nối internet, THEN hệ thống SHALL hiển thị last known locations của bạn bè
2. WHEN offline, THEN người dùng vẫn có thể xem bản đồ và markers nhưng không cập nhật real-time
3. WHEN người dùng gửi interaction offline, THEN hệ thống SHALL queue và gửi khi có kết nối
4. WHEN kết nối được khôi phục, THEN hệ thống SHALL tự động sync tất cả pending updates
5. WHEN sync, THEN hệ thống SHALL hiển thị loading indicator và số lượng updates đang sync

### Requirement 13: Performance & Battery Optimization

**User Story:** Là người dùng, tôi muốn app không tiêu tốn quá nhiều pin, để có thể sử dụng cả ngày.

#### Acceptance Criteria

1. WHEN app chạy background, THEN hệ thống SHALL giảm tần suất cập nhật vị trí xuống mỗi 5 phút
2. WHEN pin dưới 20%, THEN hệ thống SHALL tự động chuyển sang power saving mode với update mỗi 10 phút
3. WHEN người dùng không di chuyển (stationary), THEN hệ thống SHALL ngừng location updates
4. WHEN render map với nhiều markers, THEN hệ thống SHALL sử dụng clustering và virtualization
5. WHEN load friend locations, THEN hệ thống SHALL cache data và chỉ fetch updates thay vì full reload

### Requirement 14: Custom Status & Messages

**User Story:** Là người dùng, tôi muốn đặt status message hiển thị trên marker, để bạn bè biết tôi đang làm gì.

#### Acceptance Criteria

1. WHEN người dùng tap vào marker của mình, THEN hệ thống SHALL hiển thị option "Đặt status"
2. WHEN người dùng nhập status, THEN hệ thống SHALL giới hạn 50 ký tự và hiển thị character count
3. WHEN status được đặt, THEN marker SHALL hiển thị speech bubble với nội dung status
4. WHEN người dùng chọn emoji status, THEN hệ thống SHALL cung cấp quick picks: 🏠 Ở nhà, 🏢 Đi làm, 🍕 Đi ăn, ☕ Cafe, 🎮 Chơi game
5. WHEN status tồn tại quá 4 giờ, THEN hệ thống SHALL tự động xóa status

### Requirement 15: Friend Marker Animations

**User Story:** Là người dùng, tôi muốn markers có animation sinh động, để bản đồ trông hấp dẫn hơn.

#### Acceptance Criteria

1. WHEN marker xuất hiện lần đầu, THEN hệ thống SHALL animate với bounce effect
2. WHEN bạn bè online, THEN marker SHALL có pulsing animation nhẹ quanh viền
3. WHEN nhận interaction, THEN marker SHALL shake hoặc bounce để thu hút attention
4. WHEN bạn bè di chuyển nhanh, THEN marker SHALL có motion trail effect
5. WHEN zoom in/out, THEN markers SHALL scale mượt mà với staggered animation

