package com.example.backend.roadmap;

import com.example.backend.roadmap.dto.RoadmapResponse;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
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

    /**
     * POST /api/roadmap/generate
     * Generates a personalized roadmap for the user based on careerId.
     */
    @PostMapping("/generate")
    public ResponseEntity<RoadmapResponse> generateRoadmap(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam Long careerId
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RoadmapResponse response = roadmapService.generateRoadmap(user, careerId);
        return ResponseEntity.ok(response);
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
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        RoadmapResponse response = roadmapService.getRoadmap(user, careerId);
        return ResponseEntity.ok(response);
    }
}
