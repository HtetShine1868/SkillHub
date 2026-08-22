package com.example.backend.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, Long> {

    List<AssessmentQuestion> findAllByOrderByOrderIndexAsc();

    List<AssessmentQuestion> findBySkillId(Long skillId);
}
