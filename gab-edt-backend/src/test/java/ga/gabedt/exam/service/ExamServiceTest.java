package ga.gabedt.exam.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.exam.Exam;
import ga.gabedt.exam.ExamSession;
import ga.gabedt.exam.dto.ExamCreateDto;
import ga.gabedt.exam.dto.ExamDto;
import ga.gabedt.exam.dto.ExamSessionCreateDto;
import ga.gabedt.exam.dto.ExamSessionDto;
import ga.gabedt.exam.repository.ExamRepository;
import ga.gabedt.exam.repository.ExamSessionRepository;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    @Mock
    private ExamSessionRepository sessionRepository;

    @Mock
    private ExamRepository examRepository;

    @Mock
    private OrganizationalUnitRepository orgUnitRepository;

    @Mock
    private ga.gabedt.tenant.CurrentTenant currentTenant;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private ExamService examService;

    private ExamSession session;
    private Exam exam;
    private OrganizationalUnit orgUnit;
    private Institution institution;
    private Subject subject;
    private Room room;
    private Teacher teacher;

    @BeforeEach
    void setUp() {
        institution = new Institution();
        institution.setId(UUID.randomUUID());

        orgUnit = new OrganizationalUnit();
        orgUnit.setId(UUID.randomUUID());
        orgUnit.setName("Informatique");

        session = new ExamSession();
        session.setId(UUID.randomUUID());
        session.setName("Session 1");
        session.setOrgUnit(orgUnit);
        session.setInstitution(institution);
        session.setStartDate(LocalDate.now());
        session.setEndDate(LocalDate.now().plusDays(5));
        session.setPublished(true);

        subject = new Subject();
        subject.setId(UUID.randomUUID());
        subject.setName("Maths");

        room = new Room();
        room.setId(UUID.randomUUID());
        room.setName("A101");

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFirstName("John");
        user.setLastName("Doe");
        
        teacher = new Teacher();
        teacher.setId(UUID.randomUUID());
        teacher.setUser(user);

        exam = new Exam();
        exam.setId(UUID.randomUUID());
        exam.setSession(session);
        exam.setSubject(subject);
        exam.setRoom(room);
        exam.setSupervisors(Set.of(teacher));
        exam.setStartAt(LocalDateTime.now());
        exam.setEndAt(LocalDateTime.now().plusHours(2));
    }

    @Test
    void getAllSessions_ShouldReturnSessions() {
        when(sessionRepository.findByDeletedFalse()).thenReturn(List.of(session));

        List<ExamSessionDto> result = examService.getAllSessions();

        assertEquals(1, result.size());
        assertEquals("Session 1", result.get(0).name());
    }

    @Test
    void createSession_ShouldSaveAndReturnSession() {
        ExamSessionCreateDto dto = new ExamSessionCreateDto("Session 2", LocalDate.now(), LocalDate.now().plusDays(5), orgUnit.getId());

        when(orgUnitRepository.findById(orgUnit.getId())).thenReturn(Optional.of(orgUnit));
        when(currentTenant.requireInstitution()).thenReturn(institution);
        when(sessionRepository.save(any(ExamSession.class))).thenAnswer(i -> i.getArguments()[0]);

        ExamSessionDto result = examService.createSession(dto);

        assertNotNull(result);
        assertEquals("Session 2", result.name());
        verify(sessionRepository, times(1)).save(any(ExamSession.class));
    }

    @Test
    void createSession_ShouldThrowException_WhenOrgUnitNotFound() {
        ExamSessionCreateDto dto = new ExamSessionCreateDto("Session 2", LocalDate.now(), LocalDate.now().plusDays(5), UUID.randomUUID());
        when(orgUnitRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> examService.createSession(dto));
    }

    @Test
    void getExamsForSession_ShouldReturnExams() {
        when(examRepository.findBySessionIdAndDeletedFalse(session.getId())).thenReturn(List.of(exam));

        List<ExamDto> result = examService.getExamsForSession(session.getId());

        assertEquals(1, result.size());
        assertEquals("Maths", result.get(0).subjectName());
    }

    @Test
    void createExam_ShouldSaveAndReturnExam() {
        ExamCreateDto dto = new ExamCreateDto(session.getId(), subject.getId(), room.getId(), LocalDateTime.now(), LocalDateTime.now().plusHours(2), List.of(teacher.getId()));

        when(sessionRepository.findById(session.getId())).thenReturn(Optional.of(session));
        when(subjectRepository.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(roomRepository.findById(room.getId())).thenReturn(Optional.of(room));
        when(teacherRepository.findAllById(dto.supervisorIds())).thenReturn(List.of(teacher));
        when(examRepository.save(any(Exam.class))).thenAnswer(i -> i.getArguments()[0]);

        ExamDto result = examService.createExam(dto);

        assertNotNull(result);
        assertEquals("Maths", result.subjectName());
        assertEquals("A101", result.roomName());
        verify(examRepository, times(1)).save(any(Exam.class));
    }

    @Test
    void deleteExam_ShouldMarkAsDeleted() {
        when(examRepository.findById(exam.getId())).thenReturn(Optional.of(exam));

        examService.deleteExam(exam.getId());

        assertTrue(exam.isDeleted());
        verify(examRepository, times(1)).save(exam);
    }
}
