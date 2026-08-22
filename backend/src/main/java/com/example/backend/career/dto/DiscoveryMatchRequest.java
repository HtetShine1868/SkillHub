package com.example.backend.career.dto;

import java.util.List;
import java.util.Map;

/**
 * Request: map of questionId -> selectedOptionIndex (0-based).
 */
public record DiscoveryMatchRequest(
        Map<Long, Integer> answers   // questionId -> selectedOptionIndex
) {}
