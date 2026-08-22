package com.example.backend.career.dto;

import java.util.List;

public record CareerResponse(
        Long id,
        String name,
        String description,
        String category,
        String icon,
        String responsibilities,
        List<CareerSkillResponse> requiredSkills
) {}
