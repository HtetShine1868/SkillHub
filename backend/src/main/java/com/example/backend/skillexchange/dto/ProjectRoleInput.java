package com.example.backend.skillexchange.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRoleInput {
    private String name;
    private Integer slots;
}
