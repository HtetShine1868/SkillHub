package com.example.backend.career;

import com.example.backend.career.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/careers")
@RequiredArgsConstructor
public class CareerController {

    private final CareerService careerService;


    @GetMapping
    public List<CareerResponse> getAllCareers(
            @RequestParam(required = false) String category
    ) {
        if (category != null && !category.isBlank()) {
            return careerService.getCareersByCategory(category);
        }
        return careerService.getAllCareers();
    }


    @GetMapping("/{id}")
    public CareerResponse getCareer(@PathVariable Long id) {
        return careerService.getCareerById(id);
    }


    @GetMapping("/{id}/skills")
    public List<CareerSkillResponse> getCareerSkills(@PathVariable Long id) {
        return careerService.getCareerSkills(id);
    }
}
