package ga.gabedt.resource.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.dto.RoomAdminDto;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private OrganizationalUnitRepository organizationalUnitRepository;

    @Mock
    private ga.gabedt.tenant.CurrentTenant currentTenant;

    @InjectMocks
    private RoomService roomService;

    private Room room;
    private Institution institution;

    @BeforeEach
    void setUp() {
        room = new Room();
        room.setId(UUID.randomUUID());
        room.setName("Room 101");
        room.setCode("R-101");
        room.setCapacity(30);
        room.setType("CLASSROOM");
        room.setActive(true);

        institution = new Institution();
        institution.setId(UUID.randomUUID());
    }

    @Test
    void findById_ShouldReturnRoom_WhenFound() {
        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));

        RoomAdminDto result = roomService.findById(room.getId());

        assertNotNull(result);
        assertEquals("Room 101", result.getName());
        assertEquals("R-101", result.getCode());
        assertEquals(30, result.getCapacity());
    }

    @Test
    void findById_ShouldThrowException_WhenNotFoundOrDeleted() {
        when(roomRepository.findById(room.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> roomService.findById(room.getId()));
    }

    @Test
    void create_ShouldSaveAndReturnRoom() {
        RoomAdminDto dto = new RoomAdminDto();
        dto.setName("Room 202");
        dto.setCode("R-202");
        dto.setCapacity(50);
        dto.setType("AMPHI");
        UUID orgUnitId = UUID.randomUUID();
        dto.setOrgUnitId(orgUnitId);

        when(currentTenant.requireInstitution()).thenReturn(institution);
        
        OrganizationalUnit unit = new OrganizationalUnit();
        unit.setId(orgUnitId);
        when(organizationalUnitRepository.findById(orgUnitId)).thenReturn(Optional.of(unit));
        when(roomRepository.save(any(Room.class))).thenAnswer(i -> i.getArguments()[0]);

        RoomAdminDto result = roomService.create(dto);

        assertNotNull(result);
        assertEquals("Room 202", result.getName());
        assertEquals("AMPHI", result.getType());
        assertEquals(50, result.getCapacity());
        
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    void update_ShouldUpdateAndReturnRoom() {
        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));
        when(roomRepository.save(any(Room.class))).thenAnswer(i -> i.getArguments()[0]);

        RoomAdminDto dto = new RoomAdminDto();
        dto.setName("Room 101-UPDATED");
        dto.setCode("R-101-UP");

        RoomAdminDto result = roomService.update(room.getId(), dto);

        assertEquals("Room 101-UPDATED", result.getName());
        assertEquals("R-101-UP", result.getCode());
    }

    @Test
    void delete_ShouldMarkAsDeleted() {
        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));

        roomService.delete(room.getId());

        assertTrue(room.isDeleted());
        verify(roomRepository, times(1)).save(room);
    }
}
