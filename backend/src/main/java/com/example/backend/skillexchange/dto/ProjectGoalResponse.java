package com.example.backend.skillexchange.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectGoalResponse {
    private String id;
    private String text;
    private boolean done;
}
