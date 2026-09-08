package com.example.backend.admin;

import com.example.backend.skillexchange.dto.AdminProjectResponse;
import com.example.backend.skillexchange.service.SkillExchangeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/skill-exchange/projects")
@RequiredArgsConstructor
public class AdminSkillExchangeController {

    private final SkillExchangeService skillExchangeService;

    @GetMapping
    public ResponseEntity<List<AdminProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(skillExchangeService.getAdminProjects());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Map<String, Boolean>> approve(@PathVariable Long id) {
        boolean success = skillExchangeService.approveProject(id);
        return ResponseEntity.ok(Map.of("success", success));
    }

    @PatchMapping("/{id}/flag")
    public ResponseEntity<Map<String, Boolean>> flag(@PathVariable Long id) {
        boolean success = skillExchangeService.flagProject(id);
        return ResponseEntity.ok(Map.of("success", success));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(@PathVariable Long id) {
        boolean success = skillExchangeService.deleteProject(id);
        return ResponseEntity.ok(Map.of("success", success));
    }
}
