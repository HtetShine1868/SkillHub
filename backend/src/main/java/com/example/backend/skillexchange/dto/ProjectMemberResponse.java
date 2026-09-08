package com.example.backend.skillexchange.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMemberResponse {
    private Long id;
    private String name;
    private String initials;
    private String role;
    private String avatar;
}
