package com.example.backend.notification.controller;

import com.example.backend.notification.dto.NotificationResponse;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = requireUser(principal);
        return ResponseEntity.ok(notificationService.getMyNotifications(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = requireUser(principal);
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(user)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Boolean>> markRead(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id
    ) {
        User user = requireUser(principal);
        boolean success = notificationService.markRead(user, id);
        return ResponseEntity.ok(Map.of("success", success));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = requireUser(principal);
        int updated = notificationService.markAllRead(user);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    private User requireUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
