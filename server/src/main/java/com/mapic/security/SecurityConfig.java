package com.mapic.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Tắt CSRF (Cross-Site Request Forgery) vì chúng ta dùng REST API gửi JSON, không dùng form HTML
            .csrf(AbstractHttpConfigurer::disable)
            
            // Enable anonymous authentication
            .anonymous(anonymous -> anonymous.principal("anonymousUser"))
            
            // Cấu hình phân quyền đường dẫn
            .authorizeHttpRequests(auth -> auth
                // Cho phép tất cả mọi người (không cần token) truy cập vào /login và /register
                .requestMatchers("/api/auth/**").permitAll()
                
                // Cho phép tìm kiếm địa điểm mà không cần đăng nhập
                .requestMatchers("/api/places/search", "/api/places/search/**").permitAll()
                
                // Cho phép xem posts công khai (nearby, feed) mà không cần đăng nhập
                .requestMatchers(
                    "/api/posts/nearby", 
                    "/api/posts/nearby/**",
                    "/api/posts/feed", 
                    "/api/posts/feed/**",
                    "/api/posts/test-auth",
                    "/api/posts/test-auth/**"
                ).permitAll()
                
                // Cho phép truy cập công khai vào ảnh đã upload
                .requestMatchers("/uploads/**").permitAll()

                // Cho phép xem danh sách missions mà không cần đăng nhập
                // (cart, tracker, checkin vẫn yêu cầu auth)
                .requestMatchers("/api/missions", "/api/missions/{id}").permitAll()
                
                // Tất cả các request khác (ví dụ: cập nhật tọa độ, xem reviews) bắt buộc phải đăng nhập (có token)
                .anyRequest().authenticated()
            )
            
            // Handle authentication exceptions
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"" + authException.getMessage() + "\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Forbidden\", \"message\": \"" + accessDeniedException.getMessage() + "\"}");
                })
            )
            
            // Chuyển cơ chế quản lý phiên (Session) sang Stateless
            // Nghĩa là server sẽ không lưu trạng thái đăng nhập trong bộ nhớ, chuẩn bị dọn đường cho JWT
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Thêm JWT filter trước UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}