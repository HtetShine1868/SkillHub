package com.example.backend.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/tutor")
    public ResponseEntity<?> askTutor(@RequestBody Map<String, String> payload) {
        String prompt = payload.get("prompt");
        String lessonTitle = payload.get("lessonTitle");
        String lessonContent = payload.get("lessonContent");

        if (prompt == null || prompt.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required"));
        }

        String answer = aiService.getTutorExplanation(prompt, lessonTitle, lessonContent);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
