package com.example.backend.admin;

import com.example.backend.assessment.AssessmentQuestion;
import com.example.backend.assessment.AssessmentQuestionRepository;
import com.example.backend.assessment.dto.AssessmentQuestionRequest;
import com.example.backend.assessment.dto.AssessmentQuestionResponse;
import com.example.backend.skill.Skill;
import com.example.backend.skill.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/assessment/questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAssessmentController {

    private final AssessmentQuestionRepository questionRepository;
    private final SkillRepository skillRepository;

    @GetMapping
    public List<AssessmentQuestionResponse> getAllQuestions() {
        return questionRepository.findAll()
                .stream()
                .map(q -> new AssessmentQuestionResponse(
                        q.getId(),
                        q.getSkill() != null ? q.getSkill().getId() : null,
                        q.getSkill() != null ? q.getSkill().getName() : null,
                        q.getQuestion(),
                        q.getType(),
                        q.getOptionsJson(),
                        q.getDifficulty()
                ))
                .toList();
    }

    @PostMapping
    public ResponseEntity<AssessmentQuestionResponse> createQuestion(@RequestBody AssessmentQuestionRequest request) {
        Skill skill = null;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new RuntimeException("Skill not found"));
        }
        AssessmentQuestion q = AssessmentQuestion.builder()
                .skill(skill)
                .question(request.getQuestion())
                .type(request.getType())
                .optionsJson(request.getOptionsJson())
                .correctAnswer(request.getCorrectAnswer())
                .difficulty(request.getDifficulty())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .build();
        AssessmentQuestion saved = questionRepository.save(q);
        return ResponseEntity.ok(new AssessmentQuestionResponse(
                saved.getId(),
                saved.getSkill() != null ? saved.getSkill().getId() : null,
                saved.getSkill() != null ? saved.getSkill().getName() : null,
                saved.getQuestion(),
                saved.getType(),
                saved.getOptionsJson(),
                saved.getDifficulty()
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssessmentQuestionResponse> updateQuestion(
            @PathVariable Long id,
            @RequestBody AssessmentQuestionRequest request
    ) {
        AssessmentQuestion q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found: " + id));
        if (request.getSkillId() != null) {
            Skill skill = skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new RuntimeException("Skill not found"));
            q.setSkill(skill);
        }
        if (request.getQuestion() != null) q.setQuestion(request.getQuestion());
        if (request.getType() != null) q.setType(request.getType());
        if (request.getOptionsJson() != null) q.setOptionsJson(request.getOptionsJson());
        if (request.getCorrectAnswer() != null) q.setCorrectAnswer(request.getCorrectAnswer());
        if (request.getDifficulty() != null) q.setDifficulty(request.getDifficulty());
        if (request.getOrderIndex() != null) q.setOrderIndex(request.getOrderIndex());
        AssessmentQuestion saved = questionRepository.save(q);
        return ResponseEntity.ok(new AssessmentQuestionResponse(
                saved.getId(),
                saved.getSkill() != null ? saved.getSkill().getId() : null,
                saved.getSkill() != null ? saved.getSkill().getName() : null,
                saved.getQuestion(),
                saved.getType(),
                saved.getOptionsJson(),
                saved.getDifficulty()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
