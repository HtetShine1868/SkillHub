package com.example.backend.assessment.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssessmentQuestionRequest {
    private Long skillId;
    private String question;
    private String type;        // SELF_REPORTED | KNOWLEDGE
    private String optionsJson; // JSON array
    private String correctAnswer;
    private Integer difficulty; // 1-3
    private Integer orderIndex;
}
