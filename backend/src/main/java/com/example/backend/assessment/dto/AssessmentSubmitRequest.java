package com.example.backend.assessment.dto;

import java.util.Map;

public record AssessmentSubmitRequest(
        Long careerId,
        Map<Long, String> answers // questionId -> chosen option value (e.g. "3" for self-report, "B" for knowledge)
) {}
