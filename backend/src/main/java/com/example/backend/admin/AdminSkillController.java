package com.example.backend.admin;

import com.example.backend.skill.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/skills")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSkillController {

    private final SkillRepository skillRepository;

    @GetMapping
    public List<SkillResponse> getAllSkills() {
        return skillRepository.findAll()
                .stream()
                .map(s -> new SkillResponse(s.getId(), s.getName(), s.getCategory(), s.getDescription()))
                .toList();
    }

    @PostMapping
    public ResponseEntity<SkillResponse> createSkill(@RequestBody SkillRequest request) {
        if (request.getName() != null && !request.getName().isBlank()) {
            skillRepository.findByNameIgnoreCase(request.getName().trim()).ifPresent(existing -> {
                throw new IllegalArgumentException("A skill with the name '" + request.getName().trim() + "' already exists");
            });
        }
        Skill skill = Skill.builder()
                .name(request.getName() != null ? request.getName().trim() : "New Skill")
                .category(request.getCategory())
                .description(request.getDescription())
                .build();
        Skill saved = skillRepository.save(skill);
        return ResponseEntity.ok(new SkillResponse(saved.getId(), saved.getName(), saved.getCategory(), saved.getDescription()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillResponse> updateSkill(
            @PathVariable Long id,
            @RequestBody SkillRequest request
    ) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found: " + id));
        if (request.getName() != null && !request.getName().isBlank()) {
            skillRepository.findByNameIgnoreCase(request.getName().trim()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new IllegalArgumentException("A skill with the name '" + request.getName().trim() + "' already exists");
                }
            });
            skill.setName(request.getName().trim());
        }
        if (request.getCategory() != null) skill.setCategory(request.getCategory());
        if (request.getDescription() != null) skill.setDescription(request.getDescription());
        Skill saved = skillRepository.save(skill);
        return ResponseEntity.ok(new SkillResponse(saved.getId(), saved.getName(), saved.getCategory(), saved.getDescription()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        skillRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
