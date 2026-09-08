package com.example.backend.career.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class CareerSkillRequest {
    private Long skillId;

    @JsonAlias("requiredProficiency")
    private Integer requiredLevel;   // 1-5

    @JsonAlias("requiredLevel")
    private Integer requiredProficiency;

    private Double importance;       // 0.0-1.0

    private String importanceLevel;  // CORE | IMPORTANT | NICE_TO_HAVE

    public Integer getEffectiveRequiredLevel() {
        if (requiredLevel != null) return requiredLevel;
        if (requiredProficiency != null) return requiredProficiency;
        return 1;
    }

    public Double getEffectiveImportance() {
        if (importance != null) return importance;
        if (importanceLevel != null) {
            return switch (importanceLevel.toUpperCase()) {
                case "CORE" -> 0.95;
                case "IMPORTANT" -> 0.75;
                case "NICE_TO_HAVE" -> 0.5;
                default -> 0.7;
            };
        }
        return 1.0;
    }
}

