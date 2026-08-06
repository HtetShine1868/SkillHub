package com.example.backend.auth.service;

import com.example.backend.user.entity.User;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
public class OAuth2Service {

    private final AuthService authService;

    public OAuth2Service(@Lazy AuthService authService) {
        this.authService = authService;
    }

    public User processGoogleUser(
            String email,
            String name,
            String googleId,
            String profileImage
    ) {
        return authService.findOrCreateGoogleUser(
                email,
                name,
                googleId,
                profileImage
        );
    }
}