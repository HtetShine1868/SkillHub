package com.example.backend.admin;

import com.example.backend.career.CareerDiscoveryQuestion;
import com.example.backend.career.CareerDiscoveryQuestionRepository;
import com.example.backend.career.dto.DiscoveryQuestionRequest;
import com.example.backend.career.dto.DiscoveryQuestionResponse;
import com.example.backend.career.dto.DiscoveryQuestionResponse.DiscoveryOptionResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/discovery/questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminDiscoveryController {

    private final CareerDiscoveryQuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    private DiscoveryQuestionResponse toResponse(CareerDiscoveryQuestion q) {
        if (q == null) return null;
        List<DiscoveryOptionResponse> options = List.of();
        if (q.getOptionsJson() != null && !q.getOptionsJson().isBlank()) {
            try {
                options = objectMapper.readValue(q.getOptionsJson(), new TypeReference<List<DiscoveryOptionResponse>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse optionsJson for discovery question id={}", q.getId());
            }
        }
        return new DiscoveryQuestionResponse(q.getId(), q.getQuestion(), q.getOrderIndex(), options);
    }

    @GetMapping
    public List<DiscoveryQuestionResponse> getAllQuestions() {
        return questionRepository.findAllByOrderByOrderIndexAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<DiscoveryQuestionResponse> createQuestion(@RequestBody DiscoveryQuestionRequest request) {
        String questionText = request.getQuestionText() != null ? request.getQuestionText() : request.getQuestion();
        Integer order = request.getQuestionOrder() != null ? request.getQuestionOrder() : (request.getOrderIndex() != null ? request.getOrderIndex() : 0);

        String optionsJson = request.getOptionsJson();
        if ((optionsJson == null || optionsJson.isBlank()) && request.getOptions() != null) {
            try {
                optionsJson = objectMapper.writeValueAsString(request.getOptions());
            } catch (Exception e) {
                optionsJson = "[]";
            }
        }

        CareerDiscoveryQuestion q = CareerDiscoveryQuestion.builder()
                .question(questionText)
                .optionsJson(optionsJson != null ? optionsJson : "[]")
                .orderIndex(order)
                .build();

        CareerDiscoveryQuestion saved = questionRepository.save(q);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscoveryQuestionResponse> updateQuestion(
            @PathVariable Long id,
            @RequestBody DiscoveryQuestionRequest request
    ) {
        CareerDiscoveryQuestion q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found: " + id));

        String questionText = request.getQuestionText() != null ? request.getQuestionText() : request.getQuestion();
        if (questionText != null) q.setQuestion(questionText);

        Integer order = request.getQuestionOrder() != null ? request.getQuestionOrder() : request.getOrderIndex();
        if (order != null) q.setOrderIndex(order);

        if (request.getOptionsJson() != null) {
            q.setOptionsJson(request.getOptionsJson());
        } else if (request.getOptions() != null) {
            try {
                q.setOptionsJson(objectMapper.writeValueAsString(request.getOptions()));
            } catch (Exception e) {
                log.warn("Could not serialize options for question {}", id);
            }
        }

        CareerDiscoveryQuestion saved = questionRepository.save(q);
        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
