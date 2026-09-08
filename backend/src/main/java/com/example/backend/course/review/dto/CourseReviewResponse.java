package com.example.backend.course.review.dto;

import java.time.LocalDateTime;

public record CourseReviewResponse(
        Long id,
        Long courseId,
        Long userId,
        String userName,
        String userAvatar,
        Integer rating,
        String comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
