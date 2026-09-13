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

        // Step 4: Find courses that can address those gaps
        List<Course> allCourses = courseRepository.findAll();
        List<Course> candidateCourses = new ArrayList<>();
        Map<Long, String> courseReasons = new HashMap<>();

        // Fetch completed enrollments to skip completed courses
        List<Enrollment> completedEnrollments = enrollmentRepository.findByUserId(user.getId()).stream()
                .filter(e -> e.getCompleted() != null && e.getCompleted())
                .toList();
        Set<Long> completedCourseIds = new HashSet<>();
        for (Enrollment e : completedEnrollments) {
            completedCourseIds.add(e.getCourse().getId());
        }

        Set<Long> coveredSkills = new HashSet<>();
        for (Long completedId : completedCourseIds) {
            for (CourseSkill cs : courseSkillRepository.findByCourseId(completedId)) {
                if (cs.getSkill() != null) {
                    coveredSkills.add(cs.getSkill().getId());
                }
            }
        }

        Set<Long> remainingGaps = new HashSet<>(gaps.keySet());
        remainingGaps.removeAll(coveredSkills);

        pickUniqueCoursesForGaps(
                allCourses,
                completedCourseIds,
                remainingGaps,
                userSkillLevels,
                candidateCourses,
                courseReasons
        );

        // One optional starter-language course only if that language is still a gap
        Set<String> wantedLanguages = wantedStarterLabels(careerSkills, career.getName());
        Set<Long> candidateIds = new HashSet<>();
        for (Course c : candidateCourses) {
            candidateIds.add(c.getId());
        }
        for (Course course : allCourses) {
            if (completedCourseIds.contains(course.getId()) || candidateIds.contains(course.getId())) {
                continue;
            }
            String lang = starterLanguageLabel(course);
            if (lang == null || !wantedLanguages.contains(lang)) {
                continue;
            }
            boolean coversNewGap = courseSkillRepository.findByCourseId(course.getId()).stream()
                    .anyMatch(cs -> cs.getSkill() != null && remainingGaps.contains(cs.getSkill().getId()));
            if (coversNewGap) {
                candidateCourses.add(course);
                candidateIds.add(course.getId());
                courseReasons.put(course.getId(), "Starting language for " + career.getName() + ": " + lang + ".");
                courseSkillRepository.findByCourseId(course.getId()).forEach(cs -> {
                    if (cs.getSkill() != null) {
                        remainingGaps.remove(cs.getSkill().getId());
                    }
                });
            }
        }

        // Step 5: Topological Sort based on prerequisites to get a logical order
        List<Course> orderedCourses = sortCoursesByPrerequisites(candidateCourses);
        orderedCourses = promoteStarterLanguageChoices(orderedCourses);

        Map<Long, RoadmapItem> completedItems = new HashMap<>();
        for (Enrollment e : completedEnrollments) {
            if (e.getCourse() != null) {
                completedItems.put(e.getCourse().getId(), null);
            }
        }

        roadmapItemRepository.deleteByUserIdAndCareerId(user.getId(), careerId);

        List<RoadmapItem> newRoadmapItems = new ArrayList<>();
        int orderIndex = 1;
        Set<Long> addedCourseIds = new HashSet<>();

        for (Course course : orderedCourses) {
            if (addedCourseIds.contains(course.getId()) || completedCourseIds.contains(course.getId())) {
                continue;
            }

            // Determine locked status: locked if any prerequisite course is in the roadmap and not yet completed
            List<CoursePrerequisite> prerequisites = prerequisiteRepository.findByCourseId(course.getId());
            boolean isLocked = false;
            String lockedReason = null;

            for (CoursePrerequisite prereq : prerequisites) {
                Long prereqCourseId = prereq.getRequiredCourse().getId();
                // Language starters are alternatives, not gates for each other
                if (starterLanguageLabel(course) != null && starterLanguageLabel(prereq.getRequiredCourse()) != null) {
                    continue;
                }
                // If the prerequisite is part of our roadmap
                boolean isInRoadmap = orderedCourses.stream().anyMatch(c -> c.getId().equals(prereqCourseId)) 
                        || completedItems.containsKey(prereqCourseId);
                
                // And it's not completed
                boolean isCompleted = completedItems.containsKey(prereqCourseId);
                if (isInRoadmap && !isCompleted) {
                    isLocked = true;
                    lockedReason = "Locked: Complete " + prereq.getRequiredCourse().getTitle() + " first.";
                    break;
                }
            }

            String status = isLocked ? "LOCKED" : "AVAILABLE";
            String reason = isLocked ? lockedReason : courseReasons.get(course.getId());

            // Check if user has an active enrollment to mark as IN_PROGRESS
            if (!isLocked) {
                Optional<Enrollment> enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(), course.getId());
                if (enrollment.isPresent() && (enrollment.get().getCompleted() == null || !enrollment.get().getCompleted())) {
                    status = "IN_PROGRESS";
                }
            }

            RoadmapItem ri = RoadmapItem.builder()
                    .user(user)
                    .career(career)
                    .course(course)
                    .orderIndex(orderIndex++)
                    .status(status)
                    .progress(0)
                    .reason(reason)
                    .build();

            newRoadmapItems.add(ri);
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
                    choiceLabel
            );
        }).toList();

        Long nextCourseId = null;
        String nextCourseTitle = null;
        for (RoadmapItemDto dto : dtos) {
            if (!"COMPLETED".equalsIgnoreCase(dto.status())
                    && !"LOCKED".equalsIgnoreCase(dto.status())) {
                nextCourseId = dto.courseId();
                nextCourseTitle = dto.courseTitle();
                break;
            }
        }

        return new RoadmapResponse(career.getId(), career.getName(), progress, dtos, nextCourseId, nextCourseTitle);
    }

    /**
     * One course per remaining skill gap. Prefers a course that closes more
     * leftover skills so React/Docker never appear twice.
     */
    private void pickUniqueCoursesForGaps(
            List<Course> allCourses,
            Set<Long> completedCourseIds,
            Set<Long> remainingGaps,
            Map<Long, Integer> userSkillLevels,
            List<Course> candidateCourses,
            Map<Long, String> courseReasons
    ) {
        while (!remainingGaps.isEmpty()) {
            Course best = null;
            int bestCover = 0;
            double bestScore = -1;
            String bestSkillName = "";
            Set<Long> bestSkillIds = Set.of();

            for (Course course : allCourses) {
                if (completedCourseIds.contains(course.getId())
                        || candidateCourses.stream().anyMatch(c -> c.getId().equals(course.getId()))) {
                    continue;
                }
                Set<Long> covers = new HashSet<>();
                String skillName = "";
                for (CourseSkill cs : courseSkillRepository.findByCourseId(course.getId())) {
                    if (cs.getSkill() == null) {
                        continue;
                    }
                    Long skillId = cs.getSkill().getId();
                    int current = userSkillLevels.getOrDefault(skillId, 0);
                    if (remainingGaps.contains(skillId) && cs.getTargetLevel() > current) {
                        covers.add(skillId);
                        if (skillName.isBlank()) {
                            skillName = cs.getSkill().getName();
                        }
                    }
                }
                if (covers.isEmpty()) {
                    continue;
                }
                double score = covers.size() * 10
                        + (course.getRating() == null ? 0 : course.getRating())
                        + Math.log1p(course.getEnrollmentCount() == null ? 0 : course.getEnrollmentCount());
                if (covers.size() > bestCover || (covers.size() == bestCover && score > bestScore)) {
                    best = course;
                    bestCover = covers.size();
                    bestScore = score;
                    bestSkillName = skillName;
                    bestSkillIds = covers;
                }
            }

            if (best == null) {
                break;
            }
            candidateCourses.add(best);
            courseReasons.put(best.getId(), "Recommended to close your gap in " + bestSkillName + ".");
            remainingGaps.removeAll(bestSkillIds);
        }
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
