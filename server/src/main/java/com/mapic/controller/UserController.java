package com.mapic.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.mapic.dto.ChangeContactRequest;
import com.mapic.dto.ChangePasswordRequest;
import com.mapic.dto.UpdateProfileRequest;
import com.mapic.dto.UserResponse;
import com.mapic.dto.UserSearchResultDTO;
import com.mapic.dto.VerifyContactChangeRequest;
import com.mapic.entity.User;
import com.mapic.service.UserService;
import com.mapic.service.AvatarFrameService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AvatarFrameService avatarFrameService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal User user) {
        System.out.println("📋 Get profile request from user: " + user.getUsername());
        
        UserResponse response = UserResponse.builder()
                .user(user)
                .selectedFrame(avatarFrameService.getSelectedFrame(user.getId()))
                .build();
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        
        System.out.println("📝 Update profile request from user: " + user.getUsername());
        System.out.println("   NickName: " + request.getNickName());
        System.out.println("   Bio: " + request.getBio());
        System.out.println("   AvatarUrl: " + request.getAvatarUrl());
        try {
            User updatedUser = userService.updateProfile(user, request);
            
            UserResponse response = UserResponse.builder()
                    .message("Cập nhật thông tin thành công!")
                    .user(updatedUser)
                    .selectedFrame(avatarFrameService.getSelectedFrame(updatedUser.getId()))
                    .build();
            
            System.out.println("✅ Profile updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Failed to update profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequest request) {
        
        System.out.println("🔐 Change password request from user: " + user.getUsername());
        
        try {
            userService.changePassword(user, request);
            
            UserResponse response = UserResponse.builder()
                    .message("Đổi mật khẩu thành công!")
                    .user(user)
                    .build();
            
            System.out.println("✅ Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("❌ Failed to change password: " + e.getMessage());
            
            UserResponse errorResponse = UserResponse.builder()
                    .message(e.getMessage())
                    .build();
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.out.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            
            UserResponse errorResponse = UserResponse.builder()
                    .message("Đã xảy ra lỗi khi đổi mật khẩu!")
                    .build();
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/contact/request")
    public ResponseEntity<?> requestContactChange(
            @AuthenticationPrincipal User user,
            @RequestBody ChangeContactRequest request) {
        
        System.out.println("📧 Request contact change from user: " + user.getUsername());
        System.out.println("   Type: " + request.getType());
        System.out.println("   New contact: " + request.getNewContact());
        
        try {
            userService.requestContactChange(user, request);
            
            UserResponse response = UserResponse.builder()
                    .message("Mã OTP đã được gửi đến " + request.getNewContact())
                    .build();
            
            System.out.println("✅ Contact change request processed successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("❌ Failed to request contact change: " + e.getMessage());
            
            UserResponse errorResponse = UserResponse.builder()
                    .message(e.getMessage())
                    .build();
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.out.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            
            UserResponse errorResponse = UserResponse.builder()
                    .message("Đã xảy ra lỗi khi yêu cầu thay đổi thông tin liên hệ!")
                    .build();
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/contact/verify")
    public ResponseEntity<?> verifyContactChange(
            @AuthenticationPrincipal User user,
            @RequestBody VerifyContactChangeRequest request) {
        
        System.out.println("🔍 Verify contact change from user: " + user.getUsername());
        System.out.println("   Type: " + request.getType());
        System.out.println("   OTP Code: " + request.getOtpCode());
        
        try {
            userService.verifyContactChange(user, request);
            
            // Refresh user data after update
            UserResponse response = UserResponse.builder()
                    .message("Thay đổi thông tin liên hệ thành công!")
                    .user(user)
                    .build();
            
            System.out.println("✅ Contact change verified successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("❌ Failed to verify contact change: " + e.getMessage());
            
            UserResponse errorResponse = UserResponse.builder()
                    .message(e.getMessage())
                    .build();
            
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            System.out.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            
            UserResponse errorResponse = UserResponse.builder()
                    .message("Đã xảy ra lỗi khi xác thực thay đổi thông tin liên hệ!")
                    .build();
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @AuthenticationPrincipal User user,
            @RequestParam String keyword) {
        
        System.out.println("🔍 User search request from user: " + user.getUsername());
        System.out.println("   Keyword: " + keyword);
        
        try {
            List<UserSearchResultDTO> results = userService.searchUsers(keyword, user.getId());
            
            System.out.println("✅ Search completed successfully, found " + results.size() + " users");
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.out.println("❌ Failed to search users: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.internalServerError().build();
        }
    }
}
