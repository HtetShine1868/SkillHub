package com.example.backend.career.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DiscoveryQuestionRequest {
    private String question;
    private String optionsJson;  // JSON array of options with label, description, weights
    private Integer orderIndex;
}
