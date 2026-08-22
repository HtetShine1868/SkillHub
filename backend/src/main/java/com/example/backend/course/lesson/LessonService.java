package com.example.backend.course.lesson;


import com.example.backend.course.Course;
import com.example.backend.course.CourseRepository;
import com.example.backend.course.lesson.dto.LessonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;

    private final CourseRepository courseRepository;


    public List<LessonResponse> getLessonsByCourse(
            Long courseId
    ) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found")
                );

        if (!course.getPublished()) {
            throw new RuntimeException(
                    "Course is not available"
            );
        }

        return lessonRepository
                .findByCourseIdOrderByLessonOrder(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    public LessonResponse getLesson(
            Long courseId,
            Long lessonId
    ) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException("Course not found")
                );

        if (!course.getPublished()) {
            throw new RuntimeException(
                    "Course is not available"
            );
        }

        Lesson lesson = lessonRepository
                .findById(lessonId)
                .orElseThrow(() ->
                        new RuntimeException("Lesson not found")
                );

        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new RuntimeException(
                    "Lesson does not belong to this course"
            );
        }

        return toResponse(lesson);
    }


    private LessonResponse toResponse(
            Lesson lesson
    ) {

        return new LessonResponse(

                lesson.getId(),

                lesson.getCourse().getId(),

                lesson.getTitle(),

                lesson.getLessonOrder(),

                lesson.getEstimatedMinutes(),

                lesson.getContent()
        );
    }
}