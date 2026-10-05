package ga.gabedt.structure.service;

import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.dto.OrgUnitCreateDto;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrganizationalUnitServiceTest {

    @Mock
    private OrganizationalUnitRepository orgUnitRepository;

    @Mock
    private ga.gabedt.tenant.CurrentTenant currentTenant;

    @InjectMocks
    private OrganizationalUnitService organizationalUnitService;

    private OrganizationalUnit orgUnit;
    private Institution institution;

    @BeforeEach
    void setUp() {
        orgUnit = new OrganizationalUnit();
        orgUnit.setId(UUID.randomUUID());
        orgUnit.setName("Informatique");
        orgUnit.setType(ga.gabedt.structure.OrgUnitType.DEPARTMENT);
        orgUnit.setActive(true);

        institution = new Institution();
        institution.setId(UUID.randomUUID());
    }

    @Test
    void create_ShouldSaveAndReturnOrgUnit_WithFallbackInstitution() {
        OrgUnitCreateDto dto = new OrgUnitCreateDto();
        dto.setName("Mathématiques");
        dto.setType(ga.gabedt.structure.OrgUnitType.DEPARTMENT);

        when(currentTenant.requireInstitution()).thenReturn(institution);
        when(orgUnitRepository.save(any(OrganizationalUnit.class))).thenAnswer(i -> i.getArguments()[0]);

        OrganizationalUnit result = organizationalUnitService.create(dto);

        assertNotNull(result);
        assertEquals("Mathématiques", result.getName());
        assertEquals(institution, result.getInstitution());
        verify(orgUnitRepository, times(1)).save(any(OrganizationalUnit.class));
    }

    @Test
    void create_ShouldSaveAndReturnOrgUnit_WithParent() {
        OrgUnitCreateDto dto = new OrgUnitCreateDto();
        dto.setName("L1 Info");
        dto.setType(ga.gabedt.structure.OrgUnitType.CLASS);
        dto.setParentId(orgUnit.getId());

        when(currentTenant.requireInstitution()).thenReturn(institution);
        when(orgUnitRepository.findById(orgUnit.getId())).thenReturn(Optional.of(orgUnit));
        when(orgUnitRepository.save(any(OrganizationalUnit.class))).thenAnswer(i -> i.getArguments()[0]);

        OrganizationalUnit result = organizationalUnitService.create(dto);

        assertNotNull(result);
        assertEquals("L1 Info", result.getName());
        assertEquals(orgUnit, result.getParent());
    }

    @Test
    void update_ShouldUpdateAndReturnOrgUnit() {
        OrgUnitCreateDto dto = new OrgUnitCreateDto();
        dto.setName("Département Info");

        when(orgUnitRepository.findById(orgUnit.getId())).thenReturn(Optional.of(orgUnit));
        when(orgUnitRepository.save(any(OrganizationalUnit.class))).thenAnswer(i -> i.getArguments()[0]);

        OrganizationalUnit result = organizationalUnitService.update(orgUnit.getId(), dto);

        assertEquals("Département Info", result.getName());
    }

    @Test
    void delete_ShouldMarkAsInactive() {
        when(orgUnitRepository.findById(orgUnit.getId())).thenReturn(Optional.of(orgUnit));

        organizationalUnitService.delete(orgUnit.getId());

        assertFalse(orgUnit.isActive());
        verify(orgUnitRepository, times(1)).save(orgUnit);
    }
}
