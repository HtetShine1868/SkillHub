package com.example.backend.career;

import jakarta.persistence.*;
import lombok.*;

/**
 * A career discovery question.
 * Each question has multiple options stored as JSON in the options column.
 *
 * Option JSON structure:
 * [
 *   {
 *     "label": "Building the system behind an application",
 *     "description": "I enjoy backend logic and data",
 *     "weights": {
 *       "1": 5,   <- careerId: score
 *       "2": 4,
 *       "3": 2
 *     }
 *   }
 * ]
 */
@Entity
@Table(name = "career_discovery_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerDiscoveryQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    /**
     * JSON array of options. Each option has label, description, and a weights map (careerId -> score).
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String optionsJson;

    @Column(nullable = false)
    private Integer orderIndex;
}
