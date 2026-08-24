package com.example.backend.career;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerSkillRepository extends JpaRepository<CareerSkill, Long> {

    List<CareerSkill> findByCareerId(Long careerId);

    void deleteByCareerId(Long careerId);
}

