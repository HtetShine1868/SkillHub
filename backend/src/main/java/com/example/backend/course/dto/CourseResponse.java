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

        LocalDateTime createdAt

) {
}