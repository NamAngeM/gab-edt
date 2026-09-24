package ga.gabedt.user.service;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import ga.gabedt.user.dto.TeacherAdminDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationalUnitRepository organizationalUnitRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private TeacherService teacherService;

    private Teacher teacher;
    private User user;
    private Institution institution;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("teacher@gab.ga");
        user.setFirstName("Alice");
        user.setLastName("Smith");
        user.setActive(true);

        teacher = new Teacher();
        teacher.setId(UUID.randomUUID());
        teacher.setUser(user);
        teacher.setEmployeeNumber("TCH-123");

        institution = new Institution();
        institution.setId(UUID.randomUUID());
    }

    @Test
    void findById_ShouldReturnTeacher_WhenFound() {
        when(teacherRepository.findById(teacher.getId())).thenReturn(Optional.of(teacher));

        TeacherAdminDto result = teacherService.findById(teacher.getId());

        assertNotNull(result);
        assertEquals("TCH-123", result.getEmployeeNumber());
        assertEquals("teacher@gab.ga", result.getEmail());
    }

    @Test
    void findById_ShouldThrowException_WhenNotFoundOrDeleted() {
        when(teacherRepository.findById(teacher.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> teacherService.findById(teacher.getId()));
    }

    @Test
    void create_ShouldSaveUserAndTeacher() {
        TeacherAdminDto dto = new TeacherAdminDto();
        dto.setEmail("new.teacher@gab.ga");
        dto.setFirstName("Bob");
        dto.setEmployeeNumber("TCH-999");
        UUID orgUnitId = UUID.randomUUID();
        dto.setOrgUnitIds(List.of(orgUnitId));

        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(institutionRepository.findAll()).thenReturn(List.of(institution));
        
        OrganizationalUnit unit = new OrganizationalUnit();
        unit.setId(orgUnitId);
        when(organizationalUnitRepository.findAllById(dto.getOrgUnitIds())).thenReturn(List.of(unit));
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(i -> i.getArguments()[0]);

        TeacherAdminDto result = teacherService.create(dto);

        assertNotNull(result);
        assertEquals("TCH-999", result.getEmployeeNumber());
        assertEquals("new.teacher@gab.ga", result.getEmail());
        assertNotNull(result.getOrgUnitIds());
        assertEquals(1, result.getOrgUnitIds().size());
        
        verify(userRepository, times(1)).save(any(User.class));
        verify(teacherRepository, times(1)).save(any(Teacher.class));
    }

    @Test
    void update_ShouldUpdateUserAndTeacher() {
        when(teacherRepository.findById(teacher.getId())).thenReturn(Optional.of(teacher));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(i -> i.getArguments()[0]);

        TeacherAdminDto dto = new TeacherAdminDto();
        dto.setFirstName("AliceUpdated");
        dto.setEmployeeNumber("TCH-123-UPDATED");

        TeacherAdminDto result = teacherService.update(teacher.getId(), dto);

        assertEquals("AliceUpdated", result.getFirstName());
        assertEquals("TCH-123-UPDATED", result.getEmployeeNumber());
    }

    @Test
    void delete_ShouldMarkAsDeleted() {
        when(teacherRepository.findById(teacher.getId())).thenReturn(Optional.of(teacher));

        teacherService.delete(teacher.getId());

        assertTrue(teacher.isDeleted());
        assertTrue(user.isDeleted());
        verify(teacherRepository, times(1)).save(teacher);
        verify(userRepository, times(1)).save(user);
    }
}
