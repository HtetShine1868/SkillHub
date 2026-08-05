package com.example.backend.auth.service;

import com.example.backend.auth.dto.*;
import com.example.backend.auth.security.JwtService;
import com.example.backend.user.entity.AuthProvider;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public AuthResponse register(
            RegisterRequest request
    ) {

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        if (!request.getPassword()
                .equals(request.getConfirmPassword())) {

            throw new IllegalArgumentException(
                    "Passwords do not match"
            );
        }

        if (userRepository.existsByEmail(email)) {

            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .provider(AuthProvider.LOCAL)
                .providerId(null)
                .profileImage(null)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        return toResponse(user);
    }

    public AuthResponse login(
            LoginRequest request
    ) {

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Invalid email or password"
                                )
                        );

        if (user.getPassword() == null) {

            throw new IllegalArgumentException(
                    "This account uses Google login"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        return toResponse(user);
    }

    public User findOrCreateGoogleUser(
            String email,
            String name,
            String googleId,
            String profileImage
    ) {

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElse(null);

        if (user != null) {

            user.setProviderId(googleId);

            if (profileImage != null) {
                user.setProfileImage(profileImage);
            }

            user.setEmailVerified(true);

            return userRepository.save(user);
        }

        User newUser = User.builder()
                .name(name)
                .email(normalizedEmail)
                .password(null)
                .provider(AuthProvider.GOOGLE)
                .providerId(googleId)
                .profileImage(profileImage)
                .emailVerified(true)
                .build();

        return userRepository.save(newUser);
    }

    public String generateToken(User user) {

        return jwtService.generateToken(
                user.getEmail()
        );
    }

    public AuthResponse toResponse(User user) {

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .provider(
                        user.getProvider().name()
                )
                .emailVerified(
                        user.isEmailVerified()
                )
                .build();
    }
}
