package com.example.backend.skillexchange.service;

import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import com.example.backend.skillexchange.dto.*;
import com.example.backend.skillexchange.entity.*;
import com.example.backend.skillexchange.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // Load comments tree
        List<ProjectComment> topComments = projectCommentRepository.findByProjectIdAndParentIsNullOrderByCreatedAtAsc(id);
        resp.setDiscussion(topComments.stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList()));

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

        Project project = Project.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .level(req.getLevel())
                .duration(req.getDuration())
                .commitment(req.getCommitment())
                .deadline(deadlineDate)
                .maxMembers(req.getMaxMembers())
                .status("Recruiting")
                .owner(owner)
                .skills(req.getSkills() != null ? req.getSkills() : new ArrayList<>())
                .tags(req.getTags() != null ? req.getTags() : new ArrayList<>())
                .build();

        // Default goals
        project.setGoals(Arrays.asList(
                new ProjectGoal("g1", "Define project requirements", true),
                new ProjectGoal("g2", "Design UI/UX mockups", true),
                new ProjectGoal("g3", "Implement backend API", false),
                new ProjectGoal("g4", "Integrate frontend with backend", false),
                new ProjectGoal("g5", "Testing & QA", false),
                new ProjectGoal("g6", "Deployment", false)
        ));

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

        // Get applicant level (e.g. from overall score logic in AuthService or default to Intermediate)
        List<String> userSkills = req.getSkills() != null ? req.getSkills() : new ArrayList<>();

        JoinRequest request = JoinRequest.builder()
                .project(project)
                .applicant(applicant)
                .message(req.getMessage())
                .skills(userSkills)
                .level("Intermediate") // Default
                .status("pending")
                .build();

        JoinRequest saved = joinRequestRepository.save(request);

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

        request.setStatus("approved");
        joinRequestRepository.save(request);

        // Add member
        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(request.getApplicant())
                .role("Member")
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

        ProjectComment comment = ProjectComment.builder()
                .project(project)
                .author(currentUser)
                .text(text)
                .likes(0)
                .build();

        if (parentId != null) {
            ProjectComment parent = projectCommentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        ProjectComment saved = projectCommentRepository.save(comment);
        return toCommentResponse(saved);
    }

    @Transactional
    public boolean toggleCommentLike(User currentUser, Long projectId, Long commentId) {
        ProjectComment comment = projectCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setLikes(comment.getLikes() + 1);
        projectCommentRepository.save(comment);
        return true;
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

        List<ProjectGoalResponse> goalsList = project.getGoals().stream()
                .map(g -> ProjectGoalResponse.builder()
                        .id(g.getId())
                        .text(g.getText())
                        .done(g.isDone())
                        .build())
                .collect(Collectors.toList());

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
                .pendingRequests((int) pendingReqsCount)
                .userStatus(userStatus)
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
                .date(r.getCreatedAt().format(ISO_FORMATTER))
                .status(r.getStatus())
                .build();

        if (includeProject) {
            resp.setProject(toProjectResponse(r.getProject(), r.getApplicant()));
        }

        return resp;
    }

    private CommentResponse toCommentResponse(ProjectComment c) {
        List<CommentResponse> replyDtos = c.getReplies().stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());

        return CommentResponse.builder()
                .id(c.getId())
                .author(toUserDto(c.getAuthor()))
                .text(c.getText())
                .timestamp(c.getCreatedAt().format(ISO_FORMATTER))
                .likes(c.getLikes())
                .replies(replyDtos)
                .build();
    }
}
