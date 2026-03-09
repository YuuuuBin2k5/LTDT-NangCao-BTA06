package com.mapic.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mapic.dto.ChangeContactRequest;
import com.mapic.dto.ChangePasswordRequest;
import com.mapic.dto.ContactType;
import com.mapic.dto.UpdateProfileRequest;
import com.mapic.dto.UserSearchResultDTO;
import com.mapic.entity.FriendshipStatus;
import com.mapic.entity.OtpToken;
import com.mapic.entity.User;
import com.mapic.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final OtpService otpService;
    private final FriendshipService friendshipService;

    @Transactional
    public User updateProfile(User user, UpdateProfileRequest request) {
        System.out.println("📝 Updating profile for user: " + user.getUsername());
        
        // Update fields
        if (request.getNickName() != null && !request.getNickName().trim().isEmpty()) {
            user.setNickName(request.getNickName());
            System.out.println("   Updated nickName: " + request.getNickName());
        }
        
        if (request.getBio() != null) {
            user.setBio(request.getBio());
            System.out.println("   Updated bio: " + request.getBio());
        }
        
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
            System.out.println("   Updated avatarUrl: " + request.getAvatarUrl());
        }
        
        // Save to database
        User savedUser = userRepository.save(user);
        System.out.println("✅ Profile saved to database");
        
        return savedUser;
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        System.out.println("🔐 Change password attempt for user: " + user.getUsername());
        
        // 1. Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            System.out.println("❌ Current password mismatch for user: " + user.getUsername());
            throw new RuntimeException("Mật khẩu hiện tại không đúng!");
        }
        System.out.println("✅ Current password verified");
        
        // 2. Validate new password (min 6 chars)
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            System.out.println("❌ New password too short");
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }
        System.out.println("✅ New password validated");
        
        // 3. Hash and save new password
        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(hashedPassword);
        userRepository.save(user);
        System.out.println("✅ New password saved to database");
        
        // 4. Send confirmation email
        String subject = "Xác nhận thay đổi mật khẩu";
        String message = String.format(
            "Xin chào %s,\n\n" +
            "Mật khẩu của bạn đã được thay đổi thành công.\n\n" +
            "Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức.\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ Mapic",
            user.getNickName()
        );
        emailService.sendEmail(user.getEmail(), subject, message);
        System.out.println("✅ Confirmation email sent to: " + user.getEmail());
    }

    @Transactional
    public void requestContactChange(User user, ChangeContactRequest request) {
        System.out.println("📧 Request contact change for user: " + user.getUsername());
        System.out.println("   Type: " + request.getType());
        System.out.println("   New contact: " + request.getNewContact());
        
        String newContact = request.getNewContact();
        ContactType type = request.getType();
        
        // 1. Validate format
        if (type == ContactType.EMAIL) {
            if (!isValidEmail(newContact)) {
                System.out.println("❌ Invalid email format: " + newContact);
                throw new RuntimeException("Định dạng email không hợp lệ!");
            }
            System.out.println("✅ Email format validated");
        } else if (type == ContactType.PHONE) {
            if (!isValidPhone(newContact)) {
                System.out.println("❌ Invalid phone format: " + newContact);
                throw new RuntimeException("Định dạng số điện thoại không hợp lệ! Phải có 10-15 chữ số.");
            }
            System.out.println("✅ Phone format validated");
        }
        
        // 2. Check duplicate
        if (type == ContactType.EMAIL) {
            if (userRepository.existsByEmail(newContact)) {
                System.out.println("❌ Email already exists: " + newContact);
                throw new RuntimeException("Email này đã được sử dụng!");
            }
            System.out.println("✅ Email is available");
        } else if (type == ContactType.PHONE) {
            if (userRepository.existsByPhone(newContact)) {
                System.out.println("❌ Phone already exists: " + newContact);
                throw new RuntimeException("Số điện thoại này đã được sử dụng!");
            }
            System.out.println("✅ Phone is available");
        }
        
        // 3. Generate OTP
        OtpToken.OtpType otpType = type == ContactType.EMAIL 
            ? OtpToken.OtpType.EMAIL_CHANGE 
            : OtpToken.OtpType.PHONE_CHANGE;
        
        String otpCode = otpService.generateAndSendOtp(newContact, otpType);
        System.out.println("✅ OTP generated: " + otpCode);
        
        // 4. Send OTP (mock with System.out.println)
        System.out.println("📱 Sending OTP to " + newContact);
        System.out.println("   OTP Code: " + otpCode);
        System.out.println("   Type: " + otpType);
        System.out.println("✅ OTP sent successfully");
    }
    
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        // Simple email validation regex
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        return email.matches(emailRegex);
    }
    
    private boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        // Phone must be 10-15 digits
        String phoneRegex = "^[0-9]{10,15}$";
        return phone.matches(phoneRegex);
    }

    @Transactional
    public void verifyContactChange(User user, com.mapic.dto.VerifyContactChangeRequest request) {
        System.out.println("🔍 Verify contact change for user: " + user.getUsername());
        System.out.println("   Type: " + request.getType());
        System.out.println("   OTP Code: " + request.getOtpCode());
        
        String otpCode = request.getOtpCode();
        ContactType type = request.getType();
        
        // 1. Validate OTP code input
        if (otpCode == null || otpCode.trim().isEmpty()) {
            System.out.println("❌ OTP code is empty");
            throw new RuntimeException("Mã OTP không được để trống!");
        }
        
        // 2. Determine OTP type and get the new contact from OTP record
        OtpToken.OtpType otpType = type == ContactType.EMAIL 
            ? OtpToken.OtpType.EMAIL_CHANGE 
            : OtpToken.OtpType.PHONE_CHANGE;
        
        // 3. Find the OTP token to get the new contact value
        OtpToken otpToken = otpService.findValidOtpToken(otpCode, otpType);
        
        if (otpToken == null) {
            System.out.println("❌ Invalid or expired OTP code");
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn!");
        }
        
        String newContact = otpToken.getEmail(); // The 'email' field stores the new contact (email or phone)
        System.out.println("✅ OTP verified successfully");
        System.out.println("   New contact: " + newContact);
        
        // 4. Verify OTP (this will mark it as used)
        boolean isValid = otpService.verifyOtp(newContact, otpCode, otpType);
        
        if (!isValid) {
            System.out.println("❌ OTP verification failed");
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn!");
        }
        
        // 5. Update email or phone in User entity
        String oldContact;
        if (type == ContactType.EMAIL) {
            oldContact = user.getEmail();
            user.setEmail(newContact);
            System.out.println("✅ Email updated from " + oldContact + " to " + newContact);
        } else if (type == ContactType.PHONE) {
            oldContact = user.getPhone();
            user.setPhone(newContact);
            System.out.println("✅ Phone updated from " + oldContact + " to " + newContact);
        } else {
            System.out.println("❌ Invalid contact type: " + type);
            throw new RuntimeException("Loại liên hệ không hợp lệ!");
        }
        
        // 6. Save to database
        userRepository.save(user);
        System.out.println("✅ User saved to database");
        
        // 7. Send confirmation notification
        String subject = type == ContactType.EMAIL 
            ? "Xác nhận thay đổi email" 
            : "Xác nhận thay đổi số điện thoại";
        
        String message = String.format(
            "Xin chào %s,\n\n" +
            "%s của bạn đã được thay đổi thành công thành: %s\n\n" +
            "Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức.\n\n" +
            "Trân trọng,\n" +
            "Đội ngũ Mapic",
            user.getNickName(),
            type == ContactType.EMAIL ? "Email" : "Số điện thoại",
            newContact
        );
        
        // Send to the NEW contact (for email changes) or old email (for phone changes)
        String notificationTarget = type == ContactType.EMAIL ? newContact : user.getEmail();
        emailService.sendEmail(notificationTarget, subject, message);
        System.out.println("✅ Confirmation notification sent to: " + notificationTarget);
    }

    /**
     * Search for users by keyword and enrich results with friendship status.
     * Only returns users with PUBLIC profile visibility.
     * Excludes sensitive fields (email, phone, password) from results.
     * 
     * @param keyword The search keyword to match against nickName or username
     * @param authenticatedUserId The ID of the user performing the search
     * @return List of UserSearchResultDTO with friendship status information
     */
    @Transactional(readOnly = true)
    public List<UserSearchResultDTO> searchUsers(String keyword, UUID authenticatedUserId) {
        System.out.println("🔍 Searching users with keyword: " + keyword);
        System.out.println("   Authenticated user: " + authenticatedUserId);
        
        // Return empty list if keyword is null or empty
        if (keyword == null || keyword.trim().isEmpty()) {
            System.out.println("✅ Empty keyword, returning empty results");
            return List.of();
        }
        
        // Step 1: Search public users using repository
        List<User> users = userRepository.searchPublicUsers(keyword);
        System.out.println("✅ Found " + users.size() + " public users matching keyword");
        
        // Step 2: Enrich with friendship status and map to DTO
        List<UserSearchResultDTO> results = users.stream()
            .map(user -> {
                // Get friendship status between authenticated user and result user
                FriendshipStatus status = friendshipService.getFriendshipStatus(
                    authenticatedUserId, 
                    user.getId()
                );
                
                // Map to DTO, excluding sensitive fields (email, phone, password)
                return UserSearchResultDTO.builder()
                    .id(user.getId())
                    .name(user.getNickName()) // Maps nickName to name field in DTO
                    .username(user.getUsername())
                    .avatarUrl(user.getAvatarUrl())
                    .friendshipStatus(status) // null if no friendship exists
                    .friendshipId(null) // Will be populated when we enhance FriendshipService
                    .build();
            })
            .collect(Collectors.toList());
        
        System.out.println("✅ Enriched " + results.size() + " results with friendship status");
        return results;
    }
}
