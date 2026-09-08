package com.example.backend.course.review;

import com.example.backend.course.Course;
import com.example.backend.course.CourseRepository;
import com.example.backend.course.review.dto.CourseReviewRequest;
import com.example.backend.course.review.dto.CourseReviewResponse;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseReviewService {

    private final CourseReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public List<CourseReviewResponse> getReviewsForCourse(Long courseId) {
        return reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CourseReviewResponse submitReview(Long courseId, String userEmail, CourseReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        CourseReview review = reviewRepository.findByCourseIdAndUserId(courseId, user.getId())
                .orElse(null);

        if (review == null) {
            review = CourseReview.builder()
                    .courseId(courseId)
                    .userId(user.getId())
                    .userName(user.getName())
                    .userAvatar(user.getProfileImage())
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .build();
        } else {
            review.setRating(request.getRating());
            review.setComment(request.getComment());
            review.setUserName(user.getName());
            review.setUserAvatar(user.getProfileImage());
        }

        CourseReview savedReview = reviewRepository.save(review);

        // Recalculate average rating & review count for the course
        List<CourseReview> allReviews = reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
        double avgRating = allReviews.stream()
                .mapToInt(CourseReview::getRating)
                .average()
                .orElse(5.0);

        // Round to 1 decimal place
        double roundedRating = Math.round(avgRating * 10.0) / 10.0;
        course.setRating(roundedRating);
        course.setReviewCount(allReviews.size());
        courseRepository.save(course);

        return toResponse(savedReview);
    }

    private CourseReviewResponse toResponse(CourseReview r) {
        return new CourseReviewResponse(
                r.getId(),
                r.getCourseId(),
                r.getUserId(),
                r.getUserName(),
                r.getUserAvatar(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }
}
