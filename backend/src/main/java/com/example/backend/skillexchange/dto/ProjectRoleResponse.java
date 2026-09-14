package com.example.backend.skillexchange.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectRoleResponse {
    private String name;
    private Integer slots;
    private Integer filled;
    private Integer open;
}
