package com.example.backend.course;

import com.example.backend.course.dto.CourseResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}