package com.example.backend.enrollment;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository
        extends JpaRepository<Enrollment, Long> {

    Optional<Enrollment> findByUserIdAndCourseId(
            Long userId,
            Long courseId
    );

    List<Enrollment> findByUserId(
            Long userId
    );

    List<Enrollment> findByUserIdAndCompletedFalse(
            Long userId
    );

    List<Enrollment> findByUserIdAndCompletedTrue(
            Long userId
    );

    boolean existsByUserIdAndCourseId(
            Long userId,
            Long courseId
    );
}