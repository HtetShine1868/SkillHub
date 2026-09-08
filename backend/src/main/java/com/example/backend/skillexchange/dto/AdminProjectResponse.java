package com.example.backend.skillexchange.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProjectResponse {
    private Long id;
    private String title;
    private String ownerName;
    private String ownerEmail;
    private List<String> skillsOffered;
    private Integer requestCount;
    private String status;
    private String createdAt;
}
