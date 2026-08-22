package com.example.backend.course.lesson;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<LessonProgress> findByUserIdAndLessonCourseId(Long userId, Long courseId);
    int countByUserIdAndLessonCourseId(Long userId, Long courseId);
}
