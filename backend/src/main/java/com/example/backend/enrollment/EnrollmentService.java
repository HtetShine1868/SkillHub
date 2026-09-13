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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.example.backend.enrollment.dto.CourseProgressResponse;
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

        if (lesson != null) {
            upsertProgress(user, lesson, true, null, null);
        }

        return refreshEnrollmentProgress(user, enrollment, courseId, false);
    }

    /**
     * Completes a course only when every lesson is read, every quiz is
     * submitted, and every hands-on code test is submitted.
     */
    @Transactional
    public Enrollment completeCourse(User user, Long courseId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> enroll(user, courseId));

        CourseProgressResponse gate = getCourseProgress(user, courseId, null);
        if (!gate.canComplete()) {
            throw new IllegalArgumentException(
                    "Finish every lesson, quiz, and code test before completing the course. "
                            + String.join(" ", gate.missing())
            );
        }

        return refreshEnrollmentProgress(user, enrollment, courseId, true);
    }

    @Transactional
    public CourseProgressResponse submitLessonQuiz(User user, Long courseId, Long lessonId, boolean passed) {
        Lesson lesson = requireLesson(courseId, lessonId);
        upsertProgress(user, lesson, null, passed, null);
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> enroll(user, courseId));
        refreshEnrollmentProgress(user, enrollment, courseId, false);
        return getCourseProgress(user, courseId, lesson.getId());
    }

    @Transactional
    public CourseProgressResponse submitLessonAssignment(User user, Long courseId, Long lessonId) {
        Lesson lesson = requireLesson(courseId, lessonId);
        upsertProgress(user, lesson, null, null, true);
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), courseId)
                .orElseGet(() -> enroll(user, courseId));
        refreshEnrollmentProgress(user, enrollment, courseId, false);
        return getCourseProgress(user, courseId, lesson.getId());
    }

    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(User user, Long courseId, Long currentLessonId) {
        List<Lesson> courseLessons = lessonRepository.findByCourseIdOrderByLessonOrder(courseId);
        List<LessonProgress> rows = lessonProgressRepository.findByUserIdAndLessonCourseId(user.getId(), courseId);

        int lessonsDone = 0;
        int quizzesDone = 0;
        int assignmentsDone = 0;
        List<String> missing = new ArrayList<>();

        boolean currentRead = false;
        boolean currentQuiz = false;
        boolean currentAssign = false;

        for (Lesson lesson : courseLessons) {
            LessonProgress row = rows.stream()
                    .filter(p -> p.getLesson() != null && p.getLesson().getId().equals(lesson.getId()))
                    .findFirst()
                    .orElse(null);

            boolean read = row != null && Boolean.TRUE.equals(row.getCompleted());
            boolean quiz = row != null && Boolean.TRUE.equals(row.getQuizPassed());
            boolean assign = row != null && Boolean.TRUE.equals(row.getAssignmentCompleted());

            if (read) lessonsDone++;
            else missing.add("Lesson not finished: " + lesson.getTitle() + ".");

            if (quiz) quizzesDone++;
            else missing.add("Quiz not finished: " + lesson.getTitle() + ".");

            if (assign) assignmentsDone++;
            else missing.add("Code test not finished: " + lesson.getTitle() + ".");

            if (currentLessonId != null && lesson.getId().equals(currentLessonId)) {
                currentRead = read;
                currentQuiz = quiz;
                currentAssign = assign;
            }
        }

        int total = courseLessons.size();
        int required = Math.max(total, 1) * 3;
        int done = lessonsDone + quizzesDone + assignmentsDone;
        int percent = total == 0 ? 0 : Math.min(100, (int) Math.round((done * 100.0) / required));
        boolean canComplete = total > 0 && lessonsDone == total && quizzesDone == total && assignmentsDone == total;

        return new CourseProgressResponse(
                canComplete,
                total,
                lessonsDone,
                quizzesDone,
                assignmentsDone,
                percent,
                missing,
                currentRead,
                currentQuiz,
                currentAssign
        );
    }

    private Lesson requireLesson(Long courseId, Long lessonId) {
        List<Lesson> courseLessons = lessonRepository.findByCourseIdOrderByLessonOrder(courseId);
        return lessonRepository.findById(lessonId)
                .filter(l -> l.getCourse() != null && l.getCourse().getId().equals(courseId))
                .orElseGet(() -> {
                    for (Lesson l : courseLessons) {
                        if (l.getLessonOrder() != null && l.getLessonOrder().equals(lessonId.intValue())) {
                            return l;
                        }
                    }
                    throw new IllegalArgumentException("Lesson not found");
                });
    }

    private LessonProgress upsertProgress(
            User user,
            Lesson lesson,
            Boolean completed,
            Boolean quizPassed,
            Boolean assignmentCompleted
    ) {
        LessonProgress progress = lessonProgressRepository
                .findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElseGet(() -> LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .completed(false)
                        .quizPassed(false)
                        .assignmentCompleted(false)
                        .build());

        if (completed != null && completed) {
            progress.setCompleted(true);
        }
        if (quizPassed != null && quizPassed) {
            progress.setQuizPassed(true);
        }
        if (assignmentCompleted != null && assignmentCompleted) {
            progress.setAssignmentCompleted(true);
        }
        return lessonProgressRepository.save(progress);
    }

    private Enrollment refreshEnrollmentProgress(
            User user,
            Enrollment enrollment,
            Long courseId,
            boolean forceCompleteIfEligible
    ) {
        CourseProgressResponse gate = getCourseProgress(user, courseId, null);
        enrollment.setProgressPercentage(gate.progressPercentage());

        if (gate.canComplete() && (forceCompleteIfEligible || Boolean.TRUE.equals(enrollment.getCompleted()))) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
            issueCertificateAndBadge(user, enrollment, courseId, 100.0);
        } else if (!gate.canComplete()) {
            enrollment.setCompleted(false);
            enrollment.setCompletedAt(null);
        }

        Enrollment saved = enrollmentRepository.save(enrollment);
        syncRoadmapProgress(user, courseId, gate.progressPercentage());
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
            List<RoadmapItem> matches = roadmapItemRepository.findByUserIdAndCourseId(user.getId(), courseId);
            Long careerId = matches.isEmpty() || matches.get(0).getCareer() == null
                    ? null
                    : matches.get(0).getCareer().getId();
            List<RoadmapItem> userRoadmapItems = careerId == null
                    ? roadmapItemRepository.findByUserIdOrderByOrderIndexAsc(user.getId())
                    : roadmapItemRepository.findByUserIdAndCareerIdOrderByOrderIndexAsc(user.getId(), careerId);

            boolean unlockedNext = false;
            for (RoadmapItem ri : userRoadmapItems) {
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
                    unlockedNext = false;
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

        CourseProgressResponse gate = getCourseProgress(user, courseId, null);
        if (!gate.canComplete()) {
            return false;
        }

        if (score >= 70) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(LocalDateTime.now());
            enrollment.setProgressPercentage(100);
            enrollmentRepository.save(enrollment);

            issueCertificateAndBadge(user, enrollment, courseId, (double) score);
            syncRoadmapProgress(user, courseId, 100);
            return true;
        }
        return false;
    }

    public List<Enrollment> getMyEnrollments(User user) {
        return enrollmentRepository.findByUserId(user.getId());
    }

    public boolean isEnrolled(Long userId, Long courseId) {
        return enrollmentRepository.existsByUserIdAndCourseId(userId, courseId);
    }

    private String LocalDateYear() {
        return String.valueOf(LocalDateTime.now().getYear());
    }
}
