package com.example.backend.career.dto;

import java.util.List;

public record DiscoveryMatchResponse(
        List<CareerMatchResult> topCareers
) {
    public record CareerMatchResult(
            Long careerId,
            String careerName,
            String careerCategory,
            String careerIcon,
            String careerDescription,
            Double rawScore,
            Double matchPercentage  // normalized 0-100
    ) {}
}
