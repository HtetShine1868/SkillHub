package com.example.backend.course.lesson.dto;

public record LessonResponse(

        Long id,

        Long courseId,

        String title,

        Integer lessonOrder,

        Integer estimatedMinutes,

        String content

) {
}