package com.mapic.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    // TODO: Cấu hình SMTP để gửi email thật
    // Hiện tại chỉ log ra console để test
    
    public void sendEmail(String to, String subject, String message) {
        log.info("=".repeat(60));
        log.info("📧 SENDING EMAIL");
        log.info("To: {}", to);
        log.info("Subject: {}", subject);
        log.info("Message:\n{}", message);
        log.info("=".repeat(60));
        
        // TODO: Implement real email sending với JavaMailSender
        // Ví dụ:
        // SimpleMailMessage mailMessage = new SimpleMailMessage();
        // mailMessage.setTo(to);
        // mailMessage.setSubject(subject);
        // mailMessage.setText(message);
        // mailSender.send(mailMessage);
    }
}
