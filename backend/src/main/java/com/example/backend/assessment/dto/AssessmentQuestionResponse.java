package com.example.backend.assessment.dto;

import java.util.List;

public record AssessmentQuestionResponse(
        Long id,
        Long skillId,
        String skillName,
        String question,
        String type,
        String optionsJson,
        Integer difficulty
) {}
