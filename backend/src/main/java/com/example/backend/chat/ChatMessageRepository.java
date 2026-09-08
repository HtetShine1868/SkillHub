package com.example.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /** All messages in a COURSE thread between two users for a specific course */
    @Query("""
        SELECT m FROM ChatMessage m
        WHERE (m.mode = 'COURSE' OR m.courseId IS NOT NULL)
          AND (:courseId IS NULL OR m.courseId = :courseId)
          AND ((m.sender.id = :userA AND m.receiver.id = :userB)
            OR (m.sender.id = :userB AND m.receiver.id = :userA))
        ORDER BY m.sentAt ASC
    """)
    List<ChatMessage> findCourseThread(@Param("courseId") Long courseId,
                                       @Param("userA") Long userA,
                                       @Param("userB") Long userB);

    /** All messages in a GENERAL thread between two users */
    @Query("""
        SELECT m FROM ChatMessage m
        WHERE (m.mode IS NULL OR m.mode = 'GENERAL')
          AND m.courseId IS NULL
          AND ((m.sender.id = :userA AND m.receiver.id = :userB)
            OR (m.sender.id = :userB AND m.receiver.id = :userA))
        ORDER BY m.sentAt ASC
    """)
    List<ChatMessage> findGeneralThread(@Param("userA") Long userA,
                                        @Param("userB") Long userB);

    /** Get all unique conversation partners for a user */
    @Query("""
        SELECT DISTINCT
            CASE WHEN m.sender.id = :userId THEN m.receiver.id ELSE m.sender.id END
        FROM ChatMessage m
        WHERE m.sender.id = :userId OR m.receiver.id = :userId
    """)
    List<Long> findConversationPartnerIds(@Param("userId") Long userId);

    /** Latest message per conversation partner */
    @Query("""
        SELECT m FROM ChatMessage m
        WHERE (m.sender.id = :userId OR m.receiver.id = :userId)
        ORDER BY m.sentAt DESC
    """)
    List<ChatMessage> findAllByUserId(@Param("userId") Long userId);
}
