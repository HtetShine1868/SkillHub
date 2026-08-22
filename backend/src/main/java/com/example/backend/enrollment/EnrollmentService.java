package com.example.backend.enrollment;

import com.example.backend.certificate.*;
import com.example.backend.course.Course;
import com.example.backend.course.CourseRepository;
import com.example.backend.course.lesson.Lesson;
import com.example.backend.course.lesson.LessonProgress;
import com.example.backend.course.lesson.LessonProgressRepository;
import com.example.backend.course.lesson.LessonRepository;
import com.example.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CertificateRepository certificateRepository;
    private final BadgeRepository badgeRepository;

    @Transactional
    public Enrollment enroll(User user, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Optional<Enrollment> existing = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .progressPercentage(0)
                .completed(false)
                .build();

        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public Enrollment completeLesson(User user, Long courseId, Long lessonId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Not enrolled in this course"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        if (!lessonProgressRepository.findByUserIdAndLessonId(user.getId(), lessonId).isPresent()) {
            LessonProgress progress = LessonProgress.builder()
                    .user(user)
                    .lesson(lesson)
                    .completed(true)
                    .build();
            lessonProgressRepository.save(progress);
        }

        // Calculate progress percentage
        int totalLessons = lessonRepository.findByCourseIdOrderByLessonOrder(courseId).size();
        int completedLessons = lessonProgressRepository.countByUserIdAndLessonCourseId(user.getId(), courseId);

        int percent = totalLessons > 0 ? (int) (((double) completedLessons / totalLessons) * 100) : 100;
        enrollment.setProgressPercentage(percent);

        // If completed all lessons and has no assessment required (or auto-completed), we can set completed = true
        // If course has assessment, completion requires passing the assessment (which is done via submitCourseAssessment).
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    public boolean submitCourseAssessment(User user, Long courseId, int score) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseThrow(() -> new RuntimeException("Not enrolled in this course"));

        if (score >= 70) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
            enrollmentRepository.save(enrollment);

            // Issue Certificate
            if (!certificateRepository.findByUserIdAndCourseId(user.getId(), courseId).isPresent()) {
                String certUuid = "CERT-" + LocalDateYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                Certificate certificate = Certificate.builder()
                        .certificateId(certUuid)
                        .user(user)
                        .course(enrollment.getCourse())
                        .score((double) score)
                        .build();
                certificateRepository.save(certificate);
            }

            // Issue Badge
            List<Badge> existingBadges = badgeRepository.findByUserIdAndCourseId(user.getId(), courseId);
            if (existingBadges.isEmpty()) {
                Badge badge = Badge.builder()
                        .user(user)
                        .course(enrollment.getCourse())
                        .badgeType(score >= 90 ? "GOLD" : score >= 80 ? "SILVER" : "BRONZE")
                        .build();
                badgeRepository.save(badge);
            }
            return true;
        }
        return false;
    }

    public List<Enrollment> getMyEnrollments(User user) {
        return enrollmentRepository.findByUserId(user.getId());
    }

    private String LocalDateYear() {
        return String.valueOf(LocalDateTime.now().getYear());
    }
}
