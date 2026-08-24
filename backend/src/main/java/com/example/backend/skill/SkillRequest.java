package com.example.backend.skill;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SkillRequest {
    private String name;
    private String category;
    private String description;
}
