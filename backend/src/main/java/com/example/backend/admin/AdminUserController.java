package com.example.backend.admin;

import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    @Getter
    @Builder
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private Boolean enabled;
        private String profileImage;
        private LocalDateTime createdAt;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(@RequestParam(required = false) String role) {
        List<User> users = userRepository.findAll();

        if (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role)) {
            String roleUpper = role.toUpperCase().replace("ROLE_", "");
            users = users.stream()
                    .filter(u -> u.getRole() != null && u.getRole().name().equalsIgnoreCase(roleUpper))
                    .toList();
        }

        List<UserDto> dtos = users.stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role("ROLE_" + u.getRole().name())
                        .enabled(u.getEnabled() != null ? u.getEnabled() : true)
                        .profileImage(u.getProfileImage())
                        .createdAt(u.getCreatedAt())
                        .build())
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        boolean currentEnabled = user.getEnabled() != null ? user.getEnabled() : true;
        user.setEnabled(!currentEnabled);
        User saved = userRepository.save(user);

        return ResponseEntity.ok(UserDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role("ROLE_" + saved.getRole().name())
                .enabled(saved.getEnabled())
                .profileImage(saved.getProfileImage())
                .createdAt(saved.getCreatedAt())
                .build());
    }
}
