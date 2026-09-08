package com.example.backend.admin;

import com.example.backend.assessment.AssessmentQuestion;
import com.example.backend.assessment.AssessmentQuestionRepository;
import com.example.backend.assessment.dto.AssessmentQuestionRequest;
import com.example.backend.assessment.dto.AssessmentQuestionResponse;
import com.example.backend.skill.Skill;
import com.example.backend.skill.SkillRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/assessment/questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminAssessmentController {

    private final AssessmentQuestionRepository questionRepository;
    private final SkillRepository skillRepository;
    private final ObjectMapper objectMapper;

    @GetMapping
    public List<AssessmentQuestionResponse> getAllQuestions() {
        return questionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<AssessmentQuestionResponse> createQuestion(@RequestBody AssessmentQuestionRequest request) {
        Skill skill = null;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId()).orElse(null);
        }

        String questionText = request.getEffectiveQuestion();
        String type = request.getEffectiveType();
        String optionsJson = buildOptionsJson(request);
        Integer difficulty = request.getEffectiveDifficulty();
        int orderIndex = request.getOrderIndex() != null ? request.getOrderIndex() : 0;

        AssessmentQuestion q = AssessmentQuestion.builder()
                .skill(skill)
                .question(questionText)
                .type(type)
                .optionsJson(optionsJson)
                .correctAnswer(request.getCorrectAnswer())
                .difficulty(difficulty)
                .orderIndex(orderIndex)
                .build();

        AssessmentQuestion saved = questionRepository.save(q);
        return ResponseEntity.ok(toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentQuestionResponse> updateQuestion(
            @PathVariable Long id,
            @RequestBody AssessmentQuestionRequest request
    ) {
        AssessmentQuestion q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found: " + id));

        if (request.getSkillId() != null) {
            Skill skill = skillRepository.findById(request.getSkillId()).orElse(null);
            q.setSkill(skill);
        }

        if (request.getQuestion() != null && !request.getQuestion().isBlank()) {
            q.setQuestion(request.getEffectiveQuestion());
        }
        if (request.getType() != null && !request.getType().isBlank()) {
            q.setType(request.getType());
        }
        if ((request.getOptions() != null && !request.getOptions().isEmpty()) || request.getOptionsJson() != null) {
            q.setOptionsJson(buildOptionsJson(request));
        }
        if (request.getCorrectAnswer() != null) {
            q.setCorrectAnswer(request.getCorrectAnswer());
        }
        if (request.getDifficulty() != null) {
            q.setDifficulty(request.getEffectiveDifficulty());
        }
        if (request.getOrderIndex() != null) {
            q.setOrderIndex(request.getOrderIndex());
        }

        AssessmentQuestion saved = questionRepository.save(q);
        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private AssessmentQuestionResponse toResponse(AssessmentQuestion q) {
        List<String> optionsList = parseOptionsToTextList(q.getOptionsJson());
        return new AssessmentQuestionResponse(
                q.getId(),
                q.getSkill() != null ? q.getSkill().getId() : null,
                q.getSkill() != null ? q.getSkill().getName() : null,
                q.getQuestion(),
                q.getType(),
                q.getOptionsJson(),
                optionsList,
                q.getCorrectAnswer(),
                q.getDifficulty(),
                q.getOrderIndex()
        );
    }

    private String buildOptionsJson(AssessmentQuestionRequest request) {
        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            List<Map<String, Object>> list = new ArrayList<>();
            char key = 'A';
            for (Object item : request.getOptions()) {
                if (item == null) continue;
                if (item instanceof String str) {
                    if (str.isBlank()) continue;
                    list.add(Map.of("optionKey", String.valueOf(key++), "text", str.trim()));
                } else if (item instanceof Map<?, ?> map) {
                    list.add((Map<String, Object>) map);
                }
            }
            try {
                return objectMapper.writeValueAsString(list);
            } catch (Exception e) {
                log.error("Failed to serialize options list to JSON", e);
                return "[]";
            }
        }
        if (request.getOptionsJson() != null && !request.getOptionsJson().isBlank()) {
            return request.getOptionsJson();
        }
        return "[]";
    }

    private List<String> parseOptionsToTextList(String optionsJson) {
        if (optionsJson == null || optionsJson.isBlank()) return List.of();
        try {
            List<?> rawList = objectMapper.readValue(optionsJson, List.class);
            List<String> texts = new ArrayList<>();
            for (Object item : rawList) {
                if (item instanceof String str) {
                    texts.add(str);
                } else if (item instanceof Map<?, ?> map) {
                    Object text = map.get("text");
                    if (text == null) text = map.get("label");
                    if (text == null) text = map.get("optionKey");
                    texts.add(text != null ? text.toString() : "");
                }
            }
            return texts;
        } catch (Exception e) {
            return List.of();
        }
    }
}

