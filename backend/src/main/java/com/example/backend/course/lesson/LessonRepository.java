package com.example.backend.course.lesson;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface LessonRepository
        extends JpaRepository<Lesson, Long> {

    List<Lesson> findByCourseIdOrderByLessonOrder(
            Long courseId
    );

    @Query("SELECT l.course.id, COUNT(l) FROM Lesson l WHERE l.course.id IN :courseIds GROUP BY l.course.id")
    List<Object[]> countByCourseIds(@Param("courseIds") Collection<Long> courseIds);

    void deleteByCourseId(Long courseId);
}