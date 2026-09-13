package com.example.backend.enrollment.dto;

import java.util.List;

public record CourseProgressResponse(
        boolean canComplete,
        int totalLessons,
        int lessonsDone,
        int quizzesDone,
        int assignmentsDone,
        int progressPercentage,
        List<String> missing,
        boolean currentLessonRead,
        boolean currentQuizPassed,
        boolean currentAssignmentDone
) {
}
