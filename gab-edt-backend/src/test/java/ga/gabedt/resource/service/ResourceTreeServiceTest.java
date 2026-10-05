package ga.gabedt.resource.service;

import ga.gabedt.resource.Room;
import ga.gabedt.resource.dto.ResourceTreeDto;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.InstitutionType;
import ga.gabedt.structure.OrgUnitType;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceTreeServiceTest {

    @Mock
    private ga.gabedt.tenant.CurrentTenant currentTenant;

    @Mock
    private OrganizationalUnitRepository organizationalUnitRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private ResourceTreeService resourceTreeService;

    private Institution institution;
    private OrganizationalUnit orgUnit;

    @BeforeEach
    void setUp() {
        institution = new Institution();
        institution.setId(UUID.randomUUID());
        institution.setName("ESGI");
        institution.setType(InstitutionType.UNIVERSITY);

        orgUnit = new OrganizationalUnit();
        orgUnit.setId(UUID.randomUUID());
        orgUnit.setName("Informatique");
        orgUnit.setType(OrgUnitType.DEPARTMENT);
    }

    @Test
    void getResourceTree_ShouldFail_WhenNoInstitutionInContext() {
        when(currentTenant.requireInstitution()).thenThrow(new ga.gabedt.common.exception.UnauthorizedAccessException("Aucun établissement"));

        assertThrows(ga.gabedt.common.exception.UnauthorizedAccessException.class, () -> resourceTreeService.getResourceTree());
    }

    @Test
    void getResourceTree_ShouldReturnTreeWithOrgUnitsAndResources() {
        User user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");

        Teacher teacher = new Teacher();
        teacher.setId(UUID.randomUUID());
        teacher.setUser(user);

        Room room = new Room();
        room.setId(UUID.randomUUID());
        room.setName("A101");

        when(currentTenant.requireInstitution()).thenReturn(institution);
        when(organizationalUnitRepository.findByInstitutionIdAndParentIsNull(institution.getId())).thenReturn(List.of(orgUnit));
        when(teacherRepository.findByOrgUnits_IdAndDeletedFalse(orgUnit.getId())).thenReturn(List.of(teacher));
        when(roomRepository.findByOrgUnitIdAndDeletedFalse(orgUnit.getId())).thenReturn(List.of(room));

        ResourceTreeDto result = resourceTreeService.getResourceTree();

        assertNotNull(result.getInstitution());
        assertEquals("ESGI", result.getInstitution().getName());
        assertEquals(1, result.getInstitution().getRootUnits().size());
        
        ResourceTreeDto.OrgUnitNode node = result.getInstitution().getRootUnits().get(0);
        assertEquals("Informatique", node.getName());
        assertEquals(2, node.getResources().size());
        
        boolean hasTeacher = node.getResources().stream().anyMatch(r -> "TEACHER".equals(r.getResourceType()));
        boolean hasRoom = node.getResources().stream().anyMatch(r -> "ROOM".equals(r.getResourceType()));
        
        assertTrue(hasTeacher);
        assertTrue(hasRoom);
    }
}
