package com.example.backend.instructor.dto;

public record InstructorStatsResponse(
        int totalCourses,
        int draftCount,
        int pendingCount,
        int publishedCount,
        int rejectedCount,
        int totalEnrollments,
        double averageRating
) {
}
