package com.mapic.entity;

public enum MissionStatus {
    AVAILABLE,        // 1. Mới — trong cart, chưa bắt đầu
    ACTIVE,           // 2. Đã xác nhận — đã start
    IN_PROGRESS,      // 3. Đang thực hiện — đang di chuyển
    AT_LOCATION,      // 4. Đang check-in — GPS xác nhận tại chỗ
    COMPLETED,        // 5. Hoàn thành
    CANCELLED,        // 6. Đã hủy (trong 30 phút đầu)
    CANCEL_REQUESTED  // 6b. Gửi yêu cầu hủy (khi đang ở bước 3+)
}
