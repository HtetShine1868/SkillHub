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

    @PostMapping("/courses/{courseId}")
    public ResponseEntity<?> enroll(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Enrollment enrollment = enrollmentService.enroll(user, courseId);
        return ResponseEntity.ok(enrollment);
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public ResponseEntity<?> completeLesson(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId,
            @PathVariable Long lessonId
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Enrollment enrollment = enrollmentService.completeLesson(user, courseId, lessonId);
        return ResponseEntity.ok(enrollment);
    }

    @PostMapping("/courses/{courseId}/assessment")
    public ResponseEntity<?> submitAssessment(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId,
            @RequestBody Map<String, Integer> payload
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        int score = payload.getOrDefault("score", 0);
        boolean passed = enrollmentService.submitCourseAssessment(user, courseId, score);
        return ResponseEntity.ok(Map.of("passed", passed, "score", score));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Enrollment>> getMyEnrollments(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(enrollmentService.getMyEnrollments(user));
    }
}
