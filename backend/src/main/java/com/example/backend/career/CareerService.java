package com.example.backend.career;

import com.example.backend.career.dto.CareerResponse;
import com.example.backend.career.dto.CareerSkillResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CareerService {

    private final CareerRepository careerRepository;

    private final CareerSkillRepository careerSkillRepository;


    public List<CareerResponse> getAllCareers() {

        return careerRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    public CareerResponse getCareerById(Long id) {

        Career career = careerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Career not found: " + id));

        return toResponse(career);
    }


    public List<CareerResponse> getCareersByCategory(String category) {

        return careerRepository.findByCategoryIgnoreCase(category)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    public List<CareerSkillResponse> getCareerSkills(Long careerId) {

        return careerSkillRepository.findByCareerId(careerId)
                .stream()
                .filter(cs -> cs.getSkill() != null)
                .map(cs -> new CareerSkillResponse(
                        cs.getSkill().getId(),
                        cs.getSkill().getName(),
                        cs.getSkill().getCategory(),
                        cs.getRequiredLevel() != null ? cs.getRequiredLevel() : 1,
                        cs.getImportance() != null ? cs.getImportance() : 1.0
                ))
                .toList();
    }


    public CareerResponse toResponse(Career career) {

        List<CareerSkillResponse> skills = careerSkillRepository
                .findByCareerId(career.getId())
                .stream()
                .filter(cs -> cs.getSkill() != null)
                .map(cs -> new CareerSkillResponse(
                        cs.getSkill().getId(),
                        cs.getSkill().getName(),
                        cs.getSkill().getCategory(),
                        cs.getRequiredLevel() != null ? cs.getRequiredLevel() : 1,
                        cs.getImportance() != null ? cs.getImportance() : 1.0
                ))
                .toList();

        return new CareerResponse(
                career.getId(),
                career.getName(),
                career.getDescription(),
                career.getCategory(),
                career.getIcon(),
                career.getResponsibilities(),
                skills
        );
    }
}
