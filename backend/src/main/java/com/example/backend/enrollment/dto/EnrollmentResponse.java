package com.example.backend.enrollment.dto;

import java.time.LocalDateTime;

public record EnrollmentResponse(

        Long enrollmentId,

        Long courseId,

        String courseTitle,

        Integer progressPercentage,

        Boolean completed,

        LocalDateTime enrolledAt,

        LocalDateTime completedAt

) {
}