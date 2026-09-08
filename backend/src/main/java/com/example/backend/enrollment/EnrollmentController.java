package com.example.backend.enrollment;

import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

    private User resolveUser(UserDetails principal) {
        if (principal != null && principal.getUsername() != null) {
            return userRepository.findByEmail(principal.getUsername())
                    .orElseGet(() -> userRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("User not found")));
        }
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<?> enroll(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId
    ) {
        User user = resolveUser(principal);
        Enrollment enrollment = enrollmentService.enroll(user, courseId);
        return ResponseEntity.ok(enrollment);
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<?> completeLesson(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        User user = resolveUser(principal);
        Enrollment enrollment = enrollmentService.completeLesson(user, courseId, lessonId);
        return ResponseEntity.ok(enrollment);
    }

    @PostMapping("/courses/{courseId}/complete")
    public ResponseEntity<?> completeCourse(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId
    ) {
        User user = resolveUser(principal);
        Enrollment enrollment = enrollmentService.completeCourse(user, courseId);
        return ResponseEntity.ok(enrollment);
    }

    @PostMapping("/courses/{courseId}/assessment")
    public ResponseEntity<?> submitAssessment(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId,
            @RequestBody Map<String, Integer> payload
    ) {
        User user = resolveUser(principal);
        int score = payload.getOrDefault("score", 0);
        boolean passed = enrollmentService.submitCourseAssessment(user, courseId, score);
        return ResponseEntity.ok(Map.of("passed", passed, "score", score));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Enrollment>> getMyEnrollments(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(user));
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<Map<String, Object>> checkEnrollment(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId
    ) {
        User user = resolveUser(principal);
        boolean enrolled = user.getRole() == com.example.backend.user.entity.Role.INSTRUCTOR ||
                           user.getRole() == com.example.backend.user.entity.Role.ADMIN ||
                           enrollmentService.getMyEnrollments(user).stream().anyMatch(e -> e.getCourse() != null && e.getCourse().getId().equals(courseId));
        return ResponseEntity.ok(Map.of("enrolled", enrolled, "courseId", courseId));
    }
}
