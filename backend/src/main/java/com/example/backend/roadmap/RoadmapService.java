package com.example.backend.roadmap;

import com.example.backend.career.*;
import com.example.backend.course.*;
import com.example.backend.enrollment.Enrollment;
import com.example.backend.enrollment.EnrollmentRepository;
import com.example.backend.roadmap.dto.RoadmapResponse;
import com.example.backend.roadmap.dto.RoadmapResponse.RoadmapItemDto;
import com.example.backend.skill.UserSkill;
import com.example.backend.skill.UserSkillRepository;
import com.example.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoadmapService {

    private final RoadmapItemRepository roadmapItemRepository;
    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;
    private final UserSkillRepository userSkillRepository;
    private final CourseRepository courseRepository;
    private final CourseSkillRepository courseSkillRepository;
    private final CoursePrerequisiteRepository prerequisiteRepository;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Generates a personalized roadmap for a user for a specific career goal.
     */
    @Transactional
    public RoadmapResponse generateRoadmap(User user, Long careerId) {
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

        for (Course course : allCourses) {
            if (completedCourseIds.contains(course.getId())) {
                continue; // Skip already completed
            }

            List<CourseSkill> courseSkills = courseSkillRepository.findByCourseId(course.getId());
            boolean addressesGap = false;
            double maxGapAddressed = 0;
            String gapSkillName = "";

            for (CourseSkill cs : courseSkills) {
                Long skillId = cs.getSkill().getId();
                if (gaps.containsKey(skillId)) {
                    int currentUserLevel = userSkillLevels.getOrDefault(skillId, 0);
                    if (cs.getTargetLevel() > currentUserLevel) {
                        addressesGap = true;
                        double gapSize = cs.getTargetLevel() - currentUserLevel;
                        if (gapSize > maxGapAddressed) {
                            maxGapAddressed = gapSize;
                            gapSkillName = cs.getSkill().getName();
                        }
                    }
                }
            }

            if (addressesGap) {
                candidateCourses.add(course);
                courseReasons.put(course.getId(), "Recommended to address your skill gap in " + gapSkillName + ".");
            }
        }

        // Fallback: If no candidate courses specifically match the skill gap, include all available courses
        if (candidateCourses.isEmpty()) {
            for (Course course : allCourses) {
                if (!completedCourseIds.contains(course.getId())) {
                    candidateCourses.add(course);
                    courseReasons.put(course.getId(), "Recommended course for " + career.getName() + " roadmap.");
                }
            }
        }

        // Step 5: Topological Sort based on prerequisites to get a logical order
        List<Course> orderedCourses = sortCoursesByPrerequisites(candidateCourses);

        // Step 6: Create or update RoadmapItems
        // Preserving completed items if any exist
        List<RoadmapItem> existingItems = roadmapItemRepository.findByUserIdAndCareerIdOrderByOrderIndexAsc(user.getId(), careerId);
        Map<Long, RoadmapItem> completedItems = new HashMap<>();
        for (RoadmapItem ri : existingItems) {
            if ("COMPLETED".equalsIgnoreCase(ri.getStatus())) {
                completedItems.put(ri.getCourse().getId(), ri);
            }
        }

        // Clear existing non-completed roadmap items
        roadmapItemRepository.deleteByUserIdAndCareerId(user.getId(), careerId);

        List<RoadmapItem> newRoadmapItems = new ArrayList<>();
        int orderIndex = 1;

        // Re-add completed ones first, then add future ones
        Set<Long> addedCourseIds = new HashSet<>();
        for (RoadmapItem completedItem : completedItems.values()) {
            RoadmapItem ri = RoadmapItem.builder()
                    .user(user)
                    .career(career)
                    .course(completedItem.getCourse())
                    .orderIndex(orderIndex++)
                    .status("COMPLETED")
                    .progress(100)
                    .reason(completedItem.getReason())
                    .build();
            newRoadmapItems.add(ri);
            addedCourseIds.add(ri.getCourse().getId());
        }

        for (Course course : orderedCourses) {
            if (addedCourseIds.contains(course.getId())) {
                continue;
            }

            // Determine locked status: locked if any prerequisite course is in the roadmap and not yet completed
            List<CoursePrerequisite> prerequisites = prerequisiteRepository.findByCourseId(course.getId());
            boolean isLocked = false;
            String lockedReason = null;

            for (CoursePrerequisite prereq : prerequisites) {
                Long prereqCourseId = prereq.getRequiredCourse().getId();
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

        List<RoadmapItemDto> dtos = items.stream().map(ri -> {
            List<String> skills = courseSkillRepository.findByCourseId(ri.getCourse().getId()).stream()
                    .map(cs -> cs.getSkill().getName())
                    .toList();

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
                    ri.getReason()
            );
        }).toList();

        return new RoadmapResponse(career.getId(), career.getName(), progress, dtos);
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
}
