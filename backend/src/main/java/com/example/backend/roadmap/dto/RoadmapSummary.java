package com.example.backend.roadmap.dto;

import java.time.LocalDateTime;

public record RoadmapSummary(
        Long careerId,
        String careerName,
        int progress,
        int completedCount,
        int totalCount,
        boolean complete,
        LocalDateTime createdAt
) {
}
