package com.example.backend.career.dto;

import java.util.List;
import java.util.Map;

public record DiscoveryQuestionResponse(
        Long id,
        String question,
        Integer orderIndex,
        List<DiscoveryOptionResponse> options
) {
    public record DiscoveryOptionResponse(
            Integer index,
            String label,
            String description,
            Map<Long, Integer> weights  // careerId -> score
    ) {}
}
