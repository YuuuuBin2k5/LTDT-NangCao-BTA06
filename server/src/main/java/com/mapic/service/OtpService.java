package com.mapic.service;

import com.mapic.entity.OtpToken;
import com.mapic.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    private static final int OTP_EXPIRY_MINUTES = 10;

    public String generateAndSendOtp(String email, OtpToken.OtpType type) {
        // Xóa OTP cũ nếu có
        otpTokenRepository.deleteByEmailAndType(email, type);

        // Tạo OTP 6 số
        String otpCode = generateOtpCode();

        // Lưu vào database
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otpCode(otpCode)
                .type(type)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .used(false)
                .build();

        otpTokenRepository.save(otpToken);

        // Gửi email
        String subject = getSubjectByType(type);
        
        String message = String.format(
                "Mã OTP của bạn là: %s\n\nMã này sẽ hết hạn sau %d phút.\n\nNếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.",
                otpCode,
                OTP_EXPIRY_MINUTES
        );

        emailService.sendEmail(email, subject, message);

        return otpCode; // Chỉ return để test, production không nên return
    }
    
    private String getSubjectByType(OtpToken.OtpType type) {
        switch (type) {
            case REGISTRATION:
                return "MAPIC - Mã xác thực đăng ký";
            case PASSWORD_RESET:
                return "MAPIC - Mã khôi phục mật khẩu";
            case EMAIL_CHANGE:
                return "MAPIC - Mã xác thực thay đổi email";
            case PHONE_CHANGE:
                return "MAPIC - Mã xác thực thay đổi số điện thoại";
            default:
                return "MAPIC - Mã xác thực";
        }
    }

    @Transactional
    public boolean verifyOtp(String email, String otpCode, OtpToken.OtpType type) {
        var otpToken = otpTokenRepository
                .findByEmailAndOtpCodeAndTypeAndUsedFalse(email, otpCode, type)
                .orElse(null);

        if (otpToken == null) {
            return false;
        }

        if (otpToken.isExpired()) {
            return false;
        }

        // Đánh dấu đã sử dụng
        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);

        return true;
    }

    public OtpToken findValidOtpToken(String otpCode, OtpToken.OtpType type) {
        var otpToken = otpTokenRepository
                .findByOtpCodeAndTypeAndUsedFalse(otpCode, type)
                .orElse(null);

        if (otpToken == null) {
            return null;
        }

        if (otpToken.isExpired()) {
            return null;
        }

        return otpToken;
    }

    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // 6 chữ số
        return String.valueOf(otp);
    }

    @Transactional
    public void cleanupExpiredOtps() {
        otpTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
