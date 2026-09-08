package com.example.backend.admin;

import com.example.backend.course.review.CourseReview;
import com.example.backend.course.review.CourseReviewRepository;
import com.example.backend.course.review.dto.CourseReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final CourseReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<CourseReviewResponse>> getAllReviews() {
        List<CourseReviewResponse> list = reviewRepository.findAll().stream()
                .map(r -> new CourseReviewResponse(
                        r.getId(),
                        r.getCourseId(),
                        r.getUserId(),
                        r.getUserName(),
                        r.getUserAvatar(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt(),
                        r.getUpdatedAt()
                ))
                .toList();

        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
