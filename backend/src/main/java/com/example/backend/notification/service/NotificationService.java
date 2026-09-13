package com.example.backend.notification.service;

import com.example.backend.notification.dto.NotificationResponse;
import com.example.backend.notification.entity.AppNotification;
import com.example.backend.notification.repository.AppNotificationRepository;
import com.example.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    public static final String PROJECT_MESSAGE = "PROJECT_MESSAGE";
    public static final String PROJECT_JOIN = "PROJECT_JOIN";
    public static final String JOIN_REQUEST = "JOIN_REQUEST";
    public static final String JOIN_APPROVED = "JOIN_APPROVED";
    public static final String INSTRUCTOR_REPLY = "INSTRUCTOR_REPLY";
    public static final String CHAT_MESSAGE = "CHAT_MESSAGE";

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;
    private static final int MAX_NOTIFICATIONS = 50;

    private final AppNotificationRepository notificationRepository;

    @Transactional
    public void notify(User recipient, String type, String title, String message, String link, Long projectId) {
        if (recipient == null) return;
        AppNotification notification = AppNotification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .projectId(projectId)
                .readFlag(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(User currentUser) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .limit(MAX_NOTIFICATIONS)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long unreadCount(User currentUser) {
        return notificationRepository.countByRecipientIdAndReadFlagFalse(currentUser.getId());
    }

    @Transactional
    public boolean markRead(User currentUser, Long id) {
        AppNotification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied");
        }
        notification.setReadFlag(true);
        notificationRepository.save(notification);
        return true;
    }

    @Transactional
    public int markAllRead(User currentUser) {
        List<AppNotification> unread = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .filter(n -> !n.isReadFlag())
                .collect(Collectors.toList());
        unread.forEach(n -> n.setReadFlag(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    private NotificationResponse toResponse(AppNotification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .link(n.getLink())
                .projectId(n.getProjectId())
                .read(n.isReadFlag())
                .createdAt(n.getCreatedAt().format(ISO_FORMATTER))
                .build();
    }
}
