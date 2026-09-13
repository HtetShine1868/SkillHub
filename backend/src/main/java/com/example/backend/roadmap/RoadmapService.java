package com.example.backend.roadmap;

import com.example.backend.career.*;
import com.example.backend.course.*;
import com.example.backend.enrollment.Enrollment;
import com.example.backend.enrollment.EnrollmentRepository;
import com.example.backend.roadmap.dto.RoadmapResponse;
import com.example.backend.roadmap.dto.RoadmapResponse.RoadmapItemDto;
import com.example.backend.roadmap.dto.RoadmapSummary;
import com.example.backend.skill.UserSkill;
import com.example.backend.skill.UserSkillRepository;
import com.example.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapService {

    /**
     * Foundation languages that can appear as parallel first-step choices
     * on developer roadmaps (Java vs JavaScript vs Python).
     */
    private static final Map<String, String> STARTER_LANGUAGE_LABELS = Map.of(
            "java", "Java",
            "typescript", "JavaScript",
            "node.js & express", "JavaScript",
            "python", "Python"
    );

    private final RoadmapItemRepository roadmapItemRepository;
    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;
    private final UserSkillRepository userSkillRepository;
    private final CourseRepository courseRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final CoursePrerequisiteRepository prerequisiteRepository;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Generates a personalized roadmap. A user may keep two career maps.
     * A third career replaces the oldest map after the client confirms.
     */
    @Transactional
    public RoadmapResponse generateRoadmap(User user, Long careerId, boolean confirmed) {
        prepareGenerationSlot(user, careerId, confirmed);
        return buildRoadmap(user, careerId);
    }

    @Transactional
    public RoadmapResponse generateRoadmap(User user, Long careerId) {
        return generateRoadmap(user, careerId, false);
    }

    public List<RoadmapSummary> listRoadmaps(User user) {
        return summariesFor(user);
    }

    private void prepareGenerationSlot(User user, Long careerId, boolean confirmed) {
        List<RoadmapSummary> existing = summariesFor(user);
        boolean alreadyHasCareer = existing.stream().anyMatch(s -> s.careerId().equals(careerId));
        if (alreadyHasCareer) {
            return;
        }

        if (existing.size() == 1 && !confirmed) {
            RoadmapSummary first = existing.get(0);
            String reason = first.complete() ? "COMPLETE" : "INCOMPLETE";
            String message = first.complete()
                    ? "Your " + first.careerName() + " roadmap is complete. Generate another roadmap?"
                    : "Your " + first.careerName() + " roadmap is not complete yet. Are you sure you want to generate another roadmap?";
            throw new RoadmapConfirmRequiredException(message, reason, null, null, existing);
        }

        if (existing.size() >= 2) {
            RoadmapSummary oldest = existing.get(0);
            if (!confirmed) {
                throw new RoadmapConfirmRequiredException(
                        "You already have two roadmaps. Generating this one will replace "
                                + oldest.careerName() + ".",
                        "REPLACE",
                        oldest.careerId(),
                        oldest.careerName(),
                        existing
                );
            }
            roadmapItemRepository.deleteByUserIdAndCareerId(user.getId(), oldest.careerId());
        }
    }

    private List<RoadmapSummary> summariesFor(User user) {
        List<RoadmapItem> items = roadmapItemRepository.findByUserId(user.getId());
        Map<Long, List<RoadmapItem>> byCareer = new LinkedHashMap<>();
        for (RoadmapItem item : items) {
            if (item.getCareer() == null) {
                continue;
            }
            byCareer.computeIfAbsent(item.getCareer().getId(), k -> new ArrayList<>()).add(item);
        }

        List<RoadmapSummary> summaries = new ArrayList<>();
        for (Map.Entry<Long, List<RoadmapItem>> entry : byCareer.entrySet()) {
            List<RoadmapItem> group = entry.getValue();
            group.sort(Comparator.comparing(RoadmapItem::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())));
            int total = group.size();
            int done = (int) group.stream().filter(ri ->
                    "COMPLETED".equalsIgnoreCase(ri.getStatus())
                            || (ri.getProgress() != null && ri.getProgress() >= 100)
            ).count();
            LocalDateTime created = group.stream()
                    .map(RoadmapItem::getCreatedAt)
                    .filter(Objects::nonNull)
                    .min(LocalDateTime::compareTo)
                    .orElse(null);
            String name = group.get(0).getCareer().getName();
            int progress = total == 0 ? 0 : (done * 100) / total;
            summaries.add(new RoadmapSummary(
                    entry.getKey(),
                    name,
                    progress,
                    done,
                    total,
                    total > 0 && done >= total,
                    created
            ));
        }
        summaries.sort(Comparator.comparing(RoadmapSummary::createdAt, Comparator.nullsLast(Comparator.naturalOrder())));
        return summaries;
    }

    private RoadmapResponse buildRoadmap(User user, Long careerId) {
        Career career = careerRepository.findById(careerId)
                .orElse(null);
        if (career == null) {
            return new RoadmapResponse(careerId, "Unknown Career", 0, new java.util.ArrayList<>());
        }

        // Step 1: Fetch user's current skills
        List<UserSkill> userSkills = userSkillRepository.findByUserId(user.getId());
        Map<Long, Integer> userSkillLevels = new HashMap<>();
        for (UserSkill us : userSkills) {
            userSkillLevels.put(us.getSkill().getId(), us.getCurrentLevel());
        }

        // Step 2: Fetch required career skills
        List<CareerSkill> careerSkills = careerSkillRepository.findByCareerId(careerId);
        Map<Long, CareerSkill> requiredSkills = new HashMap<>();
        Map<Long, Double> skillImportance = new HashMap<>();
        for (CareerSkill cs : careerSkills) {
            Long skillId = cs.getSkill().getId();
            requiredSkills.put(skillId, cs);
            skillImportance.put(skillId, cs.getImportance());
        }

        // Step 3: Identify skill gaps
        Map<Long, Integer> gaps = new HashMap<>();
        for (CareerSkill cs : careerSkills) {
            Long skillId = cs.getSkill().getId();
            int current = userSkillLevels.getOrDefault(skillId, 0);
            int required = cs.getRequiredLevel();
            int gap = required - current;
            if (gap > 0) {
                gaps.put(skillId, gap);
            }
        }

        List<Enrollment> userEnrollments = enrollmentRepository.findByUserId(user.getId());
        Set<Long> completedCourseIds = new HashSet<>();
        for (Enrollment e : userEnrollments) {
            if (e.getCourse() != null && Boolean.TRUE.equals(e.getCompleted())) {
                completedCourseIds.add(e.getCourse().getId());
            }
        }

        List<Course> allCourses = courseRepository.findAll();
        Map<Long, Boolean> requiredByCourse = new LinkedHashMap<>();
        Map<Long, String> courseReasons = new HashMap<>();
        List<Course> careerCourses = pickAllCareerCourses(
                careerSkills,
                allCourses,
                gaps,
                userSkillLevels,
                requiredSkills,
                completedCourseIds,
                requiredByCourse,
                courseReasons
        );

        List<Course> requiredCourses = careerCourses.stream()
                .filter(c -> Boolean.TRUE.equals(requiredByCourse.get(c.getId())))
                .toList();
        List<Course> alreadyCourses = careerCourses.stream()
                .filter(c -> !Boolean.TRUE.equals(requiredByCourse.get(c.getId())))
                .toList();

        List<Course> orderedRequired = sortCoursesByPrerequisites(new ArrayList<>(requiredCourses));
        List<Course> orderedCourses = new ArrayList<>(orderedRequired);
        orderedCourses.addAll(alreadyCourses);

        roadmapItemRepository.deleteByUserIdAndCareerId(user.getId(), careerId);

        List<RoadmapItem> newRoadmapItems = new ArrayList<>();
        int orderIndex = 1;
        Set<Long> addedCourseIds = new HashSet<>();
        Set<Long> requiredIds = new HashSet<>();
        for (Course c : orderedRequired) {
            requiredIds.add(c.getId());
        }

        for (Course course : orderedCourses) {
            if (!addedCourseIds.add(course.getId())) {
                continue;
            }

            boolean needed = Boolean.TRUE.equals(requiredByCourse.get(course.getId()));
            String requirement = needed ? "REQUIRED" : "ALREADY_HAVE";
            boolean courseDone = completedCourseIds.contains(course.getId());

            boolean isLocked = false;
            String lockedReason = null;
            if (needed && !courseDone) {
                for (CoursePrerequisite prereq : prerequisiteRepository.findByCourseId(course.getId())) {
                    Long prereqCourseId = prereq.getRequiredCourse().getId();
                    if (!requiredIds.contains(prereqCourseId)) {
                        continue;
                    }
                    if (!completedCourseIds.contains(prereqCourseId)) {
                        isLocked = true;
                        lockedReason = "Complete " + prereq.getRequiredCourse().getTitle() + " first.";
                        break;
                    }
                }
            }

            String status = courseDone ? "COMPLETED" : (isLocked ? "LOCKED" : "AVAILABLE");
            String reason = isLocked
                    ? lockedReason
                    : courseReasons.getOrDefault(course.getId(),
                    needed ? "Required for your skill gap." : "You already cover this skill.");

            if (!courseDone && !isLocked && needed) {
                Optional<Enrollment> enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), course.getId());
                if (enrollment.isPresent() && !Boolean.TRUE.equals(enrollment.get().getCompleted())) {
                    status = "IN_PROGRESS";
                }
            }

            newRoadmapItems.add(RoadmapItem.builder()
                    .user(user)
                    .career(career)
                    .course(course)
                    .orderIndex(orderIndex++)
                    .status(status)
                    .progress(courseDone ? 100 : 0)
                    .reason(reason)
                    .requirement(requirement)
                    .build());
        }

        roadmapItemRepository.saveAll(newRoadmapItems);

        return getRoadmap(user, careerId);
    }

    public RoadmapResponse getRoadmap(User user, Long careerId) {
        Career career = careerRepository.findById(careerId).orElse(null);
        if (career == null) {
            return new RoadmapResponse(careerId, "Unknown Career", 0, new java.util.ArrayList<>());
        }

        List<RoadmapItem> items = roadmapItemRepository.findByUserIdAndCareerIdOrderByOrderIndexAsc(user.getId(), careerId);

        // Fetch user's enrollments to sync live completion status
        List<Enrollment> userEnrollments = enrollmentRepository.findByUserId(user.getId());
        Map<Long, Enrollment> enrollMap = new HashMap<>();
        for (Enrollment e : userEnrollments) {
            if (e.getCourse() != null) {
                enrollMap.put(e.getCourse().getId(), e);
            }
        }

        int completed = 0;
        boolean updatedAny = false;
        for (RoadmapItem item : items) {
            Long cId = item.getCourse().getId();
            Enrollment e = enrollMap.get(cId);
            if (e != null) {
                boolean isDone = (e.getCompleted() != null && e.getCompleted())
                        || (e.getProgressPercentage() != null && e.getProgressPercentage() >= 100);
                if (isDone && !"COMPLETED".equalsIgnoreCase(item.getStatus())) {
                    item.setStatus("COMPLETED");
                    item.setProgress(100);
                    updatedAny = true;
                } else if (!isDone && e.getProgressPercentage() != null && e.getProgressPercentage() > 0) {
                    item.setProgress(e.getProgressPercentage());
                    if (!"IN_PROGRESS".equalsIgnoreCase(item.getStatus())) {
                        item.setStatus("IN_PROGRESS");
                        updatedAny = true;
                    }
                }
            }

            if ("COMPLETED".equalsIgnoreCase(item.getStatus()) || (item.getProgress() != null && item.getProgress() >= 100)) {
                completed++;
            }
        }

        if (updatedAny) {
            roadmapItemRepository.saveAll(items);
        }

        int progress = items.isEmpty() ? 0 : (completed * 100) / items.size();

        long starterCount = items.stream()
                .filter(ri -> starterLanguageLabel(ri.getCourse()) != null)
                .count();

        List<RoadmapItemDto> dtos = items.stream().map(ri -> {
            List<String> skills = courseSkillRepository.findByCourseId(ri.getCourse().getId()).stream()
                    .map(cs -> cs.getSkill().getName())
                    .toList();
            String choiceLabel = starterLanguageLabel(ri.getCourse());
            String choiceGroup = (choiceLabel != null && starterCount >= 2) ? "starter-language" : null;

            String requirement = ri.getRequirement() == null ? "REQUIRED" : ri.getRequirement();
            return new RoadmapItemDto(
                    ri.getId(),
                    ri.getCourse().getId(),
                    ri.getCourse().getTitle(),
                    ri.getCourse().getDifficulty(),
                    ri.getCourse().getDurationHours(),
                    skills,
                    ri.getOrderIndex(),
                    ri.getStatus(),
                    ri.getProgress(),
                    ri.getReason(),
                    choiceGroup,
                    choiceLabel,
                    requirement
            );
        }).toList();

        Long nextCourseId = null;
        String nextCourseTitle = null;
        for (RoadmapItemDto dto : dtos) {
            boolean alreadyHave = "ALREADY_HAVE".equalsIgnoreCase(dto.requirement());
            if (!alreadyHave
                    && !"COMPLETED".equalsIgnoreCase(dto.status())
                    && !"LOCKED".equalsIgnoreCase(dto.status())) {
                nextCourseId = dto.courseId();
                nextCourseTitle = dto.courseTitle();
                break;
            }
        }

        return new RoadmapResponse(career.getId(), career.getName(), progress, dtos, nextCourseId, nextCourseTitle);
    }

    /**
     * One best course per career skill so the full path is visible.
     * Courses the learner already covers are kept and marked ALREADY_HAVE.
     */
    private List<Course> pickAllCareerCourses(
            List<CareerSkill> careerSkills,
            List<Course> allCourses,
            Map<Long, Integer> gaps,
            Map<Long, Integer> userSkillLevels,
            Map<Long, CareerSkill> requiredSkills,
            Set<Long> completedCourseIds,
            Map<Long, Boolean> requiredByCourse,
            Map<Long, String> courseReasons
    ) {
        List<Course> selected = new ArrayList<>();
        Set<Long> added = new HashSet<>();

        List<CareerSkill> orderedSkills = new ArrayList<>(careerSkills);
        orderedSkills.sort((a, b) -> Double.compare(
                b.getImportance() == null ? 0 : b.getImportance(),
                a.getImportance() == null ? 0 : a.getImportance()
        ));

        for (CareerSkill careerSkill : orderedSkills) {
            if (careerSkill.getSkill() == null) {
                continue;
            }
            Long skillId = careerSkill.getSkill().getId();
            Course best = bestCourseForSkill(skillId, allCourses, added);
            if (best == null || !added.add(best.getId())) {
                continue;
            }
            selected.add(best);
            boolean needed = courseIsRequired(best, gaps, userSkillLevels, requiredSkills, completedCourseIds);
            requiredByCourse.put(best.getId(), needed);
            String skillName = careerSkill.getSkill().getName();
            courseReasons.put(best.getId(), needed
                    ? "Required: close your gap in " + skillName + "."
                    : "Already covered: your " + skillName + " level meets this career.");
        }
        return selected;
    }

    private Course bestCourseForSkill(Long skillId, List<Course> allCourses, Set<Long> alreadyPicked) {
        Course best = null;
        double bestScore = -1;
        for (Course course : allCourses) {
            if (alreadyPicked.contains(course.getId()) || Boolean.FALSE.equals(course.getPublished())) {
                continue;
            }
            for (CourseSkill cs : courseSkillRepository.findByCourseId(course.getId())) {
                if (cs.getSkill() == null || !cs.getSkill().getId().equals(skillId)) {
                    continue;
                }
                double score = (cs.getTargetLevel() == null ? 1 : cs.getTargetLevel()) * 10
                        + (course.getRating() == null ? 0 : course.getRating())
                        + Math.log1p(course.getEnrollmentCount() == null ? 0 : course.getEnrollmentCount());
                if (score > bestScore) {
                    best = course;
                    bestScore = score;
                }
            }
        }
        return best;
    }

    private boolean courseIsRequired(
            Course course,
            Map<Long, Integer> gaps,
            Map<Long, Integer> userSkillLevels,
            Map<Long, CareerSkill> requiredSkills,
            Set<Long> completedCourseIds
    ) {
        if (completedCourseIds.contains(course.getId())) {
            return false;
        }
        for (CourseSkill cs : courseSkillRepository.findByCourseId(course.getId())) {
            if (cs.getSkill() == null) {
                continue;
            }
            Long skillId = cs.getSkill().getId();
            if (!requiredSkills.containsKey(skillId)) {
                continue;
            }
            int current = userSkillLevels.getOrDefault(skillId, 0);
            int required = requiredSkills.get(skillId).getRequiredLevel();
            if (current < required || gaps.containsKey(skillId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Helper to topologically sort courses according to prerequisite relationships.
     */
    private List<Course> sortCoursesByPrerequisites(List<Course> courses) {
        Map<Long, Course> courseMap = new HashMap<>();
        for (Course c : courses) {
            courseMap.put(c.getId(), c);
        }

        // Adjacency list: prereq -> dependent courses
        Map<Long, List<Long>> adj = new HashMap<>();
        Map<Long, Integer> inDegree = new HashMap<>();

        for (Course c : courses) {
            inDegree.put(c.getId(), 0);
            adj.put(c.getId(), new ArrayList<>());
        }

        for (Course c : courses) {
            List<CoursePrerequisite> prereqs = prerequisiteRepository.findByCourseId(c.getId());
            for (CoursePrerequisite prereq : prereqs) {
                Long parentId = prereq.getRequiredCourse().getId();
                if (courseMap.containsKey(parentId)) {
                    adj.get(parentId).add(c.getId());
                    inDegree.put(c.getId(), inDegree.get(c.getId()) + 1);
                }
            }
        }

        Queue<Long> queue = new LinkedList<>();
        for (Course c : courses) {
            if (inDegree.get(c.getId()) == 0) {
                queue.add(c.getId());
            }
        }

        List<Course> sorted = new ArrayList<>();
        while (!queue.isEmpty()) {
            Long currId = queue.poll();
            sorted.add(courseMap.get(currId));

            for (Long neighborId : adj.get(currId)) {
                inDegree.put(neighborId, inDegree.get(neighborId) - 1);
                if (inDegree.get(neighborId) == 0) {
                    queue.add(neighborId);
                }
            }
        }

        // Add any remaining (in case of cycles or errors, though Kahn's algorithm covers it)
        if (sorted.size() < courses.size()) {
            for (Course c : courses) {
                if (!sorted.contains(c)) {
                    sorted.add(c);
                }
            }
        }

        return sorted;
    }

    private Set<String> wantedStarterLabels(List<CareerSkill> careerSkills, String careerName) {
        Set<String> labels = new HashSet<>();
        for (CareerSkill cs : careerSkills) {
            if (cs.getSkill() == null) {
                continue;
            }
            String label = STARTER_LANGUAGE_LABELS.get(cs.getSkill().getName().toLowerCase());
            if (label != null) {
                labels.add(label);
            }
        }
        String name = careerName == null ? "" : careerName.toLowerCase();
        if (labels.contains("Java") || name.contains("full stack")) {
            labels.add("Java");
            labels.add("JavaScript");
        }
        return labels;
    }

    private String starterLanguageLabel(Course course) {
        if (course == null) {
            return null;
        }
        for (CourseSkill cs : courseSkillRepository.findByCourseId(course.getId())) {
            if (cs.getSkill() == null) {
                continue;
            }
            String label = STARTER_LANGUAGE_LABELS.get(cs.getSkill().getName().toLowerCase());
            if (label != null) {
                return label;
            }
        }
        return null;
    }

    /**
     * When two or more language-foundation courses exist, put them first so the
     * roadmap can start with a "pick a language" fork instead of a single track.
     */
    private List<Course> promoteStarterLanguageChoices(List<Course> orderedCourses) {
        List<Course> starters = new ArrayList<>();
        List<Course> rest = new ArrayList<>();
        for (Course course : orderedCourses) {
            if (starterLanguageLabel(course) != null) {
                starters.add(course);
            } else {
                rest.add(course);
            }
        }
        if (starters.size() < 2) {
            return orderedCourses;
        }
        List<Course> promoted = new ArrayList<>(starters.size() + rest.size());
        promoted.addAll(starters);
        promoted.addAll(rest);
        return promoted;
    }
}
