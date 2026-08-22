package com.example.backend.course;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a prerequisite relationship between two courses.
 */
@Entity
@Table(
        name = "course_prerequisites",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_course_prerequisite",
                columnNames = {"course_id", "required_course_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursePrerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "required_course_id", nullable = false)
    private Course requiredCourse;
}
