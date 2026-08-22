package com.example.backend.certificate;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUserId(Long userId);
    List<Badge> findByUserIdAndCourseId(Long userId, Long courseId);
}
