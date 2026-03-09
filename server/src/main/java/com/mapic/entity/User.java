package com.mapic.entity; 
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter // Dùng @Getter thay vì @Data để kiểm soát tốt hơn với các quan hệ JPA
@Setter // Dùng @Setter thay vì @Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(unique = true, length = 15)
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phone;

    @Column(name = "password", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore // Không trả về password trong JSON response
    private String password;

    @Column(name = "nick_name", nullable = false, length = 100)
    private String nickName;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(length = 255)
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_visibility", nullable = false, length = 20)
    @Builder.Default
    private ProfileVisibility profileVisibility = ProfileVisibility.PUBLIC;

    // Cờ trạng thái (false = chưa xác minh/bị khóa, true = hoạt động)
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = false;

    // Thời điểm xác minh email (NULL = chưa xác minh)
    @Column(name = "email_verified")
    private LocalDateTime emailVerified;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    // --- MỐI QUAN HỆ VỚI BẢNG CURRENT_LOCATION ---
    // Giúp bạn lấy được vị trí hiện tại ngay từ object User: user.getCurrentLocation()
    @ToString.Exclude // Ngăn lỗi StackOverflow do vòng lặp khi log dữ liệu
    @com.fasterxml.jackson.annotation.JsonIgnore // Ngăn circular reference khi serialize JSON
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @PrimaryKeyJoinColumn
    private CurrentLocation currentLocation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Implement UserDetails methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList(); // Không có roles/authorities trong app này
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}