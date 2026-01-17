package com.smd.auth_service.controller;

import com.smd.auth_service.dto.AuthResponse;
import com.smd.auth_service.dto.LoginRequest;
import com.smd.auth_service.dto.RegisterRequest;
import com.smd.auth_service.security.JwtTokenProvider;
import com.smd.auth_service.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired(required = false)
    private StringRedisTemplate stringRedisTemplate;

    @Value("${app.jwtExpirationMs:86400000}")
    private long jwtExpirationMs;

    /**
     * POST /api/auth/register
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation error: " + bindingResult.getAllErrors());
        }

        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    /**
     * POST /api/auth/login
     * Login user
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body("Validation error: " + bindingResult.getAllErrors());
        }

        try {
            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");

            AuthResponse response = userService.login(request, ipAddress, userAgent);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login failed: " + e.getMessage());
        }
    }

    /**
     * POST /api/auth/refresh
     * Body: { "refreshToken": "..." }
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().body("Missing refreshToken");
        }

        try {
            // validate refresh token
            boolean ok = jwtTokenProvider.validateJwtToken(refreshToken);
            if (!ok) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refreshToken");
            }

            String username = jwtTokenProvider.getUserNameFromJwtToken(refreshToken);

            // issue new tokens
            String newAccessToken = jwtTokenProvider.generateTokenFromUsername(username);
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

            // trả về AuthResponse (các field user có thể null nếu bạn không cần)
            AuthResponse resp = AuthResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .username(username)
                    .build();

            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            log.error("Refresh error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh failed: " + e.getMessage());
        }
    }

    /**
     * POST /api/auth/logout
     * Header: Authorization: Bearer <accessToken>
     * -> blacklist access token vào Redis (TTL ~ jwtExpirationMs)
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Authorization Bearer token");
        }

        String token = authHeader.substring(7);

        try {
            // nếu Redis chưa cấu hình, vẫn cho logout OK (không crash)
            if (stringRedisTemplate != null) {
                String key = "bl:token:" + token;
                stringRedisTemplate.opsForValue().set(key, "1", Duration.ofMillis(jwtExpirationMs));
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Logout failed: " + e.getMessage());
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }
}
