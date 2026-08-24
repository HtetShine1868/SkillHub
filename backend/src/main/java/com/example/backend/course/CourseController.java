package com.example.backend.course;

import com.example.backend.course.dto.CourseResponse;
import com.example.backend.course.dto.CourseRequest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;


    @GetMapping
    public List<CourseResponse> getCourses(

            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            String category

    ) {

        if (search != null && !search.isBlank()) {

            return courseService.searchCourses(search);
        }

        if (category != null && !category.isBlank()) {

            return courseService.getCoursesByCategory(category);
        }

        return courseService.getAllCourses();
    }


    @GetMapping("/{id}")
    public CourseResponse getCourse(
            @PathVariable Long id
    ) {

        return courseService.getCourseById(id);
    }

    @PostMapping
    public CourseResponse createCourse(@RequestBody CourseRequest request) {
        return courseService.createCourse(request);
    }

    @PutMapping("/{id}")
    public CourseResponse updateCourse(
            @PathVariable Long id,
            @RequestBody CourseRequest request
    ) {
        return courseService.updateCourse(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }
}