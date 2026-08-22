package com.example.backend.course;

import com.example.backend.skill.Skill;
import jakarta.persistence.*;
import lombok.*;

/**
 * Maps a course to the skills it teaches and the target level it helps achieve.
 */
@Entity
@Table(
        name = "course_skills",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_course_skill",
                columnNames = {"course_id", "skill_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    /**
     * Target proficiency level (0–5) this course teaches up to.
     */
    @Column(nullable = false)
    private Integer targetLevel;

    /**
     * How extensively this course covers the skill (0.0 to 1.0).
     */
    @Column(nullable = false)
    private Double importance;
}
