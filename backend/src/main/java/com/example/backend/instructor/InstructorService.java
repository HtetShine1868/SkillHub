package com.example.backend.instructor;

import com.example.backend.course.Course;
import com.example.backend.course.CourseRepository;
import com.example.backend.course.CourseService;
import com.example.backend.course.dto.CourseRequest;
import com.example.backend.course.dto.CourseResponse;
import com.example.backend.instructor.dto.InstructorStatsResponse;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InstructorService {

    private final CourseRepository courseRepository;
    private final CourseService courseService;
    private final UserRepository userRepository;

    public List<CourseResponse> getMyCourses(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return courseRepository.findAll().stream().map(courseService::toResponse).toList();
        }

        List<Course> courses = courseRepository.findByInstructorId(user.getId());
        if (courses.isEmpty()) {
            // Fallback for demo courses or newly registered instructor
            courses = courseRepository.findAll();
        }

        return courses.stream().map(courseService::toResponse).toList();
    }

    public CourseResponse createCourse(String email, CourseRequest request) {
        User user = userRepository.findByEmail(email).orElse(null);

        String initialStatus = request.getStatus() != null ? request.getStatus() : "DRAFT";
        boolean isPub = "PUBLISHED".equalsIgnoreCase(initialStatus);

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "General")
                .difficulty(request.getDifficulty() != null ? request.getDifficulty() : "BEGINNER")
                .durationHours(request.getDurationHours() != null ? request.getDurationHours() : 10)
                .thumbnailUrl(request.getThumbnailUrl())
                .published(isPub)
                .status(initialStatus)
                .instructorId(user != null ? user.getId() : null)
                .instructorName(user != null ? user.getName() : "Instructor")
                .rating(0.0)
                .enrollmentCount(0)
                .reviewCount(0)
                .build();

        return courseService.toResponse(courseRepository.save(course));
    }

    public CourseResponse updateCourse(Long courseId, String email, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getCategory() != null) course.setCategory(request.getCategory());
        if (request.getDifficulty() != null) course.setDifficulty(request.getDifficulty());
        if (request.getDurationHours() != null) course.setDurationHours(request.getDurationHours());
        if (request.getThumbnailUrl() != null) course.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getStatus() != null) course.setStatus(request.getStatus());

        return courseService.toResponse(courseRepository.save(course));
    }

    public CourseResponse submitForApproval(Long courseId, String email) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        course.setStatus("PENDING_APPROVAL");
        course.setPublished(false);
        course.setRejectionReason(null);

        return courseService.toResponse(courseRepository.save(course));
    }

    public InstructorStatsResponse getStats(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        List<Course> courses = (user != null) ? courseRepository.findByInstructorId(user.getId()) : List.of();
        if (courses.isEmpty()) {
            courses = courseRepository.findAll();
        }

        int total = courses.size();
        int drafts = 0;
        int pending = 0;
        int published = 0;
        int rejected = 0;
        int totalEnrollments = 0;
        double sumRating = 0.0;
        int ratedCount = 0;

        for (Course c : courses) {
            String st = c.getStatus() != null ? c.getStatus().toUpperCase() : (c.getPublished() ? "PUBLISHED" : "DRAFT");
            switch (st) {
                case "DRAFT" -> drafts++;
                case "PENDING_APPROVAL" -> pending++;
                case "PUBLISHED" -> published++;
                case "REJECTED" -> rejected++;
                default -> drafts++;
            }
            if (c.getEnrollmentCount() != null) {
                totalEnrollments += c.getEnrollmentCount();
            }
            if (c.getRating() != null && c.getRating() > 0) {
                sumRating += c.getRating();
                ratedCount++;
            }
        }

        double avgRating = ratedCount > 0 ? Math.round((sumRating / ratedCount) * 10.0) / 10.0 : 4.8;

        return new InstructorStatsResponse(
                total,
                drafts,
                pending,
                published,
                rejected,
                totalEnrollments,
                avgRating
        );
    }
}
