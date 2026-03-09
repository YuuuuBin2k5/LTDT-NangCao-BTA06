package com.mapic.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mapic.dto.*;
import com.mapic.entity.OtpToken;
import com.mapic.entity.User;
import com.mapic.repository.UserRepository;
import com.mapic.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    
    // Spring Security 
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        System.out.println("📝 Registration attempt - Email: " + request.getEmail() + ", Username: " + request.getUsername());
        
        // 1. Kiểm tra trùng lặp
        if (userRepository.existsByEmail(request.getEmail())) {
            System.out.println("❌ Email already exists: " + request.getEmail());
            throw new RuntimeException("Email đã được sử dụng!");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            System.out.println("❌ Username already exists: " + request.getUsername());
            throw new RuntimeException("Username đã tồn tại!");
        }

        System.out.println("✅ Email and username are available");

        // 2. Tạo đối tượng User mới từ request
        User newUser = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) 
                .nickName(request.getNickName())
                .avatarUrl(request.getUrlAvatar())
                .bio(request.getBio())
                .isActive(false) // Đợi xác minh OTP
                .build();

        // 3. Lưu vào DB
        User savedUser = userRepository.save(newUser);
        System.out.println("✅ User saved - ID: " + savedUser.getId() + ", Username: " + savedUser.getUsername());

        // 4. Gửi OTP qua email
        otpService.generateAndSendOtp(savedUser.getEmail(), OtpToken.OtpType.REGISTRATION);
        System.out.println("✅ OTP sent to: " + savedUser.getEmail());

        // 5. Trả về kết quả
        return AuthResponse.builder()
                .message("Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP xác thực.")
                .userId(savedUser.getId())
                .nickName(savedUser.getNickName())
                .build();
    }

    @Transactional
    public AuthResponse verifyRegistration(VerifyOtpRequest request) {
        // 1. Verify OTP
        boolean isValid = otpService.verifyOtp(
                request.getEmail(), 
                request.getOtpCode(), 
                OtpToken.OtpType.REGISTRATION
        );

        if (!isValid) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn!");
        }

        // 2. Kích hoạt tài khoản
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));

        user.setActive(true);
        userRepository.save(user);

        // 3. Tạo JWT token để tự động đăng nhập
        String token = jwtUtil.generateToken(user.getUsername());

        return AuthResponse.builder()
                .message("Xác thực thành công! Tài khoản đã được kích hoạt.")
                .token(token)
                .userId(user.getId())
                .nickName(user.getNickName())
                .build();
    }

    public AuthResponse resendOtp(ResendOtpRequest request) {
        // Kiểm tra user tồn tại
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));

        if (user.isActive()) {
            throw new RuntimeException("Tài khoản đã được kích hoạt!");
        }

        // Gửi lại OTP
        otpService.generateAndSendOtp(request.getEmail(), OtpToken.OtpType.REGISTRATION);

        return AuthResponse.builder()
                .message("Mã OTP mới đã được gửi đến email của bạn!")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        System.out.println("🔐 Login attempt - Email: " + request.getEmail());
        
        // 1. Tìm user theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("❌ User not found with email: " + request.getEmail());
                    return new RuntimeException("Không tìm thấy tài khoản với email này!");
                });

        System.out.println("✅ User found - Username: " + user.getUsername() + ", Active: " + user.isActive());

        // 2. Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            System.out.println("❌ Password mismatch for user: " + user.getUsername());
            throw new RuntimeException("Sai mật khẩu!");
        }

        System.out.println("✅ Password matched");

        // 3. Kiểm tra trạng thái kích hoạt
        if (!user.isActive()) {
            System.out.println("❌ Account not active for user: " + user.getUsername());
            throw new RuntimeException("Tài khoản chưa được xác minh! Vui lòng kiểm tra email.");
        }

        System.out.println("✅ Account is active");

        // 4. Tạo JWT token
        String token = jwtUtil.generateToken(user.getUsername());

        System.out.println("✅ Login successful - Token generated for: " + user.getUsername());

        return AuthResponse.builder()
                .message("Đăng nhập thành công!")
                .token(token)
                .userId(user.getId())
                .nickName(user.getNickName())
                .build();
    }

    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        // Kiểm tra user tồn tại
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));

        // Gửi OTP reset password
        otpService.generateAndSendOtp(request.getEmail(), OtpToken.OtpType.PASSWORD_RESET);

        return AuthResponse.builder()
                .message("Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn!")
                .build();
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        // 1. Verify OTP
        boolean isValid = otpService.verifyOtp(
                request.getEmail(), 
                request.getOtpCode(), 
                OtpToken.OtpType.PASSWORD_RESET
        );

        if (!isValid) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn!");
        }

        // 2. Cập nhật mật khẩu mới
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return AuthResponse.builder()
                .message("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.")
                .build();
    }
}