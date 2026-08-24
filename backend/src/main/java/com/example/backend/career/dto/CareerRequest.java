package com.example.backend.career.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CareerRequest {
    private String name;
    private String description;
    private String category;
    private String icon;
    private String responsibilities;
    private Boolean active;
}
