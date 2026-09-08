package com.example.backend.assessment;

import com.example.backend.assessment.dto.*;
import com.example.backend.assessment.dto.AssessmentResultResponse.SkillLevelResult;
import com.example.backend.career.*;
import com.example.backend.skill.*;
import com.example.backend.user.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssessmentService {

    private final AssessmentQuestionRepository questionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final ObjectMapper objectMapper;

    /**
     * Gets all questions relevant to the skills required for the specified career.
     */
    public List<AssessmentQuestionResponse> getQuestionsForCareer(Long careerId) {
        List<CareerSkill> requiredSkills = careerSkillRepository.findByCareerId(careerId);
        Set<Long> skillIds = new HashSet<>();
        for (CareerSkill cs : requiredSkills) {
            skillIds.add(cs.getSkill().getId());
        }

        List<AssessmentQuestionResponse> questions = questionRepository.findAllByOrderByOrderIndexAsc().stream()
                .filter(q -> q.getSkill() != null && skillIds.contains(q.getSkill().getId()))
                .map(this::toResponse)
                .toList();

        if (questions.isEmpty()) {
            return questionRepository.findAllByOrderByOrderIndexAsc().stream()
                    .map(this::toResponse)
                    .toList();
        }

        return questions;
    }

    /**
     * Submits and grades the assessment.
     * Updates/creates UserSkill records using the spec §14 & §15 formula.
     */
    @Transactional
    public AssessmentResultResponse submitAssessment(User user, AssessmentSubmitRequest request) {
        Career career = careerRepository.findById(request.careerId())
                .orElseThrow(() -> new RuntimeException("Career not found"));

        List<CareerSkill> careerSkills = careerSkillRepository.findByCareerId(career.getId());
        Set<Long> relevantSkillIds = new HashSet<>();
        for (CareerSkill cs : careerSkills) {
            relevantSkillIds.add(cs.getSkill().getId());
        }

        // Fetch all questions answered by user
        List<AssessmentQuestion> allQuestions = questionRepository.findAll();
        Map<Long, AssessmentQuestion> questionMap = new HashMap<>();
        for (AssessmentQuestion q : allQuestions) {
            questionMap.put(q.getId(), q);
        }

        // Group answers by Skill
        Map<Long, List<GradedAnswer>> skillAnswers = new HashMap<>();

        request.answers().forEach((questionId, answerValue) -> {
            AssessmentQuestion question = questionMap.get(questionId);
            if (question == null || question.getSkill() == null) return;

            Long skillId = question.getSkill().getId();
            if (!relevantSkillIds.contains(skillId)) return;

            skillAnswers.computeIfAbsent(skillId, k -> new ArrayList<>())
                    .add(new GradedAnswer(question, answerValue));
        });

        List<SkillLevelResult> results = new ArrayList<>();
        double totalKnowledgeQuestions = 0;
        double totalCorrectKnowledgeQuestions = 0;

        for (CareerSkill cs : careerSkills) {
            Skill skill = cs.getSkill();
            List<GradedAnswer> answers = skillAnswers.getOrDefault(skill.getId(), List.of());

            Double selfReportedLevel = null;
            double weightedCorrect = 0;
            double weightedTotal = 0;

            for (GradedAnswer ga : answers) {
                AssessmentQuestion q = ga.question;
                String ans = ga.answerValue;

                if ("SELF_REPORTED".equalsIgnoreCase(q.getType()) || "skill-level".equalsIgnoreCase(q.getType()) || "experience".equalsIgnoreCase(q.getType())) {
                    try {
                        selfReportedLevel = Double.parseDouble(ans);
                    } catch (NumberFormatException e) {
                        // Ignore invalid self-reported level
                    }
                } else {
                    // Knowledge / Practical question
                    int diff = q.getDifficulty() != null ? q.getDifficulty() : 1;
                    weightedTotal += diff;
                    totalKnowledgeQuestions += diff;

                    if (q.getCorrectAnswer() != null && q.getCorrectAnswer().equalsIgnoreCase(ans.trim())) {
                        weightedCorrect += diff;
                        totalCorrectKnowledgeQuestions += diff;
                    }
                }
            }

            // Calculate assessment level (spec §14)
            Integer assessmentLevel = null;
            if (weightedTotal > 0) {
                double pct = (weightedCorrect / weightedTotal) * 100.0;
                assessmentLevel = convertScoreToLevel(pct);
            }

            // Calculate final skill level (spec §15)
            int finalLevel = 0;
            String source = "Assessment";
            double confidence = 0.5;

            if (assessmentLevel != null && selfReportedLevel != null) {
                double calculated = (assessmentLevel * 0.75) + (selfReportedLevel * 0.25);
                finalLevel = (int) Math.round(calculated);
                confidence = 0.8;
            } else if (assessmentLevel != null) {
                finalLevel = assessmentLevel;
                confidence = 0.7;
            } else if (selfReportedLevel != null) {
                finalLevel = selfReportedLevel.intValue();
                source = "Self-Reported";
                confidence = 0.3;
            }

            // Clamp final level between 0 and 5
            finalLevel = Math.max(0, Math.min(5, finalLevel));

            // Save user skill profile
            saveOrUpdateUserSkill(user, skill, finalLevel, confidence, source);

            results.add(new SkillLevelResult(
                    skill.getId(),
                    skill.getName(),
                    finalLevel,
                    source,
                    confidence
            ));
        }

        // Overall score calculation
        double overallScore = totalKnowledgeQuestions > 0 
                ? (totalCorrectKnowledgeQuestions / totalKnowledgeQuestions) * 100.0 
                : 100.0;

        // Store attempt history
        String detailsJson = "";
        try {
            detailsJson = objectMapper.writeValueAsString(results);
        } catch (Exception e) {
            log.error("Failed to serialize assessment details JSON", e);
        }

        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .user(user)
                .career(career)
                .score(overallScore)
                .detailsJson(detailsJson)
                .build();

        attemptRepository.save(attempt);

        return new AssessmentResultResponse(
                attempt.getId(),
                career.getId(),
                overallScore,
                results
        );
    }

    private int convertScoreToLevel(double scorePercentage) {
        // Spec §14 thresholds
        if (scorePercentage < 20.0) return 0;
        if (scorePercentage < 40.0) return 1;
        if (scorePercentage < 60.0) return 2;
        if (scorePercentage < 75.0) return 3;
        if (scorePercentage < 90.0) return 4;
        return 5;
    }

    private void saveOrUpdateUserSkill(User user, Skill skill, int level, double confidence, String source) {
        UserSkill userSkill = userSkillRepository.findByUserIdAndSkillId(user.getId(), skill.getId())
                .orElse(null);

        if (userSkill == null) {
            userSkill = UserSkill.builder()
                    .user(user)
                    .skill(skill)
                    .currentLevel(level)
                    .confidence(confidence)
                    .source(source)
                    .build();
        } else {
            userSkill.setCurrentLevel(level);
            userSkill.setConfidence(confidence);
            userSkill.setSource(source);
        }

        userSkillRepository.save(userSkill);
    }

    private AssessmentQuestionResponse toResponse(AssessmentQuestion q) {
        return new AssessmentQuestionResponse(
                q.getId(),
                q.getSkill() != null ? q.getSkill().getId() : null,
                q.getSkill() != null ? q.getSkill().getName() : null,
                q.getQuestion(),
                q.getType(),
                q.getOptionsJson(),
                q.getDifficulty()
        );
    }

    private static class GradedAnswer {
        final AssessmentQuestion question;
        final String answerValue;

        GradedAnswer(AssessmentQuestion question, String answerValue) {
            this.question = question;
            this.answerValue = answerValue;
        }
    }
}
