package com.example.backend.course;

import com.example.backend.course.dto.CourseResponse;
import com.example.backend.course.dto.CourseRequest;
import com.example.backend.course.lesson.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final CoursePrerequisiteRepository coursePrerequisiteRepository;

    public List<CourseResponse> getAllCourses() {
        return courseRepository
                .findByPublishedTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));

        return toResponse(course);
    }

    public List<CourseResponse> searchCourses(String search) {
        return courseRepository
                .findByTitleContainingIgnoreCaseAndPublishedTrue(search)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CourseResponse> getCoursesByCategory(String category) {
        return courseRepository
                .findByCategoryIgnoreCaseAndPublishedTrue(category)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CourseResponse> getCoursesBySkill(String skill, Integer learnerLevel) {
        String query = skill == null ? "" : skill.trim();
        if (query.isBlank()) {
            return List.of();
        }

        int level = learnerLevel == null ? 1 : Math.max(0, Math.min(5, learnerLevel));
        Map<Long, Course> unique = new LinkedHashMap<>();
        Map<Long, Boolean> skillMappedByCourse = new LinkedHashMap<>();

        for (CourseSkill mapping : courseSkillRepository.findAll()) {
            Course course = mapping.getCourse();
            if (!isPublicCourse(course) || mapping.getSkill() == null) {
                continue;
            }
            if (skillNameMatches(mapping.getSkill().getName(), query)) {
                unique.putIfAbsent(course.getId(), course);
                skillMappedByCourse.put(course.getId(), true);
            }
        }

        for (Course course : courseRepository.findByPublishedTrue()) {
            if (!isPublicCourse(course) || unique.containsKey(course.getId())) {
                continue;
            }
            if (titleOrCategoryMatches(course, query)) {
                unique.put(course.getId(), course);
                skillMappedByCourse.putIfAbsent(course.getId(), false);
            }
        }

        List<Course> candidates = new ArrayList<>(unique.values());
        if (candidates.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> lessonCounts = new LinkedHashMap<>();
        List<Long> ids = candidates.stream().map(Course::getId).toList();
        for (Object[] row : lessonRepository.countByCourseIds(ids)) {
            lessonCounts.put((Long) row[0], (Long) row[1]);
        }

        record Scored(Course course, double score, String reason) {}

        List<Scored> scored = candidates.stream()
                .map(course -> {
                    boolean skillMapped = Boolean.TRUE.equals(skillMappedByCourse.get(course.getId()));
                    boolean titleMatch = titleOrCategoryMatches(course, query);
                    long lessons = lessonCounts.getOrDefault(course.getId(), 0L);
                    double score = recommendationScore(course, skillMapped || titleMatch, level, lessons);
                    return new Scored(course, score, recommendationReason(course, skillMapped || titleMatch, level));
                })
                .sorted(Comparator.comparingDouble(Scored::score).reversed())
                .toList();

        List<CourseResponse> responses = new ArrayList<>();
        for (int i = 0; i < scored.size(); i++) {
            Scored item = scored.get(i);
            CourseResponse base = toResponse(item.course());
            boolean recommended = i == 0;
            responses.add(new CourseResponse(
                    base.id(),
                    base.title(),
                    base.description(),
                    base.category(),
                    base.difficulty(),
                    base.durationHours(),
                    base.thumbnailUrl(),
                    base.rating(),
                    base.enrollmentCount(),
                    base.createdAt(),
                    base.published(),
                    base.status(),
                    base.rejectionReason(),
                    base.instructorId(),
                    base.instructorName(),
                    base.reviewCount(),
                    recommended,
                    recommended ? item.reason() : null
            ));
        }
        return responses;
    }

    public CourseResponse toResponse(Course course) {
        if (course == null) return null;

        boolean isPub = Boolean.TRUE.equals(course.getPublished());
        String status = course.getStatus() != null ? course.getStatus() : (isPub ? "PUBLISHED" : "DRAFT");

        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCategory(),
                normalizeDifficulty(course.getDifficulty()),
                course.getDurationHours(),
                course.getThumbnailUrl(),
                course.getRating() != null ? course.getRating() : 0.0,
                course.getEnrollmentCount() != null ? course.getEnrollmentCount() : 0,
                course.getCreatedAt() != null ? course.getCreatedAt() : java.time.LocalDateTime.now(),
                isPub,
                status,
                course.getRejectionReason(),
                course.getInstructorId(),
                course.getInstructorName(),
                course.getReviewCount() != null ? course.getReviewCount() : 0
        );
    }

    public CourseResponse createCourse(CourseRequest request) {
        boolean isPub = request.getPublished() != null ? request.getPublished() : true;
        String initialStatus = request.getStatus() != null ? request.getStatus() : (isPub ? "PUBLISHED" : "DRAFT");

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .difficulty(normalizeDifficulty(request.getDifficulty()))
                .durationHours(request.getDurationHours())
                .thumbnailUrl(request.getThumbnailUrl())
                .published(isPub)
                .status(initialStatus)
                .rejectionReason(request.getRejectionReason())
                .instructorId(request.getInstructorId())
                .instructorName(request.getInstructorName())
                .rating(0.0)
                .enrollmentCount(0)
                .reviewCount(0)
                .build();
        return toResponse(courseRepository.save(course));
    }

    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setDifficulty(normalizeDifficulty(request.getDifficulty()));
        course.setDurationHours(request.getDurationHours());
        course.setThumbnailUrl(request.getThumbnailUrl());

        if (request.getPublished() != null) {
            course.setPublished(request.getPublished());
        }
        if (request.getStatus() != null) {
            course.setStatus(request.getStatus());
        }
        if (request.getRejectionReason() != null) {
            course.setRejectionReason(request.getRejectionReason());
        }
        if (request.getInstructorId() != null) {
            course.setInstructorId(request.getInstructorId());
        }
        if (request.getInstructorName() != null) {
            course.setInstructorName(request.getInstructorName());
        }

        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        coursePrerequisiteRepository.deleteByCourseId(id);
        coursePrerequisiteRepository.deleteByRequiredCourseId(id);
        courseSkillRepository.deleteByCourseId(id);
        lessonRepository.deleteByCourseId(id);
        courseRepository.delete(course);
    }

    public static String normalizeDifficulty(String difficulty) {
        if (difficulty == null || difficulty.isBlank()) {
            return "BEGINNER";
        }
        String key = difficulty.trim().toUpperCase(Locale.ROOT);
        return switch (key) {
            case "BEGINNER", "EASY" -> "BEGINNER";
            case "INTERMEDIATE", "MEDIUM" -> "INTERMEDIATE";
            case "ADVANCED", "HARD" -> "ADVANCED";
            case "EXPERT" -> "EXPERT";
            default -> key;
        };
    }

    private boolean isPublicCourse(Course course) {
        if (course == null || !Boolean.TRUE.equals(course.getPublished())) {
            return false;
        }
        String status = course.getStatus();
        return status == null || "PUBLISHED".equalsIgnoreCase(status);
    }

    private boolean titleOrCategoryMatches(Course course, String query) {
        return textMatches(course.getTitle(), query)
                || textMatches(course.getCategory(), query)
                || textMatches(course.getDescription(), query);
    }

    private boolean skillNameMatches(String skillName, String query) {
        return textMatches(skillName, query);
    }

    private boolean textMatches(String text, String query) {
        if (text == null || query == null) {
            return false;
        }
        String a = normalizeSkillToken(text);
        String b = normalizeSkillToken(query);
        if (a.isBlank() || b.isBlank()) {
            return false;
        }
        if (a.equals(b)) {
            return true;
        }
        if (isJavaVsJavascriptConflict(a, b)) {
            return false;
        }
        return a.contains(b) || b.contains(a);
    }

    private String normalizeSkillToken(String value) {
        String normalized = value.toLowerCase(Locale.ROOT)
                .replace("react.js", "react")
                .replace("reactjs", "react")
                .replace("node.js", "nodejs")
                .replace("spring boot", "springboot")
                .replace("type script", "typescript")
                .replaceAll("[^a-z0-9]+", "");
        if ("js".equals(normalized)) {
            return "javascript";
        }
        if ("ts".equals(normalized)) {
            return "typescript";
        }
        return normalized;
    }

    private boolean isJavaVsJavascriptConflict(String a, String b) {
        return ("java".equals(a) && b.contains("javascript"))
                || ("java".equals(b) && a.contains("javascript"));
    }

    private double recommendationScore(Course course, boolean skillMatch, int learnerLevel, long lessonCount) {
        double score = 0;
        if (skillMatch) {
            score += 35;
        }

        String difficulty = course.getDifficulty() == null ? "" : course.getDifficulty().toLowerCase(Locale.ROOT);
        String preferred = preferredDifficulty(learnerLevel);
        if (difficulty.contains(preferred)) {
            score += 25;
        } else if (("beginner".equals(preferred) && difficulty.contains("intermediate"))
                || ("advanced".equals(preferred) && difficulty.contains("intermediate"))) {
            score += 10;
        }

        double rating = course.getRating() != null ? course.getRating() : 0;
        score += (rating / 5.0) * 15;

        int reviews = course.getReviewCount() != null ? course.getReviewCount() : 0;
        score += Math.min(10, Math.log10(reviews + 1) * 4);

        int enrollments = course.getEnrollmentCount() != null ? course.getEnrollmentCount() : 0;
        score += Math.min(8, Math.log10(enrollments + 1) * 3);

        String description = course.getDescription() == null ? "" : course.getDescription();
        boolean quality = description.length() >= 80 || lessonCount >= 5;
        if (quality) {
            score += 4;
        }
        if (lessonCount >= 8) {
            score += 2;
        }

        LocalDateTime created = course.getCreatedAt();
        if (created != null && created.isAfter(LocalDateTime.now().minusMonths(12))) {
            score += 3;
        }

        return score;
    }

    private String preferredDifficulty(int learnerLevel) {
        if (learnerLevel <= 1) {
            return "beginner";
        }
        if (learnerLevel <= 3) {
            return "intermediate";
        }
        return "advanced";
    }

    private String recommendationReason(Course course, boolean skillMatch, int learnerLevel) {
        String difficulty = course.getDifficulty() == null ? "this" : course.getDifficulty().toLowerCase(Locale.ROOT);
        String preferred = preferredDifficulty(learnerLevel);
        int reviews = course.getReviewCount() != null ? course.getReviewCount() : 0;
        double rating = course.getRating() != null ? course.getRating() : 0;
        String skillPart = skillMatch ? "teaches the required skill" : "closely matches this skill";
        String levelPart = difficulty.contains(preferred)
                ? "matches your current level"
                : "is a strong next step for this skill";
        return "Recommended for you: it " + skillPart + ", " + levelPart
                + ", and has a " + String.format(Locale.US, "%.1f", rating)
                + " rating from " + reviews + " reviews.";
    }
}