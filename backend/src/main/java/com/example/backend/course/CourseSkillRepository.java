package com.example.backend.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseSkillRepository extends JpaRepository<CourseSkill, Long> {

    List<CourseSkill> findByCourseId(Long courseId);

    List<CourseSkill> findBySkillId(Long skillId);
}
