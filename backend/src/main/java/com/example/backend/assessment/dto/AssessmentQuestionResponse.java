package com.example.backend.assessment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AssessmentQuestionResponse(
        Long id,
        Long skillId,
        String skillName,
        String question,
        String questionText,
        String type,
        String optionsJson,
        List<String> options,
        String correctAnswer,
        Integer difficulty,
        String difficultyLevel,
        Integer pointsValue,
        String explanation,
        Integer orderIndex
) {
    public AssessmentQuestionResponse(
            Long id,
            Long skillId,
            String skillName,
            String question,
            String type,
            String optionsJson,
            List<String> options,
            String correctAnswer,
            Integer difficulty,
            Integer orderIndex
    ) {
        this(
                id,
                skillId,
                skillName,
                question,
                question,
                type != null ? type : "KNOWLEDGE",
                optionsJson,
                options,
                correctAnswer,
                difficulty != null ? difficulty : 1,
                toDifficultyLevel(difficulty),
                difficulty != null ? difficulty * 10 : 10,
                null,
                orderIndex != null ? orderIndex : 0
        );
    }

    public AssessmentQuestionResponse(
            Long id,
            Long skillId,
            String skillName,
            String question,
            String type,
            String optionsJson,
            Integer difficulty
    ) {
        this(id, skillId, skillName, question, type, optionsJson, null, null, difficulty, 0);
    }

    private static String toDifficultyLevel(Integer diff) {
        if (diff == null || diff <= 1) return "BEGINNER";
        if (diff == 2) return "INTERMEDIATE";
        if (diff == 3) return "ADVANCED";
        return "EXPERT";
    }
}

