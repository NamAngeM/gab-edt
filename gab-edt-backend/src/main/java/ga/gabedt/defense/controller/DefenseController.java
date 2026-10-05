package ga.gabedt.defense.controller;

import ga.gabedt.defense.dto.DefenseCreateDto;
import ga.gabedt.defense.dto.DefenseDto;
import ga.gabedt.defense.service.DefenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/defenses")
@RequiredArgsConstructor
public class DefenseController {

    private final DefenseService defenseService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DefenseDto>> getAllDefenses() {
        return ResponseEntity.ok(defenseService.getAllDefenses());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<DefenseDto> createDefense(@Valid @RequestBody DefenseCreateDto dto) {
        return ResponseEntity.ok(defenseService.createDefense(dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PEDAGOGICAL_MANAGER')")
    public ResponseEntity<Void> deleteDefense(@PathVariable UUID id) {
        defenseService.deleteDefense(id);
        return ResponseEntity.noContent().build();
    }
}
