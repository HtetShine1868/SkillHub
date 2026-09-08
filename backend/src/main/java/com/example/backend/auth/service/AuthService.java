package com.example.backend.auth.service;

import com.example.backend.auth.dto.*;
import com.example.backend.auth.security.JwtService;
import com.example.backend.user.entity.AuthProvider;
import com.example.backend.user.entity.User;
import com.example.backend.user.entity.Role;
import com.example.backend.user.repository.UserRepository;
import com.example.backend.skill.UserSkillRepository;
import com.example.backend.skill.UserSkill;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final UserSkillRepository userSkillRepository;

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

        Role assignedRole = Role.USER;
        if (request.getRole() != null) {
            String r = request.getRole().trim().toUpperCase();
            if (r.contains("INSTRUCTOR")) {
                assignedRole = Role.INSTRUCTOR;
            }
        }

        User newUser =
                User.builder()
                        .name(request.getName().trim())
                        .email(email)
                        .password(
                                passwordEncoder.encode(
                                        request.getPassword()
                                )
                        )
                        .provider(AuthProvider.LOCAL)
                        .role(assignedRole)
                        .emailVerified(false)
                        .build();

        return toResponse(userRepository.save(newUser));
    }

    public AuthResponse login(LoginRequest request) {

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "Invalid email or password"
                                        )
                        );

        if (user.getPassword() == null) {

            throw new IllegalArgumentException(
                    "This account uses social login. Please sign in with Google."
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

    public AuthResponse loginOAuth2(
            String email,
            String name,
            String providerId,
            String profileImage
    ) {

        User user =
                userRepository
                        .findByEmail(email.toLowerCase())
                        .orElse(null);

        if (user == null) {

            user =
                    User.builder()
                            .email(email.toLowerCase())
                            .name(name)
                            .provider(AuthProvider.GOOGLE)
                            .providerId(providerId)
                            .profileImage(profileImage)
                            .emailVerified(true)
                            .role(Role.USER)
                            .build();

            user = userRepository.save(user);

        } else {

            user.setName(name);
            user.setProviderId(providerId);
            user.setProfileImage(profileImage);
            user.setEmailVerified(true);

            user = userRepository.save(user);
        }

        return toResponse(user);
    }

    public String generateToken(User user) {

        return jwtService.generateToken(
                user.getEmail()
        );
    }

    /**
     * Finds or creates a Google OAuth2 user and returns the User entity.
     * Used by OAuth2SuccessHandler and OAuth2Service.
     */
    public User findOrCreateGoogleUser(
            String email,
            String name,
            String providerId,
            String profileImage
    ) {
        User user = userRepository.findByEmail(email.toLowerCase()).orElse(null);

        if (user == null) {
            user = User.builder()
                    .email(email.toLowerCase())
                    .name(name)
                    .provider(AuthProvider.GOOGLE)
                    .providerId(providerId)
                    .profileImage(profileImage)
                    .emailVerified(true)
                    .role(Role.USER)
                    .build();
            user = userRepository.save(user);
        } else {
            user.setName(name);
            user.setProviderId(providerId);
            user.setProfileImage(profileImage);
            user.setEmailVerified(true);
            user = userRepository.save(user);
        }

        return user;
    }

    public AuthResponse toResponse(User user) {
        List<UserSkill> userSkills = userSkillRepository.findByUserId(user.getId());
        List<String> skillNames = userSkills.stream()
                .map(us -> us.getSkill().getName())
                .collect(Collectors.toList());

        double avgLevel = userSkills.stream()
                .mapToInt(UserSkill::getCurrentLevel)
                .average()
                .orElse(0.0);

        String overallLevel = "Intermediate";
        if (userSkills.isEmpty()) {
            overallLevel = "Beginner";
        } else if (avgLevel < 1.5) {
            overallLevel = "Beginner";
        } else if (avgLevel < 3.5) {
            overallLevel = "Intermediate";
        } else {
            overallLevel = "Advanced";
        }

        // Get initials
        String initials = "";
        if (user.getName() != null && !user.getName().isBlank()) {
            String[] parts = user.getName().trim().split("\\s+");
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(parts.length, 2); i++) {
                if (!parts[i].isEmpty()) {
                    sb.append(parts[i].substring(0, 1).toUpperCase());
                }
            }
            initials = sb.toString();
        }

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
                .role("ROLE_" + user.getRole().name())
                .initials(initials)
                .skills(skillNames)
                .level(overallLevel)
                .build();
    }
}
