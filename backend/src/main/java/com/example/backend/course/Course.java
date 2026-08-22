package com.example.backend.course;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 50)
    private String difficulty;

    @Column(nullable = false)
    private Integer durationHours;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private Integer enrollmentCount;

    @Column(nullable = false)
    private Boolean published;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();

        if (rating == null) {
            rating = 0.0;
        }

        if (enrollmentCount == null) {
            enrollmentCount = 0;
        }

        if (published == null) {
            published = true;
        }
    }
}