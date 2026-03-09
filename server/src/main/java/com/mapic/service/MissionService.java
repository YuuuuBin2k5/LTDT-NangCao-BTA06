package com.mapic.service;

import com.mapic.dto.mission.*;
import com.mapic.entity.*;
import com.mapic.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MissionService {

    private final MissionRepository missionRepository;
    private final MissionCartRepository cartRepository;
    private final MissionCartItemRepository cartItemRepository;
    private final UserXpRepository userXpRepository;
    private final MissionCategoryRepository categoryRepository;

    // ─────────────── MISSIONS LIST ────────────────────────────

    @Transactional(readOnly = true)
    public Page<MissionDTO> getMissions(Long categoryId, Double lat, Double lng,
                                        int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Mission> missions;

        if (lat != null && lng != null) {
            double delta = 10.0 / 111.32; // 10km radius
            missions = missionRepository.findNearbyByCategory(
                categoryId, lat - delta, lat + delta, lng - delta, lng + delta, pageable);
        } else {
            missions = missionRepository.findActiveByCategory(categoryId, pageable);
        }
        return missions.map(MissionDTO::from);
    }

    @Transactional(readOnly = true)
    public MissionDTO getMissionById(Long id) {
        Mission m = missionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Mission not found: " + id));
        return MissionDTO.from(m);
    }

    // ─────────────── CART (Giỏ hàng) ──────────────────────────

    @Transactional(readOnly = true)
    public MissionCartDTO getCart(UUID userId) {
        MissionCart cart = getOrCreateCart(userId);
        return MissionCartDTO.from(cart);
    }

    @Transactional
    public MissionCartDTO addToCart(UUID userId, Long missionId) {
        // Kiểm tra mission tồn tại
        Mission mission = missionRepository.findById(missionId)
            .orElseThrow(() -> new RuntimeException("Mission not found: " + missionId));

        // Kiểm tra user đã có mission này chưa
        if (cartItemRepository.existsActiveMissionForUser(userId, missionId)) {
            throw new RuntimeException("Mission đã có trong hành trình của bạn");
        }

        MissionCart cart = getOrCreateCart(userId);

        // Giới hạn 5 missions/cart
        long active = cart.getItems().stream()
            .filter(i -> i.getStatus() != MissionStatus.CANCELLED
                      && i.getStatus() != MissionStatus.CANCEL_REQUESTED)
            .count();
        if (active >= 5) {
            throw new RuntimeException("Giỏ hàng tối đa 5 missions");
        }

        MissionCartItem item = MissionCartItem.builder()
            .cart(cart)
            .mission(mission)
            .status(MissionStatus.AVAILABLE)
            .build();
        cart.getItems().add(item);
        cartRepository.save(cart);

        log.info("User {} added mission {} to cart", userId, missionId);
        return MissionCartDTO.from(cart);
    }

    @Transactional
    public void removeFromCart(UUID userId, Long itemId) {
        MissionCartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

        // Security: chỉ owner mới được xóa
        if (!item.getCart().getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa item này");
        }
        if (item.getStatus() == MissionStatus.COMPLETED) {
            throw new RuntimeException("Không thể xóa mission đã hoàn thành");
        }
        cartItemRepository.delete(item);
        log.info("User {} removed item {} from cart", userId, itemId);
    }

    // ─────────────── START JOURNEY (Thanh toán) ──────────────

    @Transactional
    public MissionCartDTO startJourney(UUID userId) {
        MissionCart cart = cartRepository.findActiveCartByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));

        if (cart.getStatus() != MissionCartStatus.PENDING) {
            throw new RuntimeException("Hành trình đã được bắt đầu");
        }
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống, hãy thêm mission trước");
        }

        cart.setStatus(MissionCartStatus.ACTIVE);
        cart.setStartedAt(LocalDateTime.now());

        // Chuyển tất cả items sang ACTIVE
        cart.getItems().forEach(item -> {
            item.setStatus(MissionStatus.ACTIVE);
            item.setStartedAt(LocalDateTime.now());
        });

        cartRepository.save(cart);
        log.info("User {} started journey with cart {}", userId, cart.getId());
        return MissionCartDTO.from(cart);
    }

    // ─────────────── TRACKER (Theo dõi) ───────────────────────

    @Transactional(readOnly = true)
    public MissionCartDTO getTracker(UUID userId) {
        MissionCart cart = cartRepository.findActiveCartByUserId(userId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy hành trình đang active"));
        return MissionCartDTO.from(cart);
    }

    @Transactional(readOnly = true)
    public List<MissionCartItemDTO> getMissionHistory(UUID userId) {
        return cartItemRepository.findCompletedByUserId(userId)
            .stream().map(MissionCartItemDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public MissionCartItemDTO updateItemStatus(UUID userId, Long itemId, MissionStatus newStatus) {
        MissionCartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

        if (!item.getCart().getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền");
        }

        validateStatusTransition(item.getStatus(), newStatus);
        item.setStatus(newStatus);
        if (newStatus == MissionStatus.IN_PROGRESS) {
            item.setStartedAt(LocalDateTime.now());
        }
        cartItemRepository.save(item);
        return MissionCartItemDTO.from(item);
    }

    @Transactional
    public MissionCartItemDTO checkIn(UUID userId, Long itemId, CheckInRequest req) {
        MissionCartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));

        if (!item.getCart().getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền");
        }

        // Validate GPS: tính khoảng cách tới địa điểm
        Mission mission = item.getMission();
        double dist = haversineDistance(req.getLatitude(), req.getLongitude(),
            mission.getLatitude(), mission.getLongitude());

        if (dist > mission.getRadiusMeters()) {
            throw new RuntimeException(String.format(
                "Bạn đang cách địa điểm %.0f mét. Hãy đến trong phạm vi %d mét",
                dist, mission.getRadiusMeters()));
        }

        // Complete
        item.setStatus(MissionStatus.COMPLETED);
        item.setCompletedAt(LocalDateTime.now());
        item.setCheckInPhotoUrl(req.getPhotoUrl());
        cartItemRepository.save(item);

        // Cộng XP
        addXpToUser(userId, mission.getXpReward());

        log.info("User {} completed mission {} (+{} XP)", userId, mission.getId(), mission.getXpReward());
        return MissionCartItemDTO.from(item);
    }

    @Transactional
    public void cancelItem(UUID userId, Long itemId) {
        MissionCartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getCart().getUserId().equals(userId)) {
            throw new RuntimeException("Không có quyền");
        }
        if (item.getStatus() == MissionStatus.COMPLETED) {
            throw new RuntimeException("Không thể hủy mission đã hoàn thành");
        }

        LocalDateTime startedAt = item.getCart().getStartedAt();
        boolean within30Min = startedAt == null ||
            ChronoUnit.MINUTES.between(startedAt, LocalDateTime.now()) < 30;

        // Nếu đang ở bước IN_PROGRESS hoặc AT_LOCATION → request cancel
        if (item.getStatus() == MissionStatus.IN_PROGRESS
                || item.getStatus() == MissionStatus.AT_LOCATION
                || !within30Min) {
            item.setStatus(MissionStatus.CANCEL_REQUESTED);
        } else {
            item.setStatus(MissionStatus.CANCELLED);
            item.setCancelledAt(LocalDateTime.now());
        }
        cartItemRepository.save(item);
    }

    // ─────────────── XP ───────────────────────────────────────

    @Transactional(readOnly = true)
    public UserXpDTO getUserXp(UUID userId) {
        UserXp xp = userXpRepository.findById(userId)
            .orElse(UserXp.builder().userId(userId).build());
        int xpToNext = 200 - (xp.getTotalXp() % 200);
        return UserXpDTO.builder()
            .totalXp(xp.getTotalXp())
            .level(xp.getLevel())
            .missionsCompleted(xp.getMissionsCompleted())
            .xpToNextLevel(xpToNext)
            .build();
    }

    // ─────────────── PRIVATE HELPERS ──────────────────────────

    private MissionCart getOrCreateCart(UUID userId) {
        return cartRepository.findActiveCartByUserId(userId)
            .orElseGet(() -> {
                MissionCart newCart = MissionCart.builder().userId(userId).build();
                return cartRepository.save(newCart);
            });
    }

    private void addXpToUser(UUID userId, int xp) {
        UserXp userXp = userXpRepository.findById(userId)
            .orElse(UserXp.builder().userId(userId).build());
        userXp.addXp(xp);
        userXpRepository.save(userXp);
    }

    private void validateStatusTransition(MissionStatus current, MissionStatus next) {
        // Luồng hợp lệ: ACTIVE → IN_PROGRESS → AT_LOCATION
        boolean valid = switch (current) {
            case ACTIVE   -> next == MissionStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == MissionStatus.AT_LOCATION;
            default -> false;
        };
        if (!valid) {
            throw new RuntimeException(
                "Không thể chuyển từ " + current + " sang " + next);
        }
    }

    /**
     * Công thức Haversine tính khoảng cách (mét) giữa 2 tọa độ
     */
    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000; // bán kính Trái Đất (mét)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
