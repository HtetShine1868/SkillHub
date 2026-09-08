package com.example.backend.career.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CareerSkillResponse(
        Long skillId,
        String skillName,
        String skillCategory,
        Integer requiredLevel,
        Integer requiredProficiency,
        Double importance,
        String importanceLevel
) {
    public CareerSkillResponse(Long skillId, String skillName, String skillCategory, Integer requiredLevel, Double importance) {
        this(
                skillId,
                skillName,
                skillCategory,
                requiredLevel != null ? requiredLevel : 1,
                requiredLevel != null ? requiredLevel : 1,
                importance != null ? importance : 1.0,
                importance == null || importance >= 0.85 ? "CORE" : importance >= 0.65 ? "IMPORTANT" : "NICE_TO_HAVE"
        );
    }
}

