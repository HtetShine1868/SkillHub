package com.example.backend.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {

    List<AssessmentAttempt> findByUserId(Long userId);

    List<AssessmentAttempt> findByUserIdAndCareerId(Long userId, Long careerId);
}
