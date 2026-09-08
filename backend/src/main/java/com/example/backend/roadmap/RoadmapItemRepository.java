package com.example.backend.roadmap;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadmapItemRepository extends JpaRepository<RoadmapItem, Long> {

    List<RoadmapItem> findByUserId(Long userId);

    List<RoadmapItem> findByUserIdOrderByOrderIndexAsc(Long userId);

    List<RoadmapItem> findByUserIdAndCourseId(Long userId, Long courseId);

    List<RoadmapItem> findByUserIdAndCareerIdOrderByOrderIndexAsc(Long userId, Long careerId);

    void deleteByUserIdAndCareerId(Long userId, Long careerId);
}
