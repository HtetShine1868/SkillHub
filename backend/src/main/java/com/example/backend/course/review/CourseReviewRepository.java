package com.example.backend.course.review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseReviewRepository extends JpaRepository<CourseReview, Long> {

    List<CourseReview> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    Optional<CourseReview> findByCourseIdAndUserId(Long courseId, Long userId);

    long countByCourseId(Long courseId);
}
