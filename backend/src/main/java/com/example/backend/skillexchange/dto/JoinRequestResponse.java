package com.example.backend.skillexchange.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoinRequestResponse {
    private Long id;
    private Long projectId;
    private UserDto applicant;
    private List<String> skills;
    private String level;
    private String message;
    private String date;
    private String status;
    private ProjectResponse project;
}
