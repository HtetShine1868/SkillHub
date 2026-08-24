package com.example.backend.skill;

public record SkillResponse(
        Long id,
        String name,
        String category,
        String description
) {}
