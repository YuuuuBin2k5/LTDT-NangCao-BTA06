package com.mapic.repository;

import com.mapic.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findByEmailAndOtpCodeAndTypeAndUsedFalse(
            String email, 
            String otpCode, 
            OtpToken.OtpType type
    );
    
    Optional<OtpToken> findByOtpCodeAndTypeAndUsedFalse(
            String otpCode,
            OtpToken.OtpType type
    );
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
    
    void deleteByEmailAndType(String email, OtpToken.OtpType type);
}
