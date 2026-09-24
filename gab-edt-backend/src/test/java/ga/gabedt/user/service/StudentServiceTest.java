package ga.gabedt.user.service;

import ga.gabedt.common.enums.UserRole;
import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import ga.gabedt.user.dto.StudentAdminDto;
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
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationalUnitRepository organizationalUnitRepository;

    @Mock
    private InstitutionRepository institutionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private StudentService studentService;

    private Student student;
    private User user;
    private Institution institution;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("student@gab.ga");
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setActive(true);

        student = new Student();
        student.setId(UUID.randomUUID());
        student.setUser(user);
        student.setStudentNumber("STU-123");

        institution = new Institution();
        institution.setId(UUID.randomUUID());
    }

    @Test
    void findById_ShouldReturnStudent_WhenFound() {
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));

        StudentAdminDto result = studentService.findById(student.getId());

        assertNotNull(result);
        assertEquals("STU-123", result.getStudentNumber());
        assertEquals("student@gab.ga", result.getEmail());
    }

    @Test
    void findById_ShouldThrowException_WhenNotFoundOrDeleted() {
        when(studentRepository.findById(student.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studentService.findById(student.getId()));
    }

    @Test
    void create_ShouldSaveUserAndStudent() {
        StudentAdminDto dto = new StudentAdminDto();
        dto.setEmail("new@gab.ga");
        dto.setFirstName("Jane");
        dto.setStudentNumber("STU-999");
        UUID orgUnitId = UUID.randomUUID();
        dto.setOrgUnitIds(List.of(orgUnitId));

        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(institutionRepository.findAll()).thenReturn(List.of(institution));
        
        OrganizationalUnit unit = new OrganizationalUnit();
        unit.setId(orgUnitId);
        when(organizationalUnitRepository.findAllById(dto.getOrgUnitIds())).thenReturn(List.of(unit));
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArguments()[0]);

        StudentAdminDto result = studentService.create(dto);

        assertNotNull(result);
        assertEquals("STU-999", result.getStudentNumber());
        assertEquals("new@gab.ga", result.getEmail());
        assertNotNull(result.getOrgUnitIds());
        assertEquals(1, result.getOrgUnitIds().size());
        
        verify(userRepository, times(1)).save(any(User.class));
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void update_ShouldUpdateUserAndStudent() {
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);
        when(studentRepository.save(any(Student.class))).thenAnswer(i -> i.getArguments()[0]);

        StudentAdminDto dto = new StudentAdminDto();
        dto.setFirstName("JohnUpdated");
        dto.setStudentNumber("STU-123-UPDATED");

        StudentAdminDto result = studentService.update(student.getId(), dto);

        assertEquals("JohnUpdated", result.getFirstName());
        assertEquals("STU-123-UPDATED", result.getStudentNumber());
    }

    @Test
    void delete_ShouldMarkAsDeleted() {
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));

        studentService.delete(student.getId());

        assertTrue(student.isDeleted());
        assertTrue(user.isDeleted());
        verify(studentRepository, times(1)).save(student);
        verify(userRepository, times(1)).save(user);
    }
}
