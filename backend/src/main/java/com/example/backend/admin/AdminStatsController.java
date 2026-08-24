package com.example.backend.admin;

import com.example.backend.assessment.AssessmentQuestionRepository;
import com.example.backend.career.CareerRepository;
import com.example.backend.career.CareerDiscoveryQuestionRepository;
import com.example.backend.course.CourseRepository;
import com.example.backend.skill.SkillRepository;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final UserRepository userRepository;
    private final CareerRepository careerRepository;
    private final SkillRepository skillRepository;
    private final CourseRepository courseRepository;
    private final CareerDiscoveryQuestionRepository discoveryQuestionRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;

    @GetMapping
    public Map<String, Long> getStats() {
        return Map.of(
                "totalUsers", userRepository.count(),
                "totalCareers", careerRepository.count(),
                "totalSkills", skillRepository.count(),
                "totalCourses", courseRepository.count(),
                "totalDiscoveryQuestions", discoveryQuestionRepository.count(),
                "totalAssessmentQuestions", assessmentQuestionRepository.count()
        );
    }
}
