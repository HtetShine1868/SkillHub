package com.example.backend.course.lesson;


import com.example.backend.course.Course;
import com.example.backend.course.CourseRepository;
import com.example.backend.course.lesson.dto.LessonResponse;
import com.example.backend.course.lesson.dto.LessonRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    /** Admin version: bypasses the published check */
    public List<LessonResponse> getLessonsByCourseAdmin(Long courseId) {
        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
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

    public LessonResponse createLesson(Long courseId, LessonRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Lesson lesson = Lesson.builder()
                .course(course)
                .title(request.getTitle())
                .lessonOrder(request.getLessonOrder())
                .estimatedMinutes(request.getEstimatedMinutes())
                .content(request.getContent())
                .build();
        return toResponse(lessonRepository.save(lesson));
    }

    public LessonResponse updateLesson(Long courseId, Long lessonId, LessonRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Lesson does not belong to this course");
        }
        lesson.setTitle(request.getTitle());
        lesson.setLessonOrder(request.getLessonOrder());
        lesson.setEstimatedMinutes(request.getEstimatedMinutes());
        lesson.setContent(request.getContent());
        return toResponse(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long courseId, Long lessonId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (!lesson.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Lesson does not belong to this course");
        }
        lessonRepository.delete(lesson);
    }
}