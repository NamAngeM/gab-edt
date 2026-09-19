package ga.gabedt.structure.service;

import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.dto.OrgUnitCreateDto;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationalUnitService {

    private final OrganizationalUnitRepository orgUnitRepository;
    private final InstitutionRepository institutionRepository;

    @Transactional
    public OrganizationalUnit create(OrgUnitCreateDto dto) {
        OrganizationalUnit unit = new OrganizationalUnit();
        unit.setName(dto.getName());
        unit.setType(dto.getType());
        
        // MVP: fallback to the first institution if not provided or context isn't strict
        Institution institution;
        if (dto.getInstitutionId() != null) {
            institution = institutionRepository.findById(dto.getInstitutionId())
                    .orElseThrow(() -> new RuntimeException("Institution not found"));
        } else {
            institution = institutionRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No institution available"));
        }
        
        unit.setInstitution(institution);

        if (dto.getParentId() != null) {
            OrganizationalUnit parent = orgUnitRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent OrgUnit not found"));
            unit.setParent(parent);
        }

        return orgUnitRepository.save(unit);
    }

    @Transactional
    public OrganizationalUnit update(UUID id, OrgUnitCreateDto dto) {
        OrganizationalUnit unit = orgUnitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrgUnit not found"));
        unit.setName(dto.getName());
        if (dto.getType() != null) {
            unit.setType(dto.getType());
        }
        return orgUnitRepository.save(unit);
    }

    @Transactional
    public void delete(UUID id) {
        OrganizationalUnit unit = orgUnitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrgUnit not found"));
        // cascading deletion is managed by soft-delete or JPA cascade based on implementation
        unit.setActive(false);
        orgUnitRepository.save(unit);
    }
}
