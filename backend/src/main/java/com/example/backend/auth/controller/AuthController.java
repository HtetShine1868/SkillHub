package com.example.backend.auth.controller;

import com.example.backend.auth.dto.AuthResponse;
import com.example.backend.auth.dto.LoginRequest;
import com.example.backend.auth.dto.RegisterRequest;
import com.example.backend.auth.security.JwtService;
import com.example.backend.auth.service.AuthService;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid
            @RequestBody
            RegisterRequest request,

            HttpServletResponse response
    ) {

        AuthResponse authResponse =
                authService.register(request);

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

            HttpServletResponse response
    ) {

        AuthResponse authResponse =
                authService.login(request);

        addTokenCookie(
                response,
                jwtService.generateToken(
                        authResponse.getEmail()
                )
        );

        return ResponseEntity.ok(
                authResponse
        );
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

        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
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

        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(
                60 * 60 * 24
        );

        response.addCookie(cookie);
    }
}