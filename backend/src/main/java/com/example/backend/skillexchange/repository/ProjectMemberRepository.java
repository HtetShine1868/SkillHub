package com.example.backend.skillexchange.repository;

import com.example.backend.skillexchange.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByUserEmail(String email);
    List<ProjectMember> findByProjectId(Long projectId);
    boolean existsByProjectIdAndUserEmail(Long projectId, String email);
    Optional<ProjectMember> findByProjectIdAndUserEmail(Long projectId, String email);
}
