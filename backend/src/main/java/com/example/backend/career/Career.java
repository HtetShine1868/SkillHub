package com.example.backend.career;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "careers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Career {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    /** Emoji or icon identifier displayed in the UI */
    @Column(length = 10)
    private String icon;

    /** Comma-separated list of typical responsibilities for the career detail page */
    @Column(columnDefinition = "TEXT")
    private String responsibilities;

    /** Whether this career is visible to users */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
