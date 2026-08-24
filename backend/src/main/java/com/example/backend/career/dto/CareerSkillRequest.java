package com.example.backend.career.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CareerSkillRequest {
    private Long skillId;
    private Integer requiredLevel;   // 1-5
    private Double importance;       // 0.0-1.0
}
