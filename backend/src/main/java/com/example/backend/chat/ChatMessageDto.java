package com.example.backend.chat;

import java.time.LocalDateTime;

public record ChatMessageDto(
    Long id,
    String mode,
    Long courseId,
    Long senderId,
    String senderName,
    String senderAvatar,
    Long receiverId,
    String receiverName,
    String content,
    LocalDateTime sentAt
) {
    public static ChatMessageDto from(ChatMessage m) {
        return new ChatMessageDto(
            m.getId(),
            m.getMode(),
            m.getCourseId(),
            m.getSender().getId(),
            m.getSender().getName(),
            m.getSender().getProfileImage(),
            m.getReceiver().getId(),
            m.getReceiver().getName(),
            m.getContent(),
            m.getSentAt()
        );
    }
}
