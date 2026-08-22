package com.example.backend.course.lesson;

import com.example.backend.course.lesson.dto.LessonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;


    @GetMapping
    public List<LessonResponse> getLessons(
            @PathVariable Long courseId
    ) {

        return lessonService.getLessonsByCourse(courseId);
    }


    @GetMapping("/{lessonId}")
    public LessonResponse getLesson(

            @PathVariable Long courseId,

            @PathVariable Long lessonId

    ) {

        return lessonService.getLesson(
                courseId,
                lessonId
        );
    }
}