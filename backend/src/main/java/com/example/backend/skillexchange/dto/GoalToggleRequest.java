package com.example.backend.skillexchange.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalToggleRequest {
    private Boolean done;
}
