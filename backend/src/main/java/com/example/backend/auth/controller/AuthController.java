package com.example.backend.auth.controller;

import com.example.backend.auth.dto.AuthResponse;
import com.example.backend.auth.dto.LoginRequest;
import com.example.backend.auth.dto.RegisterRequest;
import com.example.backend.auth.security.JwtService;
import com.example.backend.auth.service.AuthService;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;

import com.example.backend.auth.security.AuthRateLimitService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private final UserRepository userRepository;

    private final JwtService jwtService;

    private final AuthRateLimitService authRateLimitService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid
            @RequestBody
            RegisterRequest request,

            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        String ip = clientIp(httpRequest);
        authRateLimitService.assertAllowed(ip, request.getEmail());

        AuthResponse authResponse;
        try {
            authResponse = authService.register(request);
        } catch (IllegalArgumentException ex) {
            authRateLimitService.recordFailure(ip, request.getEmail());
            throw ex;
        }
        authRateLimitService.recordSuccess(ip, authResponse.getEmail());

        User user =
                userRepository
                        .findByEmail(
                                authResponse.getEmail()
                        )
                        .orElseThrow();

        addTokenCookie(
                response,
                jwtService.generateToken(
                        user.getEmail()
                )
        );

        return ResponseEntity.ok(
                authResponse
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid
            @RequestBody
            LoginRequest request,

            HttpServletRequest httpRequest,
            HttpServletResponse response
    ) {
        String ip = clientIp(httpRequest);
        authRateLimitService.assertAllowed(ip, request.getEmail());

        try {
            AuthResponse authResponse =
                    authService.login(request);
            authRateLimitService.recordSuccess(ip, authResponse.getEmail());

            addTokenCookie(
                    response,
                    jwtService.generateToken(
                            authResponse.getEmail()
                    )
            );

            return ResponseEntity.ok(
                    authResponse
            );
        } catch (IllegalArgumentException ex) {
            authRateLimitService.recordFailure(ip, request.getEmail());
            throw ex;
        }
    }

    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(
            @AuthenticationPrincipal
            UserDetails principal
    ) {

        User user =
                userRepository
                        .findByEmail(
                                principal.getUsername()
                        )
                        .orElseThrow();

        return ResponseEntity.ok(
                authService.toResponse(user)
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletResponse response
    ) {

        Cookie cookie =
                new Cookie(
                        "SKILLHUB_TOKEN",
                        null
                );

        applyCookieFlags(cookie);
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Logged out successfully"
                )
        );
    }

    private void addTokenCookie(
            HttpServletResponse response,
            String token
    ) {

        Cookie cookie =
                new Cookie(
                        "SKILLHUB_TOKEN",
                        token
                );

        applyCookieFlags(cookie);
        cookie.setMaxAge(
                60 * 60 * 24
        );

        response.addCookie(cookie);
    }

    private void applyCookieFlags(Cookie cookie) {
        boolean secure = frontendUrl != null && frontendUrl.toLowerCase().startsWith("https");
        cookie.setHttpOnly(true);
        cookie.setSecure(secure);
        cookie.setPath("/");
        cookie.setAttribute("SameSite", secure ? "None" : "Lax");
    }
}