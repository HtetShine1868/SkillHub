package com.example.backend.career;

import com.example.backend.career.dto.DiscoveryMatchRequest;
import com.example.backend.career.dto.DiscoveryMatchResponse;
import com.example.backend.career.dto.DiscoveryQuestionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class CareerDiscoveryController {

    private final CareerDiscoveryService discoveryService;


    /**
     * GET /api/discovery/questions
     * Returns the ordered list of career discovery questions with options.
     */
    @GetMapping("/questions")
    public List<DiscoveryQuestionResponse> getQuestions() {
        return discoveryService.getQuestions();
    }


    /**
     * POST /api/discovery/match
     * Calculates career match scores from the user's answers.
     * Returns top N careers ranked by match percentage.
     */
    @PostMapping("/match")
    public DiscoveryMatchResponse calculateMatches(
            @RequestBody DiscoveryMatchRequest request
    ) {
        return discoveryService.calculateMatches(request);
    }
}
