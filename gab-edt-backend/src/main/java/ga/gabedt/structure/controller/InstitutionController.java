package ga.gabedt.structure.controller;

import ga.gabedt.structure.Institution;
import ga.gabedt.structure.dto.InstitutionCreateDto;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.service.InstitutionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import ga.gabedt.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/institutions")
@RequiredArgsConstructor
public class InstitutionController {
    private final InstitutionRepository institutionRepository;
    private final InstitutionService institutionService;

    /**
     * SUPER_ADMIN : tous les établissements. Autres rôles : uniquement le leur.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Institution> getAll() {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            // Seul un SUPER_ADMIN peut atteindre ce point sans établissement (cf. JwtAuthenticationFilter)
            return institutionRepository.findAll();
        }
        return institutionRepository.findById(tenantId).map(List::of).orElse(List.of());
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Institution> create(@Valid @RequestBody InstitutionCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(institutionService.create(dto));
    }

    @PutMapping("/{id}/active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Institution setActive(@PathVariable UUID id, @RequestParam boolean value) {
        return institutionService.setActive(id, value);
    }
}
