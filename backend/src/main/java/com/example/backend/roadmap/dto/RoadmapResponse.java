package com.example.backend.roadmap.dto;

import java.util.List;

public record RoadmapResponse(
        Long careerId,
        String careerName,
        Integer progress, // overall roadmap progress percentage
        List<RoadmapItemDto> items
) {
    public record RoadmapItemDto(
            Long id,
            Long courseId,
            String courseTitle,
            String courseDifficulty,
            Integer courseDurationHours,
            List<String> skills,
            Integer orderIndex,
            String status,
            Integer progress,
            String reason
    ) {}
}
