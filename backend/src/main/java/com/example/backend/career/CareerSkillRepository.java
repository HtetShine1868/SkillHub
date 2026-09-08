package com.example.backend.career;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerSkillRepository extends JpaRepository<CareerSkill, Long> {

    @EntityGraph(attributePaths = {"skill"})
    List<CareerSkill> findByCareerId(Long careerId);

    void deleteByCareerId(Long careerId);
}

