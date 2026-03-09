package com.mapic.controller;

import com.mapic.dto.mission.*;
import com.mapic.entity.MissionStatus;
import com.mapic.entity.User;
import com.mapic.service.MissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
@Slf4j
public class MissionController {

    private final MissionService missionService;

    private UUID getUserId(UserDetails userDetails) {
        if (userDetails instanceof User) return ((User) userDetails).getId();
        return null;
    }

    // ─────────────── MISSIONS LIST (Lazy load + filter) ───────

    /**
     * GET /api/missions?categoryId=1&page=0&size=10&lat=10.77&lng=106.69
     */
    @GetMapping
    public ResponseEntity<Page<MissionDTO>> getMissions(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lng,
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
            missionService.getMissions(categoryId, lat, lng, page, size));
    }

    /**
     * GET /api/missions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<MissionDTO> getMission(@PathVariable Long id) {
        return ResponseEntity.ok(missionService.getMissionById(id));
    }

    // ─────────────── CART (Giỏ hàng) ──────────────────────────

    /**
     * GET /api/missions/cart  — Xem giỏ hàng hiện tại
     */
    @GetMapping("/cart")
    public ResponseEntity<MissionCartDTO> getCart(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(missionService.getCart(getUserId(userDetails)));
    }

    /**
     * POST /api/missions/cart/items  — Thêm mission vào giỏ
     */
    @PostMapping("/cart/items")
    public ResponseEntity<MissionCartDTO> addToCart(
        @RequestBody AddToCartRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
            missionService.addToCart(getUserId(userDetails), req.getMissionId()));
    }

    /**
     * DELETE /api/missions/cart/items/{itemId}  — Xóa khỏi giỏ
     */
    @DeleteMapping("/cart/items/{itemId}")
    public ResponseEntity<Void> removeFromCart(
        @PathVariable Long itemId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        missionService.removeFromCart(getUserId(userDetails), itemId);
        return ResponseEntity.noContent().build();
    }

    // ─────────────── START JOURNEY (Thanh toán) ───────────────

    /**
     * POST /api/missions/cart/start  — Bắt đầu hành trình (= Checkout)
     */
    @PostMapping("/cart/start")
    public ResponseEntity<MissionCartDTO> startJourney(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(missionService.startJourney(getUserId(userDetails)));
    }

    // ─────────────── TRACKER (Theo dõi đơn hàng) ─────────────

    /**
     * GET /api/missions/tracker  — Lấy cart đang ACTIVE
     */
    @GetMapping("/tracker")
    public ResponseEntity<MissionCartDTO> getTracker(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(missionService.getTracker(getUserId(userDetails)));
    }

    /**
     * GET /api/missions/tracker/history  — Lịch sử missions đã hoàn thành
     */
    @GetMapping("/tracker/history")
    public ResponseEntity<List<MissionCartItemDTO>> getHistory(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(missionService.getMissionHistory(getUserId(userDetails)));
    }

    /**
     * PATCH /api/missions/tracker/{itemId}/status  — Cập nhật trạng thái
     * Body: { "status": "IN_PROGRESS" }
     */
    @PatchMapping("/tracker/{itemId}/status")
    public ResponseEntity<MissionCartItemDTO> updateStatus(
        @PathVariable Long itemId,
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        MissionStatus newStatus = MissionStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(
            missionService.updateItemStatus(getUserId(userDetails), itemId, newStatus));
    }

    /**
     * POST /api/missions/tracker/{itemId}/checkin  — Check-in GPS + ảnh
     */
    @PostMapping("/tracker/{itemId}/checkin")
    public ResponseEntity<MissionCartItemDTO> checkIn(
        @PathVariable Long itemId,
        @RequestBody CheckInRequest req,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
            missionService.checkIn(getUserId(userDetails), itemId, req));
    }

    /**
     * DELETE /api/missions/tracker/{itemId}  — Hủy mission
     */
    @DeleteMapping("/tracker/{itemId}")
    public ResponseEntity<Void> cancelItem(
        @PathVariable Long itemId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        missionService.cancelItem(getUserId(userDetails), itemId);
        return ResponseEntity.noContent().build();
    }

    // ─────────────── XP ───────────────────────────────────────

    /**
     * GET /api/missions/xp  — Lấy XP của user hiện tại
     */
    @GetMapping("/xp")
    public ResponseEntity<UserXpDTO> getMyXp(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(missionService.getUserXp(getUserId(userDetails)));
    }
}
