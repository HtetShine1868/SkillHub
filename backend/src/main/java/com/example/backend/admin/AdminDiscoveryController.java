package com.example.backend.admin;

import com.example.backend.career.CareerDiscoveryQuestion;
import com.example.backend.career.CareerDiscoveryQuestionRepository;
import com.example.backend.career.dto.DiscoveryQuestionRequest;
import com.example.backend.career.dto.DiscoveryQuestionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/discovery/questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDiscoveryController {

    private final CareerDiscoveryQuestionRepository questionRepository;

    @GetMapping
    public List<DiscoveryQuestionResponse> getAllQuestions() {
        return questionRepository.findAllByOrderByOrderIndexAsc()
                .stream()
                .map(q -> new DiscoveryQuestionResponse(q.getId(), q.getQuestion(), q.getOptionsJson(), q.getOrderIndex()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<DiscoveryQuestionResponse> createQuestion(@RequestBody DiscoveryQuestionRequest request) {
        CareerDiscoveryQuestion q = CareerDiscoveryQuestion.builder()
                .question(request.getQuestion())
                .optionsJson(request.getOptionsJson())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .build();
        CareerDiscoveryQuestion saved = questionRepository.save(q);
        return ResponseEntity.ok(new DiscoveryQuestionResponse(saved.getId(), saved.getQuestion(), saved.getOptionsJson(), saved.getOrderIndex()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiscoveryQuestionResponse> updateQuestion(
            @PathVariable Long id,
            @RequestBody DiscoveryQuestionRequest request
    ) {
        CareerDiscoveryQuestion q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found: " + id));
        if (request.getQuestion() != null) q.setQuestion(request.getQuestion());
        if (request.getOptionsJson() != null) q.setOptionsJson(request.getOptionsJson());
        if (request.getOrderIndex() != null) q.setOrderIndex(request.getOrderIndex());
        CareerDiscoveryQuestion saved = questionRepository.save(q);
        return ResponseEntity.ok(new DiscoveryQuestionResponse(saved.getId(), saved.getQuestion(), saved.getOptionsJson(), saved.getOrderIndex()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
