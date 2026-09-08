package com.example.backend.skillexchange.controller;

import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import com.example.backend.skillexchange.dto.*;
import com.example.backend.skillexchange.service.SkillExchangeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skill-exchange/projects")
@RequiredArgsConstructor
public class SkillExchangeController {

    private final SkillExchangeService skillExchangeService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ProjectResponse> projects = skillExchangeService.getProjects(user, category, search, level, status, sort);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProjectResponse project = skillExchangeService.getProjectById(user, id);
        return ResponseEntity.ok(project);
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody ProjectCreateRequest request
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProjectResponse project = skillExchangeService.createProject(user, request);
        return ResponseEntity.ok(project);
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, List<ProjectResponse>>> getMyProjects(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, List<ProjectResponse>> result = skillExchangeService.getMyProjects(user);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<JoinRequestResponse> sendJoinRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestBody JoinRequestApplyRequest request
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        JoinRequestResponse response = skillExchangeService.sendJoinRequest(user, id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/requests")
    public ResponseEntity<List<JoinRequestResponse>> getJoinRequests(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<JoinRequestResponse> requests = skillExchangeService.getJoinRequests(user, id);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<JoinRequestResponse>> getMyPendingRequests(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<JoinRequestResponse> requests = skillExchangeService.getMyPendingRequests(user);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/{id}/requests/{requestId}/approve")
    public ResponseEntity<Map<String, Boolean>> approveRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @PathVariable Long requestId
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean success = skillExchangeService.approveJoinRequest(user, id, requestId);
        return ResponseEntity.ok(Map.of("success", success));
    }

    @PostMapping("/{id}/requests/{requestId}/reject")
    public ResponseEntity<Map<String, Boolean>> rejectRequest(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @PathVariable Long requestId
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean success = skillExchangeService.rejectJoinRequest(user, id, requestId);
        return ResponseEntity.ok(Map.of("success", success));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @RequestParam(required = false) Long parentId,
            @RequestBody CommentRequestDto request
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommentResponse response = skillExchangeService.addComment(user, id, request.getText(), parentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/comments/{commentId}/like")
    public ResponseEntity<Map<String, Boolean>> likeComment(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable Long id,
            @PathVariable Long commentId
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean success = skillExchangeService.toggleCommentLike(user, id, commentId);
        return ResponseEntity.ok(Map.of("success", success));
    }
}
