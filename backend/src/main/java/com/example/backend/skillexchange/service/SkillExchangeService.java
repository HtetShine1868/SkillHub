package com.example.backend.skillexchange.service;

import com.example.backend.notification.service.NotificationService;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import com.example.backend.skillexchange.dto.*;
import com.example.backend.skillexchange.entity.*;
import com.example.backend.skillexchange.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillExchangeService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final ProjectCommentRepository projectCommentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(User currentUser, String category, String search, String level, String status, String sort) {
        // Find all projects that are not flagged or cancelled (or show them if the current user is the owner)
        List<Project> allProjects = projectRepository.findAll();
        List<Project> filtered = allProjects.stream()
                .filter(p -> {
                    // Normal users cannot see flagged or cancelled projects unless they own them
                    if ("Flagged".equalsIgnoreCase(p.getStatus()) || "Cancelled".equalsIgnoreCase(p.getStatus())) {
                        return p.getOwner().getId().equals(currentUser.getId());
                    }
                    return true;
                })
                .filter(p -> category == null || "All".equalsIgnoreCase(category) || category.isBlank() || p.getCategory().equalsIgnoreCase(category))
                .filter(p -> level == null || level.isBlank() || p.getLevel().equalsIgnoreCase(level))
                .filter(p -> {
                    if (status == null || status.isBlank()) return true;
                    // Map status request filters like 'Recruiting' or 'Almost Full'
                    return p.getStatus().equalsIgnoreCase(status);
                })
                .filter(p -> {
                    if (search == null || search.isBlank()) return true;
                    String q = search.toLowerCase();
                    return p.getTitle().toLowerCase().contains(q) ||
                            p.getDescription().toLowerCase().contains(q) ||
                            p.getSkills().stream().anyMatch(s -> s.toLowerCase().contains(q)) ||
                            p.getTags().stream().anyMatch(t -> t.toLowerCase().contains(q));
                })
                .collect(Collectors.toList());

        // Apply sorting
        if (sort != null) {
            switch (sort) {
                case "Most Popular":
                    filtered.sort((a, b) -> Integer.compare(b.getMembers().size(), a.getMembers().size()));
                    break;
                case "Most Needed":
                    filtered.sort((a, b) -> Integer.compare(b.getMaxMembers() - b.getMembers().size(), a.getMaxMembers() - a.getMembers().size()));
                    break;
                case "Almost Full":
                    filtered.sort((a, b) -> Double.compare(
                            (double) b.getMembers().size() / b.getMaxMembers(),
                            (double) a.getMembers().size() / a.getMaxMembers()
                    ));
                    break;
                case "Newest":
                default:
                    filtered.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
                    break;
            }
        }

        return filtered.stream()
                .map(p -> toProjectResponse(p, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(User currentUser, Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (("Flagged".equalsIgnoreCase(project.getStatus()) || "Cancelled".equalsIgnoreCase(project.getStatus()))
                && !project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied: This project is suspended.");
        }

        ProjectResponse resp = toProjectResponse(project, currentUser);

        List<ProjectComment> topComments = projectCommentRepository.findByProjectIdAndParentIsNullOrderByCreatedAtAsc(id);
        int discussionCount = topComments.size();
        for (ProjectComment comment : topComments) {
            discussionCount += comment.getReplies() != null ? comment.getReplies().size() : 0;
        }
        resp.setDiscussionCount(discussionCount);

        if (Boolean.TRUE.equals(resp.isCanDiscuss())) {
            resp.setDiscussion(topComments.stream()
                    .map(c -> toCommentResponse(c, project))
                    .collect(Collectors.toList()));
        } else {
            resp.setDiscussion(Collections.emptyList());
        }

        return resp;
    }

    @Transactional
    public ProjectResponse createProject(User owner, ProjectCreateRequest req) {
        LocalDate deadlineDate = null;
        if (req.getDeadline() != null && !req.getDeadline().isBlank()) {
            try {
                deadlineDate = LocalDate.parse(req.getDeadline());
            } catch (Exception e) {
                // Ignore
            }
        }

        List<ProjectRoleSlot> roles = buildRolesFromInput(req.getRoles());
        if (roles.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add at least one role opening for collaborators.");
        }

        Project project = Project.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .level(req.getLevel())
                .duration(req.getDuration())
                .commitment(req.getCommitment())
                .deadline(deadlineDate)
                .maxMembers(1 + totalRoleSlots(roles))
                .status("Recruiting")
                .owner(owner)
                .skills(req.getSkills() != null ? req.getSkills() : new ArrayList<>())
                .tags(req.getTags() != null ? req.getTags() : new ArrayList<>())
                .roles(roles)
                .build();

        List<ProjectGoal> goals = buildGoalsFromInput(req.getGoals(), true);
        if (goals.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add at least one project goal.");
        }
        project.setGoals(goals);

        Project saved = projectRepository.save(project);

        // Add owner as member
        ProjectMember member = ProjectMember.builder()
                .project(saved)
                .user(owner)
                .role("Owner")
                .build();
        projectMemberRepository.save(member);

        saved.getMembers().add(member);

        return toProjectResponse(saved, owner);
    }

    @Transactional(readOnly = true)
    public Map<String, List<ProjectResponse>> getMyProjects(User currentUser) {
        List<Project> ownedProjects = projectRepository.findAll().stream()
                .filter(p -> p.getOwner().getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        List<ProjectMember> joinedMemberships = projectMemberRepository.findByUserEmail(currentUser.getEmail());
        List<Project> joinedProjects = joinedMemberships.stream()
                .map(ProjectMember::getProject)
                .filter(p -> !p.getOwner().getId().equals(currentUser.getId()))
                .collect(Collectors.toList());

        Map<String, List<ProjectResponse>> result = new HashMap<>();
        result.put("owned", ownedProjects.stream().map(p -> toProjectResponse(p, currentUser)).collect(Collectors.toList()));
        result.put("joined", joinedProjects.stream().map(p -> toProjectResponse(p, currentUser)).collect(Collectors.toList()));
        return result;
    }

    @Transactional
    public JoinRequestResponse sendJoinRequest(User applicant, Long projectId, JoinRequestApplyRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (project.getOwner().getId().equals(applicant.getId())) {
            throw new RuntimeException("You cannot apply to join your own project.");
        }

        boolean alreadyMember = projectMemberRepository.existsByProjectIdAndUserEmail(projectId, applicant.getEmail());
        if (alreadyMember) {
            throw new RuntimeException("You are already a member of this project.");
        }

        if (project.getMembers().size() >= project.getMaxMembers()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This project is already full.");
        }

        String requestedRole = resolveRequestedRole(project, req.getRequestedRole());

        // Get applicant level (e.g. from overall score logic in AuthService or default to Intermediate)
        List<String> userSkills = req.getSkills() != null ? req.getSkills() : new ArrayList<>();

        JoinRequest request = JoinRequest.builder()
                .project(project)
                .applicant(applicant)
                .message(req.getMessage())
                .skills(userSkills)
                .requestedRole(requestedRole)
                .level("Intermediate") // Default
                .status("pending")
                .build();

        JoinRequest saved = joinRequestRepository.save(request);

        notificationService.notify(
                project.getOwner(),
                NotificationService.JOIN_REQUEST,
                "New join request",
                applicant.getName() + " wants to join " + project.getTitle(),
                "/skill-exchange/project/" + project.getId() + "/requests",
                project.getId()
        );

        return toJoinRequestResponse(saved, false);
    }

    @Transactional(readOnly = true)
    public List<JoinRequestResponse> getJoinRequests(User currentUser, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied: Only the project owner can view requests.");
        }

        List<JoinRequest> requests = joinRequestRepository.findByProjectIdAndStatus(projectId, "pending");
        return requests.stream()
                .map(r -> toJoinRequestResponse(r, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JoinRequestResponse> getMyPendingRequests(User currentUser) {
        List<JoinRequest> requests = joinRequestRepository.findByApplicantEmailAndStatus(currentUser.getEmail(), "pending");
        return requests.stream()
                .map(r -> toJoinRequestResponse(r, true))
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean approveJoinRequest(User currentUser, Long projectId, Long requestId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied: Only project owner can manage requests.");
        }

        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getStatus().equalsIgnoreCase("pending")) {
            throw new RuntimeException("Request is already processed.");
        }

        if (project.getMembers().size() >= project.getMaxMembers()) {
            throw new RuntimeException("Project is already full.");
        }

        String memberRole = request.getRequestedRole();
        if (hasRoleSlots(project)) {
            if (memberRole == null || memberRole.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This applicant did not pick a role.");
            }
            if (openSlotsForRole(project, memberRole) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, memberRole + " is already filled.");
            }
        } else if (memberRole == null || memberRole.isBlank()) {
            memberRole = "Member";
        }

        request.setStatus("approved");
        joinRequestRepository.save(request);

        // Add member
        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(request.getApplicant())
                .role(memberRole)
                .build();
        projectMemberRepository.save(member);

        project.getMembers().add(member);

        // Update status of project
        int size = project.getMembers().size();
        if (size >= project.getMaxMembers()) {
            project.setStatus("Full");
        } else if (size >= project.getMaxMembers() - 1) {
            project.setStatus("Almost Full");
        } else {
            project.setStatus("Recruiting");
        }
        projectRepository.save(project);

        notificationService.notify(
                request.getApplicant(),
                NotificationService.JOIN_APPROVED,
                "You joined a project",
                "You are now a member of " + project.getTitle(),
                "/skill-exchange/project/" + project.getId(),
                project.getId()
        );

        List<ProjectMember> team = projectMemberRepository.findByProjectIdWithUser(project.getId());
        for (ProjectMember teammate : team) {
            if (teammate.getUser().getId().equals(request.getApplicant().getId())) continue;
            notificationService.notify(
                    teammate.getUser(),
                    NotificationService.PROJECT_JOIN,
                    "New collaborator joined",
                    request.getApplicant().getName() + " joined " + project.getTitle(),
                    "/skill-exchange/project/" + project.getId(),
                    project.getId()
            );
        }

        return true;
    }

    @Transactional
    public boolean rejectJoinRequest(User currentUser, Long projectId, Long requestId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access Denied: Only project owner can manage requests.");
        }

        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getStatus().equalsIgnoreCase("pending")) {
            throw new RuntimeException("Request is already processed.");
        }

        request.setStatus("rejected");
        joinRequestRepository.save(request);

        return true;
    }

    @Transactional
    public CommentResponse addComment(User currentUser, Long projectId, String text, Long parentId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!isProjectParticipant(project, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only project members can join the discussion.");
        }

        if (text == null || text.isBlank()) {
            throw new RuntimeException("Message cannot be empty.");
        }

        ProjectComment comment = ProjectComment.builder()
                .project(project)
                .author(currentUser)
                .text(text.trim())
                .likes(0)
                .build();

        if (parentId != null) {
            ProjectComment parent = projectCommentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        ProjectComment saved = projectCommentRepository.save(comment);

        String preview = saved.getText().length() > 80
                ? saved.getText().substring(0, 80) + "…"
                : saved.getText();
        for (ProjectMember member : projectMemberRepository.findByProjectIdWithUser(projectId)) {
            if (member.getUser().getId().equals(currentUser.getId())) continue;
            notificationService.notify(
                    member.getUser(),
                    NotificationService.PROJECT_MESSAGE,
                    "New discussion message",
                    currentUser.getName() + " in " + project.getTitle() + ": " + preview,
                    "/skill-exchange/project/" + project.getId(),
                    project.getId()
            );
        }

        return toCommentResponse(saved, project);
    }

    @Transactional
    public boolean toggleCommentLike(User currentUser, Long projectId, Long commentId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!isProjectParticipant(project, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only project members can join the discussion.");
        }
        ProjectComment comment = projectCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setLikes(comment.getLikes() + 1);
        projectCommentRepository.save(comment);
        return true;
    }

    @Transactional
    public List<ProjectGoalResponse> updateGoals(User currentUser, Long projectId, GoalsUpdateRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the project owner can manage goals.");
        }
        List<ProjectGoal> goals = buildGoalsFromInput(req.getGoals(), false);
        if (goals.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A project needs at least one goal.");
        }
        if (project.getGoals() == null) {
            project.setGoals(new ArrayList<>());
        }
        project.getGoals().clear();
        project.getGoals().addAll(goals);
        projectRepository.save(project);
        return toGoalResponses(project.getGoals());
    }

    @Transactional
    public List<ProjectGoalResponse> toggleGoal(User currentUser, Long projectId, String goalId, GoalToggleRequest req) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!isProjectParticipant(project, currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only project members can update goals.");
        }
        ProjectGoal match = project.getGoals().stream()
                .filter(g -> goalId.equals(g.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        boolean next = req.getDone() != null ? req.getDone() : !match.isDone();
        match.setDone(next);
        projectRepository.save(project);
        return toGoalResponses(project.getGoals());
    }

    // ── Admin operations

    @Transactional(readOnly = true)
    public List<AdminProjectResponse> getAdminProjects() {
        return projectRepository.findAll().stream()
                .map(p -> {
                    long pendingReqs = joinRequestRepository.countByProjectIdAndStatus(p.getId(), "pending");

                    // Map status to Admin Dashboard values: OPEN, IN_PROGRESS, COMPLETED, FLAGGED, CANCELLED
                    String adminStatus = "OPEN";
                    if ("Flagged".equalsIgnoreCase(p.getStatus())) {
                        adminStatus = "FLAGGED";
                    } else if ("Cancelled".equalsIgnoreCase(p.getStatus())) {
                        adminStatus = "CANCELLED";
                    } else if ("Completed".equalsIgnoreCase(p.getStatus())) {
                        adminStatus = "COMPLETED";
                    } else if ("Full".equalsIgnoreCase(p.getStatus())) {
                        adminStatus = "IN_PROGRESS";
                    } else {
                        adminStatus = "OPEN"; // recruiting / almost full
                    }

                    return AdminProjectResponse.builder()
                            .id(p.getId())
                            .title(p.getTitle())
                            .ownerName(p.getOwner().getName())
                            .ownerEmail(p.getOwner().getEmail())
                            .skillsOffered(p.getSkills())
                            .requestCount((int) pendingReqs)
                            .status(adminStatus)
                            .createdAt(p.getCreatedAt().format(ISO_FORMATTER))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean approveProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setStatus("Recruiting");
        projectRepository.save(project);
        return true;
    }

    @Transactional
    public boolean flagProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setStatus("Flagged");
        projectRepository.save(project);
        return true;
    }

    @Transactional
    public boolean deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectRepository.delete(project);
        return true;
    }

    // ── DTO Mappings

    private ProjectResponse toProjectResponse(Project project, User currentUser) {
        UserDto ownerDto = toUserDto(project.getOwner());
        List<ProjectMemberResponse> membersList = project.getMembers().stream()
                .map(this::toProjectMemberResponse)
                .collect(Collectors.toList());

        List<ProjectGoalResponse> goalsList = toGoalResponses(project.getGoals());

        long pendingReqsCount = joinRequestRepository.countByProjectIdAndStatus(project.getId(), "pending");

        // Determine userStatus relative to currentUser
        String userStatus = null;
        if (project.getOwner().getId().equals(currentUser.getId())) {
            userStatus = "owner";
        } else {
            boolean isMember = project.getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
            if (isMember) {
                userStatus = "member";
            } else {
                boolean isPending = joinRequestRepository.findByApplicantEmailAndStatus(currentUser.getEmail(), "pending").stream()
                        .anyMatch(r -> r.getProject().getId().equals(project.getId()));
                if (isPending) {
                    userStatus = "pending";
                }
            }
        }

        boolean canDiscuss = "owner".equals(userStatus) || "member".equals(userStatus);

        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .category(project.getCategory())
                .skills(project.getSkills())
                .level(project.getLevel())
                .duration(project.getDuration())
                .commitment(project.getCommitment())
                .deadline(project.getDeadline() != null ? project.getDeadline().toString() : null)
                .maxMembers(project.getMaxMembers())
                .currentMembers(project.getMembers().size())
                .status(project.getStatus())
                .tags(project.getTags())
                .owner(ownerDto)
                .members(membersList)
                .goals(goalsList)
                .roles(toRoleResponses(project))
                .pendingRequests((int) pendingReqsCount)
                .userStatus(userStatus)
                .canDiscuss(canDiscuss)
                .discussionCount(0)
                .createdAt(project.getCreatedAt().format(ISO_FORMATTER))
                .build();
    }

    private UserDto toUserDto(User user) {
        String initials = "";
        if (user.getName() != null && !user.getName().isBlank()) {
            String[] parts = user.getName().trim().split("\\s+");
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(parts.length, 2); i++) {
                if (!parts[i].isEmpty()) {
                    sb.append(parts[i].substring(0, 1).toUpperCase());
                }
            }
            initials = sb.toString();
        }

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .initials(initials)
                .avatar(user.getProfileImage())
                .build();
    }

    private ProjectMemberResponse toProjectMemberResponse(ProjectMember m) {
        User u = m.getUser();
        String initials = "";
        if (u.getName() != null && !u.getName().isBlank()) {
            String[] parts = u.getName().trim().split("\\s+");
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < Math.min(parts.length, 2); i++) {
                if (!parts[i].isEmpty()) {
                    sb.append(parts[i].substring(0, 1).toUpperCase());
                }
            }
            initials = sb.toString();
        }

        return ProjectMemberResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .initials(initials)
                .role(m.getRole())
                .avatar(u.getProfileImage())
                .build();
    }

    private JoinRequestResponse toJoinRequestResponse(JoinRequest r, boolean includeProject) {
        JoinRequestResponse resp = JoinRequestResponse.builder()
                .id(r.getId())
                .projectId(r.getProject().getId())
                .applicant(toUserDto(r.getApplicant()))
                .skills(r.getSkills())
                .level(r.getLevel())
                .message(r.getMessage())
                .requestedRole(r.getRequestedRole())
                .date(r.getCreatedAt().format(ISO_FORMATTER))
                .status(r.getStatus())
                .build();

        if (includeProject) {
            resp.setProject(toProjectResponse(r.getProject(), r.getApplicant()));
        }

        return resp;
    }

    private CommentResponse toCommentResponse(ProjectComment c, Project project) {
        List<CommentResponse> replyDtos = c.getReplies().stream()
                .map(reply -> toCommentResponse(reply, project))
                .collect(Collectors.toList());

        return CommentResponse.builder()
                .id(c.getId())
                .author(toUserDto(c.getAuthor()))
                .authorRole(resolveAuthorRole(project, c.getAuthor()))
                .text(c.getText())
                .timestamp(c.getCreatedAt().format(ISO_FORMATTER))
                .likes(c.getLikes())
                .replies(replyDtos)
                .build();
    }

    private String resolveAuthorRole(Project project, User author) {
        if (author == null) return "Member";
        if (project.getOwner() != null && project.getOwner().getId().equals(author.getId())) {
            return "Owner";
        }
        return project.getMembers().stream()
                .filter(m -> m.getUser() != null && m.getUser().getId().equals(author.getId()))
                .map(ProjectMember::getRole)
                .findFirst()
                .orElse("Member");
    }

    private boolean isProjectParticipant(Project project, User user) {
        if (project.getOwner().getId().equals(user.getId())) return true;
        return projectMemberRepository.existsByProjectIdAndUserEmail(project.getId(), user.getEmail());
    }

    private List<ProjectGoal> buildGoalsFromInput(List<ProjectGoalInput> inputs, boolean requireText) {
        List<ProjectGoal> goals = new ArrayList<>();
        if (inputs == null) return goals;
        int index = 1;
        for (ProjectGoalInput input : inputs) {
            if (input == null || input.getText() == null || input.getText().isBlank()) {
                if (requireText) continue;
                continue;
            }
            String id = (input.getId() != null && !input.getId().isBlank())
                    ? input.getId()
                    : "g" + index + "-" + UUID.randomUUID().toString().substring(0, 8);
            goals.add(new ProjectGoal(id, input.getText().trim(), input.isDone()));
            index++;
        }
        return goals;
    }

    private List<ProjectGoalResponse> toGoalResponses(List<ProjectGoal> goals) {
        if (goals == null) return new ArrayList<>();
        return goals.stream()
                .map(g -> ProjectGoalResponse.builder()
                        .id(g.getId())
                        .text(g.getText())
                        .done(g.isDone())
                        .build())
                .collect(Collectors.toList());
    }

    private List<ProjectRoleSlot> buildRolesFromInput(List<ProjectRoleInput> inputs) {
        List<ProjectRoleSlot> roles = new ArrayList<>();
        if (inputs == null) return roles;
        Set<String> seen = new HashSet<>();
        for (ProjectRoleInput input : inputs) {
            if (input == null || input.getName() == null || input.getName().isBlank()) continue;
            String name = input.getName().trim();
            if ("Owner".equalsIgnoreCase(name) || "Member".equalsIgnoreCase(name)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a specific role such as Frontend or Designer.");
            }
            if (name.length() > 50) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role names must be 50 characters or less.");
            }
            if (!seen.add(name.toLowerCase())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each role can only be listed once.");
            }
            int slots = input.getSlots() != null ? input.getSlots() : 1;
            if (slots < 1 || slots > 8) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each role needs between 1 and 8 openings.");
            }
            roles.add(new ProjectRoleSlot(name, slots));
        }
        int total = totalRoleSlots(roles);
        if (total > 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Teams can have at most 12 people including you.");
        }
        return roles;
    }

    private List<ProjectRoleResponse> toRoleResponses(Project project) {
        if (!hasRoleSlots(project)) return new ArrayList<>();
        return project.getRoles().stream()
                .map(slot -> {
                    int filled = filledCountForRole(project, slot.getName());
                    int open = Math.max(0, slot.getSlots() - filled);
                    return ProjectRoleResponse.builder()
                            .name(slot.getName())
                            .slots(slot.getSlots())
                            .filled(Math.min(filled, slot.getSlots()))
                            .open(open)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String resolveRequestedRole(Project project, String requestedRole) {
        if (!hasRoleSlots(project)) {
            return (requestedRole != null && !requestedRole.isBlank()) ? requestedRole.trim() : "Member";
        }
        if (requestedRole == null || requestedRole.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pick a role to apply for.");
        }
        String chosen = requestedRole.trim();
        ProjectRoleSlot match = project.getRoles().stream()
                .filter(slot -> slot.getName().equalsIgnoreCase(chosen))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "That role is not listed on this project."));
        if (openSlotsForRole(project, match.getName()) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, match.getName() + " is already filled.");
        }
        return match.getName();
    }

    private boolean hasRoleSlots(Project project) {
        return project.getRoles() != null && !project.getRoles().isEmpty();
    }

    private int totalRoleSlots(List<ProjectRoleSlot> roles) {
        if (roles == null) return 0;
        return roles.stream().mapToInt(ProjectRoleSlot::getSlots).sum();
    }

    private int filledCountForRole(Project project, String roleName) {
        if (project.getMembers() == null || roleName == null) return 0;
        return (int) project.getMembers().stream()
                .filter(m -> m.getRole() != null && m.getRole().equalsIgnoreCase(roleName))
                .count();
    }

    private int openSlotsForRole(Project project, String roleName) {
        if (!hasRoleSlots(project) || roleName == null) return 0;
        return project.getRoles().stream()
                .filter(slot -> slot.getName().equalsIgnoreCase(roleName))
                .findFirst()
                .map(slot -> Math.max(0, slot.getSlots() - filledCountForRole(project, slot.getName())))
                .orElse(0);
    }
}
