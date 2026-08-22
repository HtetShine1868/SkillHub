package com.example.backend.assessment.dto;

import java.util.List;

public record AssessmentResultResponse(
        Long attemptId,
        Long careerId,
        Double overallScore,
        List<SkillLevelResult> skillResults
) {
    public record SkillLevelResult(
            Long skillId,
            String skillName,
            Integer level, // 0-5 scale
            String source,
            Double confidence
    ) {}
}
