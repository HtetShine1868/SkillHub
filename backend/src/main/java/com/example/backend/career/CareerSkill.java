package com.example.backend.career;

import com.example.backend.skill.Skill;
import jakarta.persistence.*;
import lombok.*;

/**
 * Maps a career to the skills it requires, including the required level and importance.
 * importance is 0.0–1.0; required_level uses the 0–5 scale from spec §6.
 */
@Entity
@Table(
        name = "career_skills",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_career_skill",
                columnNames = {"career_id", "skill_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "career_id", nullable = false)
    private Career career;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    /**
     * Required proficiency level (0–5).
     */
    @Column(nullable = false)
    private Integer requiredLevel;

    /**
     * How important this skill is for the career (0.0 – 1.0).
     * Used in skill gap priority score: gap * importance.
     */
    @Column(nullable = false)
    private Double importance;
}
