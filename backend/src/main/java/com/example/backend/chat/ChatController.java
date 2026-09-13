package com.example.backend.chat;

import com.example.backend.course.Course;
import com.example.backend.course.CourseRepository;
import com.example.backend.enrollment.Enrollment;
import com.example.backend.enrollment.EnrollmentRepository;
import com.example.backend.notification.service.NotificationService;
import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatRepo;
    private final UserRepository userRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final CourseRepository courseRepo;
    private final NotificationService notificationService;

    /** List all conversation summaries (last message per partner) */
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(
            @AuthenticationPrincipal UserDetails principal) {

        User me = getUser(principal);
        if (me == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<ChatMessage> all = chatRepo.findAllByUserId(me.getId());

        Map<Long, ChatMessage> latestByPartner = new LinkedHashMap<>();
        for (ChatMessage msg : all) {
            if (msg.getSender() == null || msg.getReceiver() == null) continue;
            Long partnerId = msg.getSender().getId().equals(me.getId())
                    ? msg.getReceiver().getId()
                    : msg.getSender().getId();
            latestByPartner.putIfAbsent(partnerId, msg);
        }

        Set<Long> courseIds = latestByPartner.values().stream()
                .map(ChatMessage::getCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, String> courseTitles = courseIds.isEmpty()
                ? Map.of()
                : courseRepo.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle, (a, b) -> a));

        List<Map<String, Object>> result = latestByPartner.entrySet().stream().map(e -> {
            ChatMessage last = e.getValue();
            User partner = last.getSender().getId().equals(me.getId())
                    ? last.getReceiver()
                    : last.getSender();
            if (partner == null) return null;
            Map<String, Object> conv = new HashMap<>();
            conv.put("partnerId", partner.getId());
            conv.put("partnerName", partner.getName());
            conv.put("partnerEmail", partner.getEmail());
            conv.put("partnerAvatar", partner.getProfileImage());
            conv.put("partnerRole", partner.getRole() != null ? partner.getRole().name() : "STUDENT");
            conv.put("lastMessage", last.getContent());
            conv.put("lastSentAt", last.getSentAt());
            conv.put("lastSenderId", last.getSender() != null ? last.getSender().getId() : null);
            conv.put("mode", last.getMode() != null ? last.getMode() : "GENERAL");
            conv.put("courseId", last.getCourseId());
            if (last.getCourseId() != null) {
                conv.put("courseTitle", courseTitles.get(last.getCourseId()));
            }
            return conv;
        }).filter(Objects::nonNull).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /** List enrolled students and recent conversations for an instructor */
    @GetMapping("/instructor/students")
    public ResponseEntity<List<Map<String, Object>>> getInstructorStudents(
            @AuthenticationPrincipal UserDetails principal) {

        User me = getUser(principal);
        if (me == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Course> instructorCourses = courseRepo.findByInstructorId(me.getId());
        List<Long> courseIds = instructorCourses.stream().map(Course::getId).collect(Collectors.toList());

        List<Enrollment> enrollments;
        if (!courseIds.isEmpty()) {
            enrollments = enrollmentRepo.findByCourseIdIn(courseIds);
        } else {
            enrollments = enrollmentRepo.findAll();
        }

        Map<Long, Map<String, Object>> studentMap = new LinkedHashMap<>();

        for (Enrollment e : enrollments) {
            User student = e.getUser();
            if (student == null || student.getId().equals(me.getId())) continue;

            studentMap.computeIfAbsent(student.getId(), k -> {
                Map<String, Object> s = new HashMap<>();
                s.put("id", student.getId());
                s.put("name", student.getName());
                s.put("email", student.getEmail());
                s.put("avatar", student.getProfileImage());
                s.put("role", student.getRole() != null ? student.getRole().name() : "STUDENT");
                s.put("courses", new ArrayList<Map<String, Object>>());
                return s;
            });

            if (e.getCourse() != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> clist = (List<Map<String, Object>>) studentMap.get(student.getId()).get("courses");
                Map<String, Object> cInfo = new HashMap<>();
                cInfo.put("id", e.getCourse().getId());
                cInfo.put("title", e.getCourse().getTitle());
                cInfo.put("progress", e.getProgressPercentage() != null ? e.getProgressPercentage() : 0);
                cInfo.put("completed", Boolean.TRUE.equals(e.getCompleted()));
                clist.add(cInfo);
            }
        }

        // Also check if any other students messaged the instructor even without enrollment
        List<ChatMessage> allMessages = chatRepo.findAllByUserId(me.getId());
        for (ChatMessage msg : allMessages) {
            if (msg.getSender() == null || msg.getReceiver() == null) continue;
            Long partnerId = msg.getSender().getId().equals(me.getId())
                    ? msg.getReceiver().getId()
                    : msg.getSender().getId();

            if (!studentMap.containsKey(partnerId)) {
                User partner = msg.getSender().getId().equals(me.getId()) ? msg.getReceiver() : msg.getSender();
                if (partner == null) continue;
                Map<String, Object> s = new HashMap<>();
                s.put("id", partner.getId());
                s.put("name", partner.getName());
                s.put("email", partner.getEmail());
                s.put("avatar", partner.getProfileImage());
                s.put("role", partner.getRole() != null ? partner.getRole().name() : "STUDENT");
                s.put("courses", new ArrayList<Map<String, Object>>());
                studentMap.put(partner.getId(), s);
            }
        }

        // Attach latest message info to each student
        for (Map.Entry<Long, Map<String, Object>> entry : studentMap.entrySet()) {
            Long studentId = entry.getKey();
            Map<String, Object> data = entry.getValue();

            Optional<ChatMessage> latest = allMessages.stream()
                    .filter(m -> (m.getSender() != null && m.getSender().getId().equals(studentId)) ||
                                 (m.getReceiver() != null && m.getReceiver().getId().equals(studentId)))
                    .max(Comparator.comparing(ChatMessage::getSentAt));

            if (latest.isPresent()) {
                ChatMessage m = latest.get();
                data.put("lastMessage", m.getContent());
                data.put("lastSentAt", m.getSentAt());
                data.put("lastSenderId", m.getSender() != null ? m.getSender().getId() : null);
                data.put("mode", m.getMode());
                data.put("courseId", m.getCourseId());
            }
        }

        return ResponseEntity.ok(new ArrayList<>(studentMap.values()));
    }

    /** All learners and instructors the admin can message, plus last-thread info. */
    @GetMapping("/admin/contacts")
    public ResponseEntity<?> getAdminContacts(@AuthenticationPrincipal UserDetails principal) {
        User me = getUser(principal);
        if (me == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        if (me.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        }

        List<ChatMessage> allMessages = chatRepo.findAllByUserId(me.getId());
        List<Map<String, Object>> contacts = new ArrayList<>();

        for (User person : userRepo.findAll()) {
            if (person == null || person.getId().equals(me.getId())) continue;
            if (person.getRole() == Role.ADMIN) continue;

            Map<String, Object> row = new HashMap<>();
            row.put("id", person.getId());
            row.put("name", person.getName());
            row.put("email", person.getEmail());
            row.put("avatar", person.getProfileImage());
            row.put("role", person.getRole() != null ? person.getRole().name() : "USER");
            row.put("courses", new ArrayList<Map<String, Object>>());

            allMessages.stream()
                    .filter(m -> m.getSender() != null && m.getReceiver() != null)
                    .filter(m -> m.getSender().getId().equals(person.getId())
                            || m.getReceiver().getId().equals(person.getId()))
                    .max(Comparator.comparing(ChatMessage::getSentAt))
                    .ifPresent(m -> {
                        row.put("lastMessage", m.getContent());
                        row.put("lastSentAt", m.getSentAt());
                        row.put("lastSenderId", m.getSender() != null ? m.getSender().getId() : null);
                        row.put("mode", m.getMode());
                        row.put("courseId", m.getCourseId());
                    });

            contacts.add(row);
        }

        contacts.sort((a, b) -> {
            Object aTime = a.get("lastSentAt");
            Object bTime = b.get("lastSentAt");
            if (aTime == null && bTime == null) {
                return String.valueOf(a.get("name")).compareToIgnoreCase(String.valueOf(b.get("name")));
            }
            if (aTime == null) return 1;
            if (bTime == null) return -1;
            return String.valueOf(bTime).compareTo(String.valueOf(aTime));
        });

        return ResponseEntity.ok(contacts);
    }

    /** Load thread messages between current user and a specific partner */
    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam Long otherUserId,
            @RequestParam(defaultValue = "GENERAL") String mode,
            @RequestParam(required = false) Long courseId) {

        User me = getUser(principal);
        if (me == null || otherUserId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<ChatMessage> messages;

        if ("COURSE".equalsIgnoreCase(mode)) {
            messages = chatRepo.findCourseThread(courseId, me.getId(), otherUserId);
        } else {
            messages = chatRepo.findGeneralThread(me.getId(), otherUserId);
        }

        return ResponseEntity.ok(messages.stream().map(ChatMessageDto::from).collect(Collectors.toList()));
    }

    /** Send a message via REST */
    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody SendMessageRequest req) {

        User me = getUser(principal);
        if (me == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        if (req.receiverId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Receiver ID is required"));
        }

        User receiver = userRepo.findById(req.receiverId()).orElse(null);
        if (receiver == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Receiver not found"));
        }

        String mode = req.mode() != null ? req.mode().toUpperCase() : "GENERAL";
        Long courseId = req.courseId();

        // Enforce enrollment restriction for learners sending course questions
        if ("COURSE".equals(mode) && courseId != null && me.getRole() != Role.INSTRUCTOR && me.getRole() != Role.ADMIN) {
            boolean isEnrolled = enrollmentRepo.existsByUserIdAndCourseId(me.getId(), courseId);
            if (!isEnrolled) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Only enrolled learners can send course questions to the course instructor. Please enroll in this course to ask questions.",
                        "enrolled", false
                ));
            }
        }

        ChatMessage msg = ChatMessage.builder()
                .mode(mode)
                .courseId(courseId)
                .sender(me)
                .receiver(receiver)
                .content(req.content() != null ? req.content().trim() : "")
                .build();

        ChatMessage saved = chatRepo.save(msg);

        boolean instructorReply = me.getRole() == Role.INSTRUCTOR || me.getRole() == Role.ADMIN;
        String preview = saved.getContent() != null && saved.getContent().length() > 80
                ? saved.getContent().substring(0, 80) + "…"
                : saved.getContent();
        String link;
        if (instructorReply) {
            link = "/chat";
        } else if (receiver.getRole() == Role.ADMIN) {
            link = "/admin/messages";
        } else {
            link = "/instructor/dashboard?tab=messages";
        }
        notificationService.notify(
                receiver,
                instructorReply ? NotificationService.INSTRUCTOR_REPLY : NotificationService.CHAT_MESSAGE,
                instructorReply
                        ? (me.getRole() == Role.ADMIN ? "Support replied" : "Instructor replied")
                        : "New message",
                me.getName() + ": " + (preview != null ? preview : ""),
                link,
                null
        );

        return ResponseEntity.ok(ChatMessageDto.from(saved));
    }

    /** Get instructor for a specific course */
    @GetMapping("/course/{courseId}/instructor")
    public ResponseEntity<?> getCourseInstructor(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long courseId) {

        Course course = courseRepo.findById(courseId).orElse(null);
        User instructor = null;

        if (course != null && course.getInstructorId() != null) {
            instructor = userRepo.findById(course.getInstructorId()).orElse(null);
        }

        if (instructor == null) {
            instructor = userRepo.findFirstByRoleIn(List.of(Role.INSTRUCTOR, Role.ADMIN)).orElse(null);
        }

        if (instructor == null) {
            return ResponseEntity.ok(Map.of(
                    "id", 1L,
                    "name", "Lead Course Instructor",
                    "role", "INSTRUCTOR",
                    "avatar", null
            ));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", instructor.getId());
        resp.put("name", instructor.getName());
        resp.put("role", instructor.getRole() != null ? instructor.getRole().name() : "INSTRUCTOR");
        resp.put("avatar", instructor.getProfileImage());
        resp.put("courseId", courseId);
        resp.put("courseTitle", course != null ? course.getTitle() : "Course");

        return ResponseEntity.ok(resp);
    }

    /** Get all instructors the current user is enrolled with */
    @GetMapping("/available-instructors")
    public ResponseEntity<List<Map<String, Object>>> getAvailableInstructors(
            @AuthenticationPrincipal UserDetails principal) {

        User me = getUser(principal);
        if (me == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Enrollment> enrollments = enrollmentRepo.findByUserId(me.getId());

        // Map instructorId -> courses
        Map<Long, List<Course>> instructorCourses = new HashMap<>();
        for (Enrollment e : enrollments) {
            Course c = e.getCourse();
            if (c != null && c.getInstructorId() != null) {
                instructorCourses.computeIfAbsent(c.getInstructorId(), k -> new ArrayList<>()).add(c);
            }
        }

        // Fallback: show instructors/admins without scanning every user
        if (instructorCourses.isEmpty()) {
            List<User> instructors = userRepo.findByRoleIn(List.of(Role.INSTRUCTOR, Role.ADMIN)).stream()
                    .filter(u -> !u.getId().equals(me.getId()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(instructors.stream().map(inst -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", inst.getId());
                m.put("name", inst.getName());
                m.put("avatar", inst.getProfileImage());
                m.put("role", inst.getRole() != null ? inst.getRole().name() : "INSTRUCTOR");
                m.put("courses", enrollments.stream().filter(e -> e.getCourse() != null).map(e -> {
                    Map<String, Object> c = new HashMap<>();
                    c.put("id", e.getCourse().getId());
                    c.put("title", e.getCourse().getTitle());
                    return c;
                }).collect(Collectors.toList()));
                return m;
            }).collect(Collectors.toList()));
        }

        Map<Long, User> instructors = userRepo.findAllById(instructorCourses.keySet()).stream()
                .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, List<Course>> entry : instructorCourses.entrySet()) {
            User inst = instructors.get(entry.getKey());
            if (inst == null) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("id", inst.getId());
            m.put("name", inst.getName());
            m.put("avatar", inst.getProfileImage());
            m.put("role", inst.getRole() != null ? inst.getRole().name() : "INSTRUCTOR");
            m.put("courses", entry.getValue().stream().map(c -> {
                Map<String, Object> cmap = new HashMap<>();
                cmap.put("id", c.getId());
                cmap.put("title", c.getTitle());
                return cmap;
            }).collect(Collectors.toList()));
            result.add(m);
        }

        // Always offer platform admins as support contacts
        List<User> admins = userRepo.findByRoleIn(List.of(Role.ADMIN)).stream()
                .filter(u -> !u.getId().equals(me.getId()))
                .collect(Collectors.toList());
        Set<Long> alreadyListed = result.stream()
                .map(m -> (Long) m.get("id"))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        for (User admin : admins) {
            if (alreadyListed.contains(admin.getId())) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("id", admin.getId());
            m.put("name", admin.getName());
            m.put("avatar", admin.getProfileImage());
            m.put("role", "ADMIN");
            m.put("courses", Collections.emptyList());
            result.add(m);
        }

        return ResponseEntity.ok(result);
    }

    private User getUser(UserDetails principal) {
        if (principal == null || principal.getUsername() == null) {
            return null;
        }
        return userRepo.findByEmail(principal.getUsername()).orElse(null);
    }

    public record SendMessageRequest(Long receiverId, String content, String mode, Long courseId) {}
}
