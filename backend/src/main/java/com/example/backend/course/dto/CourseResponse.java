package com.example.backend.course.dto;

import java.time.LocalDateTime;

public record CourseResponse(
        Long id,
        String title,
        String description,
        String category,
        String difficulty,
        Integer durationHours,
        String thumbnailUrl,
        Double rating,
        Integer enrollmentCount,
        LocalDateTime createdAt,
        Boolean published,
        String status,
        String rejectionReason,
        Long instructorId,
        String instructorName,
        Integer reviewCount,
        Boolean recommended,
        String recommendationReason
) {
    public CourseResponse(
            Long id,
            String title,
            String description,
            String category,
            String difficulty,
            Integer durationHours,
            String thumbnailUrl,
            Double rating,
            Integer enrollmentCount,
            LocalDateTime createdAt,
            Boolean published,
            String status,
            String rejectionReason,
            Long instructorId,
            String instructorName,
            Integer reviewCount
    ) {
        this(
                id, title, description, category, difficulty, durationHours, thumbnailUrl,
                rating, enrollmentCount, createdAt, published, status, rejectionReason,
                instructorId, instructorName, reviewCount, null, null
        );
    }
}