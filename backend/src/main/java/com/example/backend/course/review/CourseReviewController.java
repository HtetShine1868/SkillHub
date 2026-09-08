package com.example.backend.course.review;

import com.example.backend.course.review.dto.CourseReviewRequest;
import com.example.backend.course.review.dto.CourseReviewResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/reviews")
@RequiredArgsConstructor
public class CourseReviewController {

    private final CourseReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<CourseReviewResponse>> getReviews(@PathVariable Long courseId) {
        return ResponseEntity.ok(reviewService.getReviewsForCourse(courseId));
    }

    @PostMapping
    public ResponseEntity<CourseReviewResponse> submitReview(
            @PathVariable Long courseId,
            @Valid @RequestBody CourseReviewRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "user@skillhub.com";
        return ResponseEntity.ok(reviewService.submitReview(courseId, email, request));
    }
}
