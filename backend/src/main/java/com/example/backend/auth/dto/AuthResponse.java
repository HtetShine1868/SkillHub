package com.example.backend.auth.dto;

import lombok.*;

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
}