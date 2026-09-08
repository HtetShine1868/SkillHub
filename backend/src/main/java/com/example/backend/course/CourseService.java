package com.example.backend.course;

import com.example.backend.course.dto.CourseResponse;
import com.example.backend.course.dto.CourseRequest;
import com.example.backend.course.lesson.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final CoursePrerequisiteRepository coursePrerequisiteRepository;

    public List<CourseResponse> getAllCourses() {
        return courseRepository
                .findByPublishedTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));

        return toResponse(course);
    }

    public List<CourseResponse> searchCourses(String search) {
        return courseRepository
                .findByTitleContainingIgnoreCaseAndPublishedTrue(search)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CourseResponse> getCoursesByCategory(String category) {
        return courseRepository
                .findByCategoryIgnoreCaseAndPublishedTrue(category)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse toResponse(Course course) {
        if (course == null) return null;

        boolean isPub = Boolean.TRUE.equals(course.getPublished());
        String status = course.getStatus() != null ? course.getStatus() : (isPub ? "PUBLISHED" : "DRAFT");

        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCategory(),
                course.getDifficulty(),
                course.getDurationHours(),
                course.getThumbnailUrl(),
                course.getRating() != null ? course.getRating() : 0.0,
                course.getEnrollmentCount() != null ? course.getEnrollmentCount() : 0,
                course.getCreatedAt() != null ? course.getCreatedAt() : java.time.LocalDateTime.now(),
                isPub,
                status,
                course.getRejectionReason(),
                course.getInstructorId(),
                course.getInstructorName(),
                course.getReviewCount() != null ? course.getReviewCount() : 0
        );
    }

    public CourseResponse createCourse(CourseRequest request) {
        boolean isPub = request.getPublished() != null ? request.getPublished() : true;
        String initialStatus = request.getStatus() != null ? request.getStatus() : (isPub ? "PUBLISHED" : "DRAFT");

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .difficulty(request.getDifficulty())
                .durationHours(request.getDurationHours())
                .thumbnailUrl(request.getThumbnailUrl())
                .published(isPub)
                .status(initialStatus)
                .rejectionReason(request.getRejectionReason())
                .instructorId(request.getInstructorId())
                .instructorName(request.getInstructorName())
                .rating(0.0)
                .enrollmentCount(0)
                .reviewCount(0)
                .build();
        return toResponse(courseRepository.save(course));
    }

    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setDifficulty(request.getDifficulty());
        course.setDurationHours(request.getDurationHours());
        course.setThumbnailUrl(request.getThumbnailUrl());

        if (request.getPublished() != null) {
            course.setPublished(request.getPublished());
        }
        if (request.getStatus() != null) {
            course.setStatus(request.getStatus());
        }
        if (request.getRejectionReason() != null) {
            course.setRejectionReason(request.getRejectionReason());
        }
        if (request.getInstructorId() != null) {
            course.setInstructorId(request.getInstructorId());
        }
        if (request.getInstructorName() != null) {
            course.setInstructorName(request.getInstructorName());
        }

        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        coursePrerequisiteRepository.deleteByCourseId(id);
        coursePrerequisiteRepository.deleteByRequiredCourseId(id);
        courseSkillRepository.deleteByCourseId(id);
        lessonRepository.deleteByCourseId(id);
        courseRepository.delete(course);
    }
}