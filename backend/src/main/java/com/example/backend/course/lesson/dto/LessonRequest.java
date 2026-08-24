package com.example.backend.course.lesson.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonRequest {
    private String title;
    private Integer lessonOrder;
    private Integer estimatedMinutes;
    private String content;
}
