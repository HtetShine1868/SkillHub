package com.example.backend.auth.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long id;

    private String name;

    private String email;

    private String profileImage;

    private String provider;

    private boolean emailVerified;

    private String role;

    private String initials;

    private List<String> skills;

    private String level;
}