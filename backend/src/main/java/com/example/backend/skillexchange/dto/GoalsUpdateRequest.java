package com.example.backend.skillexchange.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalsUpdateRequest {
    private List<ProjectGoalInput> goals;
}
