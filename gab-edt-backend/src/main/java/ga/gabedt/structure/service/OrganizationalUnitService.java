package ga.gabedt.structure.service;

import ga.gabedt.common.exception.BusinessConflictException;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.dto.OrgUnitCreateDto;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationalUnitService {

    private final OrganizationalUnitRepository orgUnitRepository;
    private final ga.gabedt.tenant.CurrentTenant currentTenant;

    @Transactional
    public OrganizationalUnit create(OrgUnitCreateDto dto) {
        OrganizationalUnit unit = new OrganizationalUnit();
        unit.setName(dto.getName());
        unit.setType(dto.getType());
        
        Institution institution = currentTenant.requireInstitution();
        unit.setInstitution(institution);
        unit.setTenantId(institution.getId());

        if (dto.getParentId() != null) {
            OrganizationalUnit parent = orgUnitRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ga.gabedt.common.exception.ResourceNotFoundException("Unité parente introuvable"));
            unit.setParent(parent);
        }

        return orgUnitRepository.save(unit);
    }

    @Transactional
    public OrganizationalUnit update(UUID id, OrgUnitCreateDto dto) {
        OrganizationalUnit unit = orgUnitRepository.findById(id)
                .orElseThrow(() -> new ga.gabedt.common.exception.ResourceNotFoundException("Unité organisationnelle introuvable"));
        unit.setName(dto.getName());
        if (dto.getType() != null) {
            unit.setType(dto.getType());
        }
        return orgUnitRepository.save(unit);
    }

    @Transactional
    public void delete(UUID id) {
        OrganizationalUnit unit = orgUnitRepository.findById(id)
                .orElseThrow(() -> new ga.gabedt.common.exception.ResourceNotFoundException("Unité organisationnelle introuvable"));
        if (orgUnitRepository.existsByParentIdAndActiveTrue(id)) {
            throw new BusinessConflictException("ORG_UNIT_HAS_CHILDREN", "Supprimez ou déplacez d'abord les sous-unités de cette unité.");
        }
        unit.setActive(false);
        orgUnitRepository.save(unit);
    }
}
