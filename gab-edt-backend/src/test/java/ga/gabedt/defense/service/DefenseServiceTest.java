package ga.gabedt.defense.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.defense.Defense;
import ga.gabedt.defense.dto.DefenseCreateDto;
import ga.gabedt.defense.dto.DefenseDto;
import ga.gabedt.defense.repository.DefenseRepository;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefenseServiceTest {

    @Mock
    private DefenseRepository defenseRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private ga.gabedt.tenant.CurrentTenant currentTenant;

    @Mock
    private ga.gabedt.timetable.service.PlanningConflictService planningConflictService;

    @InjectMocks
    private DefenseService defenseService;

    private Defense defense;
    private Student student;
    private Teacher teacher;
    private Room room;
    private Institution institution;

    @BeforeEach
    void setUp() {
        institution = new Institution();
        institution.setId(UUID.randomUUID());

        User studentUser = new User();
        studentUser.setId(UUID.randomUUID());
        studentUser.setFirstName("Jane");
        studentUser.setLastName("Doe");
        
        student = new Student();
        student.setId(UUID.randomUUID());
        student.setUser(studentUser);

        User teacherUser = new User();
        teacherUser.setId(UUID.randomUUID());
        teacherUser.setFirstName("Dr.");
        teacherUser.setLastName("Smith");

        teacher = new Teacher();
        teacher.setId(UUID.randomUUID());
        teacher.setUser(teacherUser);

        room = new Room();
        room.setId(UUID.randomUUID());
        room.setName("Amphi A");

        defense = new Defense();
        defense.setId(UUID.randomUUID());
        defense.setStudent(student);
        defense.setTopic("AI Research");
        defense.setRoom(room);
        defense.setPresident(teacher);
        defense.setExaminer(teacher);
        defense.setReporter(teacher);
        defense.setStartAt(LocalDateTime.now());
        defense.setEndAt(LocalDateTime.now().plusHours(1));
    }

    @Test
    void getAllDefenses_ShouldReturnList() {
        when(defenseRepository.findByDeletedFalse()).thenReturn(List.of(defense));

        List<DefenseDto> result = defenseService.getAllDefenses();

        assertEquals(1, result.size());
        assertEquals("AI Research", result.get(0).topic());
        assertEquals("Jane Doe", result.get(0).studentName());
    }

    @Test
    void createDefense_ShouldSaveAndReturnDto() {
        DefenseCreateDto dto = new DefenseCreateDto(student.getId(), "Quantum Physics", room.getId(), LocalDateTime.now(), LocalDateTime.now().plusHours(1), teacher.getId(), teacher.getId(), teacher.getId());

        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(currentTenant.requireInstitution()).thenReturn(institution);
        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));
        when(teacherRepository.findById(teacher.getId())).thenReturn(Optional.of(teacher));
        when(defenseRepository.save(any(Defense.class))).thenAnswer(i -> i.getArguments()[0]);

        DefenseDto result = defenseService.createDefense(dto);

        assertNotNull(result);
        assertEquals("Quantum Physics", result.topic());
        verify(planningConflictService).validateDefense(eq(room.getId()), eq(teacher.getId()), eq(teacher.getId()), eq(teacher.getId()), any(), any(), any());
        verify(defenseRepository, times(1)).save(any(Defense.class));
    }

    @Test
    void createDefense_ShouldThrowException_WhenStudentNotFound() {
        DefenseCreateDto dto = new DefenseCreateDto(UUID.randomUUID(), "Quantum Physics", null, LocalDateTime.now(), LocalDateTime.now().plusHours(1), null, null, null);
        when(studentRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> defenseService.createDefense(dto));
    }

    @Test
    void deleteDefense_ShouldMarkAsDeleted() {
        when(defenseRepository.findById(defense.getId())).thenReturn(Optional.of(defense));

        defenseService.deleteDefense(defense.getId());

        assertTrue(defense.isDeleted());
        verify(defenseRepository, times(1)).save(defense);
    }
}
