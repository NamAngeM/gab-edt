package ga.gabedt.structure.controller;

import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.dto.OrgUnitCreateDto;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.structure.service.OrganizationalUnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/org-units")
@RequiredArgsConstructor
public class OrganizationalUnitController {
    private final OrganizationalUnitRepository orgUnitRepository;
    private final OrganizationalUnitService orgUnitService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<OrganizationalUnit> getAll() {
        return orgUnitRepository.findByActiveTrue();
    }

    @GetMapping("/parent/{parentId}")
    @PreAuthorize("isAuthenticated()")
    public List<OrganizationalUnit> getByParent(@PathVariable UUID parentId) {
        return orgUnitRepository.findByParentIdAndActiveTrue(parentId);
    }

    @PostMapping
    @PreAuthorize("@securityAclService.canManage(#dto.parentId)")
    public ResponseEntity<OrganizationalUnit> create(@RequestBody OrgUnitCreateDto dto) {
        return ResponseEntity.ok(orgUnitService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageOrgUnit(#id)")
    public ResponseEntity<OrganizationalUnit> update(@PathVariable UUID id, @RequestBody OrgUnitCreateDto dto) {
        return ResponseEntity.ok(orgUnitService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@securityAclService.canManageOrgUnit(#id)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        orgUnitService.delete(id);
        return ResponseEntity.ok().build();
    }
}
