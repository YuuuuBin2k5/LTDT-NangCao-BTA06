package com.mapic.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        boolean isPublicEndpoint = path.startsWith("/api/auth/") || 
                                   path.startsWith("/uploads/") ||
                                   path.equals("/api/places/search") ||
                                   path.equals("/api/posts/nearby") ||
                                   path.equals("/api/posts/feed") ||
                                   path.equals("/api/posts/test-auth");

        // Lấy header Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Kiểm tra xem header có tồn tại và bắt đầu bằng "Bearer " không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Lấy token (bỏ "Bearer " prefix)
        jwt = authHeader.substring(7);
        
        try {
            // Extract username từ token
            username = jwtUtil.extractUsername(jwt);
            log.debug("JWT Filter - Extracted username: {} for path: {}", username, path);

            // Nếu username tồn tại và chưa có authentication trong context
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user details từ database
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                log.debug("JWT Filter - Loaded user details for: {}", username);

                // Validate token
                if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                    // Tạo authentication object
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication vào SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("JWT Filter - Authentication set for: {}", username);
                } else {
                    log.warn("JWT Filter - Token validation failed for: {}", username);
                    // For public endpoints, continue even if token is invalid
                    if (!isPublicEndpoint) {
                        log.error("JWT Filter - Blocking request to protected endpoint with invalid token");
                    }
                }
            }
        } catch (Exception e) {
            // Token không hợp lệ
            log.error("JWT Filter - Error processing token for path {}: {}", path, e.getMessage());
            // For public endpoints, continue even if there's an error
            if (!isPublicEndpoint) {
                log.error("JWT Filter - Blocking request to protected endpoint due to token error");
            }
        }

        filterChain.doFilter(request, response);
    }
}
