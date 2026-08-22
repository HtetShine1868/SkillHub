package com.example.backend.assessment;

import com.example.backend.skill.Skill;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a question in the skill assessment.
 * Can be a 'self-assessment' question (type: SELF_REPORTED) or a 'knowledge/practical' question (type: KNOWLEDGE).
 */
@Entity
@Table(name = "assessment_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The skill this question evaluates.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    /**
     * Type: SELF_REPORTED, KNOWLEDGE, PRACTICAL
     */
    @Column(nullable = false, length = 50)
    private String type;

    /**
     * Options JSON array, e.g.:
     * [
     *   {"label": "Beginner", "description": "I have little experience", "value": 1},
     *   {"label": "Basic", "description": "I understand syntax", "value": 2}
     * ]
     * Or for knowledge questions:
     * [
     *   {"optionKey": "A", "text": "To mark a class as web controller"},
     *   {"optionKey": "B", "text": "To return JSON directly"}
     * ]
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionsJson;

    /**
     * Correct option key (e.g. "B" or "2" etc.) - null for self-reported.
     */
    @Column(length = 50)
    private String correctAnswer;

    /**
     * Difficulty level (1 to 5) for knowledge questions. Self-reported questions can have difficulty 0 or null.
     */
    private Integer difficulty;

    /**
     * Order of the question in the assessment.
     */
    private Integer orderIndex;
}
