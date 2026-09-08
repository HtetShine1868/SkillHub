package com.example.backend.skillexchange.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private List<String> skills;
    private String level;
    private String duration;
    private String commitment;
    private String deadline;
    private Integer maxMembers;
    private Integer currentMembers;
    private String status;
    private List<String> tags;
    private UserDto owner;
    private List<ProjectMemberResponse> members;
    private List<ProjectGoalResponse> goals;
    private List<CommentResponse> discussion;
    private Integer pendingRequests;
    private String userStatus;
    private String createdAt;
}
