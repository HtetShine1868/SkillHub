package com.example.backend.skillexchange.repository;

import com.example.backend.skillexchange.entity.ProjectComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectCommentRepository extends JpaRepository<ProjectComment, Long> {
    List<ProjectComment> findByProjectIdAndParentIsNullOrderByCreatedAtAsc(Long projectId);
}
