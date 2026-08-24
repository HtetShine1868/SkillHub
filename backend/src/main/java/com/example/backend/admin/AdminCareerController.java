package com.example.backend.admin;

import com.example.backend.career.*;
import com.example.backend.career.dto.*;
import com.example.backend.skill.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/careers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCareerController {

    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;
    private final SkillRepository skillRepository;
    private final CareerService careerService;

    @GetMapping
    public List<CareerResponse> getAllCareers() {
        return careerRepository.findAll()
                .stream()
                .map(careerService::toResponse)
                .toList();
    }

    @PostMapping
    public ResponseEntity<CareerResponse> createCareer(@RequestBody CareerRequest request) {
        Career career = Career.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .icon(request.getIcon())
                .responsibilities(request.getResponsibilities())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        Career saved = careerRepository.save(career);
        return ResponseEntity.ok(careerService.toResponse(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CareerResponse> updateCareer(
            @PathVariable Long id,
            @RequestBody CareerRequest request
    ) {
        Career career = careerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Career not found: " + id));
        if (request.getName() != null) career.setName(request.getName());
        if (request.getDescription() != null) career.setDescription(request.getDescription());
        if (request.getCategory() != null) career.setCategory(request.getCategory());
        if (request.getIcon() != null) career.setIcon(request.getIcon());
        if (request.getResponsibilities() != null) career.setResponsibilities(request.getResponsibilities());
        if (request.getActive() != null) career.setActive(request.getActive());
        Career saved = careerRepository.save(career);
        return ResponseEntity.ok(careerService.toResponse(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCareer(@PathVariable Long id) {
        careerSkillRepository.deleteByCareerId(id);
        careerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<CareerResponse> toggleCareer(@PathVariable Long id) {
        Career career = careerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Career not found: " + id));
        career.setActive(!career.getActive());
        Career saved = careerRepository.save(career);
        return ResponseEntity.ok(careerService.toResponse(saved));
    }

    // --- Career → Skill Mapping ---

    @GetMapping("/{id}/skills")
    public List<CareerSkillResponse> getCareerSkills(@PathVariable Long id) {
        return careerSkillRepository.findByCareerId(id)
                .stream()
                .map(cs -> new CareerSkillResponse(
                        cs.getSkill().getId(),
                        cs.getSkill().getName(),
                        cs.getSkill().getCategory(),
                        cs.getRequiredLevel(),
                        cs.getImportance()
                ))
                .toList();
    }

    @PostMapping("/{id}/skills")
    public ResponseEntity<CareerSkillResponse> addSkillToCareer(
            @PathVariable Long id,
            @RequestBody CareerSkillRequest request
    ) {
        Career career = careerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Career not found"));
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        // Update if already mapped, else create
        CareerSkill mapping = careerSkillRepository.findByCareerId(id)
                .stream()
                .filter(cs -> cs.getSkill().getId().equals(request.getSkillId()))
                .findFirst()
                .orElse(CareerSkill.builder().career(career).skill(skill).build());

        mapping.setRequiredLevel(request.getRequiredLevel());
        mapping.setImportance(request.getImportance());
        CareerSkill saved = careerSkillRepository.save(mapping);
        return ResponseEntity.ok(new CareerSkillResponse(
                saved.getSkill().getId(),
                saved.getSkill().getName(),
                saved.getSkill().getCategory(),
                saved.getRequiredLevel(),
                saved.getImportance()
        ));
    }

    @DeleteMapping("/{careerId}/skills/{skillId}")
    public ResponseEntity<Void> removeSkillFromCareer(
            @PathVariable Long careerId,
            @PathVariable Long skillId
    ) {
        careerSkillRepository.findByCareerId(careerId)
                .stream()
                .filter(cs -> cs.getSkill().getId().equals(skillId))
                .findFirst()
                .ifPresent(careerSkillRepository::delete);
        return ResponseEntity.noContent().build();
    }
}
