package com.example.backend.career.dto;

public record CareerSkillResponse(
        Long skillId,
        String skillName,
        String skillCategory,
        Integer requiredLevel,
        Double importance
) {}
