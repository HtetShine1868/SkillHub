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

import com.example.backend.roadmap.RoadmapItem;
import com.example.backend.roadmap.RoadmapItemRepository;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CertificateRepository certificateRepository;
    private final BadgeRepository badgeRepository;
    private final RoadmapItemRepository roadmapItemRepository;

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
                .orElseGet(() -> enroll(user, courseId));

        // Find lesson safely (by ID or by lesson order within course)
        List<Lesson> courseLessons = lessonRepository.findByCourseIdOrderByLessonOrder(courseId);
        Lesson lesson = lessonRepository.findById(lessonId)
                .filter(l -> l.getCourse() != null && l.getCourse().getId().equals(courseId))
                .orElseGet(() -> {
                    for (Lesson l : courseLessons) {
                        if (l.getLessonOrder() != null && l.getLessonOrder().equals(lessonId.intValue())) {
                            return l;
                        }
                    }
                    return courseLessons.isEmpty() ? null : courseLessons.get(0);
                });

        if (lesson != null && !lessonProgressRepository.findByUserIdAndLessonId(user.getId(), lesson.getId()).isPresent()) {
            LessonProgress progress = LessonProgress.builder()
                    .user(user)
                    .lesson(lesson)
                    .completed(true)
                    .build();
            lessonProgressRepository.save(progress);
        }

        // Calculate progress percentage
        int totalLessons = courseLessons.isEmpty() ? 1 : courseLessons.size();
        int completedLessons = lessonProgressRepository.countByUserIdAndLessonCourseId(user.getId(), courseId);

        int percent = (int) (((double) completedLessons / totalLessons) * 100);
        if (completedLessons >= totalLessons || percent > 100) {
            percent = 100;
        }

        enrollment.setProgressPercentage(percent);

        if (percent >= 100) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
        }

        Enrollment saved = enrollmentRepository.save(enrollment);

        // Issue certificate when course fully completed via lesson completion
        if (percent >= 100) {
            issueCertificateAndBadge(user, enrollment, courseId, 100.0);
        }

        // Sync active roadmap items and unlock downstream stages
        syncRoadmapProgress(user, courseId, percent);

        return saved;
    }

    /**
     * Explicitly marks an entire course as completed for a user, regardless of
     * which individual lessons already have a recorded LessonProgress row.
     *
     * This is used by the "Complete Course & Rate" action so that certificate
     * issuance does not silently depend on the student having clicked "Next"
     * on every single lesson in order (e.g. if they jumped ahead via the
     * lesson sidebar).
     */
    @Transactional
    public Enrollment completeCourse(User user, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> enroll(user, courseId));

        List<Lesson> courseLessons = lessonRepository.findByCourseIdOrderByLessonOrder(courseId);

        for (Lesson lesson : courseLessons) {
            if (!lessonProgressRepository.findByUserIdAndLessonId(user.getId(), lesson.getId()).isPresent()) {
                LessonProgress progress = LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .completed(true)
                        .build();
                lessonProgressRepository.save(progress);
            }
        }

        enrollment.setProgressPercentage(100);
        enrollment.setCompleted(true);
        enrollment.setCompletedAt(LocalDateTime.now());

        Enrollment saved = enrollmentRepository.save(enrollment);

        issueCertificateAndBadge(user, enrollment, courseId, 100.0);
        syncRoadmapProgress(user, courseId, 100);

        return saved;
    }

    private void issueCertificateAndBadge(User user, Enrollment enrollment, Long courseId, double score) {
        try {
            if (!certificateRepository.findByUserIdAndCourseId(user.getId(), courseId).isPresent()) {
                String certUuid = "CERT-" + LocalDateYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                Certificate certificate = Certificate.builder()
                        .certificateId(certUuid)
                        .user(user)
                        .course(enrollment.getCourse())
                        .score(score)
                        .build();
                certificateRepository.save(certificate);
            }
            // Issue badge if not already given
            if (badgeRepository.findByUserIdAndCourseId(user.getId(), courseId).isEmpty()) {
                Badge badge = Badge.builder()
                        .user(user)
                        .course(enrollment.getCourse())
                        .badgeType(score >= 90 ? "GOLD" : score >= 80 ? "SILVER" : "BRONZE")
                        .build();
                badgeRepository.save(badge);
            }
        } catch (Exception e) {
            // Silently ignore if cert/badge already exists
        }
    }

    private void syncRoadmapProgress(User user, Long courseId, int percent) {
        try {
            List<RoadmapItem> userRoadmapItems = roadmapItemRepository.findByUserIdOrderByOrderIndexAsc(user.getId());
            boolean unlockedNext = false;
            for (int i = 0; i < userRoadmapItems.size(); i++) {
                RoadmapItem ri = userRoadmapItems.get(i);
                if (ri.getCourse() != null && ri.getCourse().getId().equals(courseId)) {
                    ri.setProgress(percent);
                    if (percent >= 100) {
                        ri.setStatus("COMPLETED");
                        unlockedNext = true;
                    } else {
                        ri.setStatus("IN_PROGRESS");
                    }
                    roadmapItemRepository.save(ri);
                } else if (unlockedNext && "LOCKED".equalsIgnoreCase(ri.getStatus())) {
                    ri.setStatus("AVAILABLE");
                    roadmapItemRepository.save(ri);
                    unlockedNext = false; // Only unlock the immediate next stage
                }
            }
        } catch (Exception e) {
            // Silently ignore roadmap sync error
        }
    }

    @Transactional
    public boolean submitCourseAssessment(User user, Long courseId, int score) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> enroll(user, courseId));

        if (score >= 70) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
            enrollmentRepository.save(enrollment);

            issueCertificateAndBadge(user, enrollment, courseId, (double) score);
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
