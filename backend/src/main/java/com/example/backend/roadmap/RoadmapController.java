package com.example.backend.roadmap;

import com.example.backend.roadmap.dto.RoadmapResponse;
import com.example.backend.roadmap.dto.RoadmapSummary;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;
    private final UserRepository userRepository;

    private User resolveUser(UserDetails principal) {
        if (principal != null && principal.getUsername() != null) {
            return userRepository.findByEmail(principal.getUsername())
                    .orElseGet(() -> userRepository.findAll().stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("User not found")));
        }
        return userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * POST /api/roadmap/generate
     * Generates a personalized roadmap for the user based on careerId.
     */
    @PostMapping("/generate")
    public ResponseEntity<RoadmapResponse> generateRoadmap(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam Long careerId,
            @RequestParam(defaultValue = "false") boolean confirm
    ) {
        User user = resolveUser(principal);
        RoadmapResponse response = roadmapService.generateRoadmap(user, careerId, confirm);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<RoadmapSummary>> listRoadmaps(
            @AuthenticationPrincipal UserDetails principal
    ) {
        User user = resolveUser(principal);
        return ResponseEntity.ok(roadmapService.listRoadmaps(user));
    }

    /**
     * GET /api/roadmap/my
     * Fetches the user's active roadmap.
     */
    @GetMapping("/my")
    public ResponseEntity<RoadmapResponse> getMyRoadmap(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam Long careerId
    ) {
        User user = resolveUser(principal);
        RoadmapResponse response = roadmapService.getRoadmap(user, careerId);
        return ResponseEntity.ok(response);
    }
}
