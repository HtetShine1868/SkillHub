package com.example.backend.skillexchange.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCreateRequest {
    private String title;
    private String description;
    private String category;
    private String level;
    private Integer maxMembers;
    private String duration;
    private String commitment;
    private String deadline;
    private List<String> skills;
    private List<String> tags;
}
