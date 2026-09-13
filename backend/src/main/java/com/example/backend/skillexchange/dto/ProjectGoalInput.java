package com.example.backend.skillexchange.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectGoalInput {
    private String id;
    private String text;
    private boolean done;
}
