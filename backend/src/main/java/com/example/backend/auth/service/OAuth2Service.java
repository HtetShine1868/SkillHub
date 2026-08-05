package com.example.backend.auth.service;

import com.example.backend.user.entity.User;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final AuthService authService;

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