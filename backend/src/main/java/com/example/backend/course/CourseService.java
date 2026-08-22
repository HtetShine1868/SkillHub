package com.example.backend.course;

import com.example.backend.course.dto.CourseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;


    public List<CourseResponse> getAllCourses() {

        return courseRepository
                .findByPublishedTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    public CourseResponse getCourseById(Long id) {

        Course course = courseRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        if (!course.getPublished()) {
            throw new RuntimeException("Course is not available");
        }

        return toResponse(course);
    }


    public List<CourseResponse> searchCourses(String search) {

        return courseRepository
                .findByTitleContainingIgnoreCaseAndPublishedTrue(search)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    public List<CourseResponse> getCoursesByCategory(
            String category
    ) {

        return courseRepository
                .findByCategoryIgnoreCaseAndPublishedTrue(category)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    private CourseResponse toResponse(Course course) {

        return new CourseResponse(

                course.getId(),

                course.getTitle(),

                course.getDescription(),

                course.getCategory(),

                course.getDifficulty(),

                course.getDurationHours(),

                course.getThumbnailUrl(),

                course.getRating(),

                course.getEnrollmentCount(),

                course.getCreatedAt()
        );
    }
}