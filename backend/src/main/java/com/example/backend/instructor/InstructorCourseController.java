package com.example.backend.instructor;

import com.example.backend.course.dto.CourseRequest;
import com.example.backend.course.dto.CourseResponse;
import com.example.backend.instructor.dto.InstructorStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/instructor")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
public class InstructorCourseController {

    private final InstructorService instructorService;

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getMyCourses(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "instructor@skillhub.com";
        return ResponseEntity.ok(instructorService.getMyCourses(email));
    }

    @PostMapping("/courses")
    public ResponseEntity<CourseResponse> createCourse(
            @RequestBody CourseRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "instructor@skillhub.com";
        return ResponseEntity.ok(instructorService.createCourse(email, request));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseRequest request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "instructor@skillhub.com";
        return ResponseEntity.ok(instructorService.updateCourse(id, email, request));
    }

    @RequestMapping(value = "/courses/{id}/submit", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<CourseResponse> submitForApproval(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "instructor@skillhub.com";
        return ResponseEntity.ok(instructorService.submitForApproval(id, email));
    }

    @GetMapping("/stats")
    public ResponseEntity<InstructorStatsResponse> getStats(Authentication authentication) {
        String email = authentication != null ? authentication.getName() : "instructor@skillhub.com";
        return ResponseEntity.ok(instructorService.getStats(email));
    }
}
