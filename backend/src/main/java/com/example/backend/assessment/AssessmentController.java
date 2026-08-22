package com.example.backend.assessment;

import com.example.backend.assessment.dto.*;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final UserRepository userRepository;

    /**
     * GET /api/assessments/questions?careerId={careerId}
     * Fetch questions evaluated for the skills required by the selected career.
     */
    @GetMapping("/questions")
    public ResponseEntity<List<AssessmentQuestionResponse>> getQuestions(
            @RequestParam Long careerId
    ) {
        List<AssessmentQuestionResponse> questions = assessmentService.getQuestionsForCareer(careerId);
        return ResponseEntity.ok(questions);
    }

    /**
     * POST /api/assessments/submit
     * Submit assessment answers, calculate level, update skill profile and return results.
     */
    @PostMapping("/submit")
    public ResponseEntity<AssessmentResultResponse> submit(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody AssessmentSubmitRequest request
    ) {
        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        AssessmentResultResponse response = assessmentService.submitAssessment(user, request);
        return ResponseEntity.ok(response);
    }
}
