package com.example.backend.roadmap.dto;

import java.util.List;

public record RoadmapResponse(
        Long careerId,
        String careerName,
        Integer progress, // overall roadmap progress percentage
        List<RoadmapItemDto> items,
        Long nextCourseId,
        String nextCourseTitle
) {
    public RoadmapResponse(Long careerId, String careerName, Integer progress, List<RoadmapItemDto> items) {
        this(careerId, careerName, progress, items, null, null);
    }
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
            String reason,
            String choiceGroup,
            String choiceLabel,
            String requirement
    ) {}
}
