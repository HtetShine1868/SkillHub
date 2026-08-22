package com.example.backend.skill;

import com.example.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Records a user's current skill level for a specific skill.
 * Source tracks how the level was determined (e.g. ASSESSMENT, SELF_REPORTED, COURSE).
 */
@Entity
@Table(
        name = "user_skills",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_skill",
                columnNames = {"user_id", "skill_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    /**
     * Current skill level on scale 0–5 (spec §6).
     * 0=None, 1=Beginner, 2=Elementary, 3=Intermediate, 4=Advanced, 5=Expert
     */
    @Column(nullable = false)
    private Integer currentLevel;

    /**
     * Confidence score 0.0–1.0 (weighted combination of evidence).
     */
    @Column(nullable = false)
    private Double confidence;

    /**
     * Source of the skill level: ASSESSMENT, SELF_REPORTED, COURSE, PROJECT
     */
    @Column(nullable = false, length = 30)
    private String source;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
