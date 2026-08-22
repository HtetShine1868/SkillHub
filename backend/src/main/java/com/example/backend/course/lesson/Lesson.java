package com.example.backend.course.lesson;
import com.example.backend.course.Course;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private Integer lessonOrder;

    @Column(nullable = false)
    private Integer estimatedMinutes;

    @Column(columnDefinition = "TEXT")
    private String content;
}
