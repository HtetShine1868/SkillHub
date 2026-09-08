package com.example.backend.course;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseSkillRepository extends JpaRepository<CourseSkill, Long> {

    @EntityGraph(attributePaths = {"skill"})
    List<CourseSkill> findByCourseId(Long courseId);

    @EntityGraph(attributePaths = {"skill"})
    List<CourseSkill> findBySkillId(Long skillId);

    void deleteByCourseId(Long courseId);
}
