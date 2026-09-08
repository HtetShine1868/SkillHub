package com.example.backend.assessment.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class AssessmentQuestionRequest {
    private Long skillId;

    @JsonAlias({"questionText", "text"})
    private String question;

    private String type;        // SELF_REPORTED | KNOWLEDGE
    private String optionsJson; // JSON array
    private List<Object> options; // JSON list of strings or option objects
    private String correctAnswer;

    @JsonAlias("points")
    private Integer pointsValue;

    private String explanation;

    @JsonAlias({"difficultyLevel", "level"})
    private Object difficulty; // can be Integer or String ("BEGINNER", etc.)

    private Integer orderIndex;

    public String getEffectiveQuestion() {
        return question != null ? question.trim() : "";
    }

    public String getEffectiveType() {
        if (type != null && !type.isBlank()) return type;
        return "KNOWLEDGE";
    }

    public Integer getEffectiveDifficulty() {
        if (difficulty instanceof Number num) {
            return num.intValue();
        }
        if (difficulty instanceof String str) {
            try {
                return Integer.parseInt(str);
            } catch (NumberFormatException e) {
                return switch (str.toUpperCase()) {
                    case "BEGINNER" -> 1;
                    case "INTERMEDIATE" -> 2;
                    case "ADVANCED" -> 3;
                    case "EXPERT" -> 4;
                    default -> 1;
                };
            }
        }
        return 1;
    }
}

