package com.example.backend.course.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequest {
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private Integer durationHours;
    private String thumbnailUrl;
    private Boolean published;
}
