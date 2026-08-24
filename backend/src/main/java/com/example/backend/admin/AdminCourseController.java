package com.example.backend.admin;

import com.example.backend.course.*;
import com.example.backend.course.dto.*;
import com.example.backend.course.lesson.LessonService;
import com.example.backend.course.lesson.dto.LessonRequest;
import com.example.backend.course.lesson.dto.LessonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseService courseService;
    private final CourseRepository courseRepository;
    private final LessonService lessonService;

    /** Returns ALL courses, including unpublished ones */
    @GetMapping
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll()
                .stream()
                .map(courseService::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseRequest request
    ) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<CourseResponse> togglePublished(@PathVariable Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));
        course.setPublished(!course.getPublished());
        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(courseService.toResponse(saved));
    }

    // --- Lesson management ---

    @GetMapping("/{courseId}/lessons")
    public List<LessonResponse> getLessons(@PathVariable Long courseId) {
        // Bypass published check — admin can see lessons of unpublished courses
        return lessonService.getLessonsByCourseAdmin(courseId);
    }

    @PostMapping("/{courseId}/lessons")
    public ResponseEntity<LessonResponse> createLesson(
            @PathVariable Long courseId,
            @RequestBody LessonRequest request
    ) {
        return ResponseEntity.ok(lessonService.createLesson(courseId, request));
    }

    @PutMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<LessonResponse> updateLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @RequestBody LessonRequest request
    ) {
        return ResponseEntity.ok(lessonService.updateLesson(courseId, lessonId, request));
    }

    @DeleteMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        lessonService.deleteLesson(courseId, lessonId);
        return ResponseEntity.noContent().build();
    }
}
