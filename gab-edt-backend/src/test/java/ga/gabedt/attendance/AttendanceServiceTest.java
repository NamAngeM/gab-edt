package ga.gabedt.attendance;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.notification.NotificationService;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.resource.Subject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ga.gabedt.structure.OrganizationalUnit;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private ScheduleEventRepository scheduleEventRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ga.gabedt.user.UserRepository userRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private ScheduleEvent event;
    private Student student;
    private UUID eventId;
    private UUID studentId;
    private UUID orgUnitId;

    @org.junit.jupiter.api.AfterEach
    void clearSecurityContext() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @BeforeEach
    void setUp() {
        // saveAttendance enregistre l'auteur de l'appel : il faut un utilisateur authentifié
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("prof@ecole.com", null, List.of()));
        eventId = UUID.randomUUID();
        studentId = UUID.randomUUID();
        orgUnitId = UUID.randomUUID();

        OrganizationalUnit orgUnit = new OrganizationalUnit();
        orgUnit.setId(orgUnitId);

        Subject subject = new Subject();
        subject.setName("Mathématiques");
        
        ga.gabedt.timetable.Course course = new ga.gabedt.timetable.Course();
        course.setSubject(subject);

        event = new ScheduleEvent();
        event.setId(eventId);
        event.setDeleted(false);
        event.setOrgUnit(orgUnit);
        event.setCourse(course);

        User user = new User();
        user.setFirstName("Jean");
        user.setLastName("Dupont");

        student = new Student();
        student.setId(studentId);
        student.setUser(user);
        student.setStudentNumber("STU-1234");
    }

    @Test
    void getAttendance_shouldReturnDefaultPresent_whenNoRecordsExist() {
        // Arrange
        when(scheduleEventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(studentRepository.findByOrgUnits_IdAndDeletedFalse(orgUnitId)).thenReturn(List.of(student));
        when(attendanceRepository.findByScheduleEventIdAndDeletedFalse(eventId)).thenReturn(List.of());

        // Act
        List<AttendanceDto> result = attendanceService.getAttendance(eventId);

        // Assert
        assertEquals(1, result.size());
        assertEquals(studentId, result.get(0).getStudentId());
        assertEquals(AttendanceStatus.PRESENT, result.get(0).getStatus());
    }

    @Test
    void getAttendance_shouldReturnExistingStatus() {
        // Arrange
        Attendance existing = new Attendance();
        existing.setStudent(student);
        existing.setStatus(AttendanceStatus.ABSENT);

        when(scheduleEventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(studentRepository.findByOrgUnits_IdAndDeletedFalse(orgUnitId)).thenReturn(List.of(student));
        when(attendanceRepository.findByScheduleEventIdAndDeletedFalse(eventId)).thenReturn(List.of(existing));

        // Act
        List<AttendanceDto> result = attendanceService.getAttendance(eventId);

        // Assert
        assertEquals(1, result.size());
        assertEquals(AttendanceStatus.ABSENT, result.get(0).getStatus());
    }

    @Test
    void getAttendance_shouldThrowException_whenEventNotFound() {
        // Arrange
        when(scheduleEventRepository.findById(eventId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> attendanceService.getAttendance(eventId));
    }

    @Test
    void saveAttendance_shouldSaveNewRecordAndNotify_whenAbsent() {
        // Arrange
        when(scheduleEventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(attendanceRepository.findByScheduleEventIdAndDeletedFalse(eventId)).thenReturn(List.of());
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        AttendanceUpdateDto update = new AttendanceUpdateDto();
        update.setStudentId(studentId);
        update.setStatus(AttendanceStatus.ABSENT);

        // Act
        attendanceService.saveAttendance(eventId, List.of(update));

        // Assert
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
        verify(notificationService, times(1)).sendPersonalAlert(
                eq(student), 
                eq("Avis d'absence"), 
                contains("noté(e) ABSENT(E) au cours de Mathématiques"), 
                eq("ERROR")
        );
    }

    @Test
    void saveAttendance_shouldNotNotify_whenPresent() {
        // Arrange
        when(scheduleEventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(attendanceRepository.findByScheduleEventIdAndDeletedFalse(eventId)).thenReturn(List.of());
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(student));

        AttendanceUpdateDto update = new AttendanceUpdateDto();
        update.setStudentId(studentId);
        update.setStatus(AttendanceStatus.PRESENT);

        // Act
        attendanceService.saveAttendance(eventId, List.of(update));

        // Assert
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
        verify(notificationService, never()).sendPersonalAlert(any(), any(), any(), any());
    }

    @Test
    void saveAttendance_shouldNotify_whenStatusChangesToAbsent() {
        // Arrange
        Attendance existing = new Attendance();
        existing.setStudent(student);
        existing.setStatus(AttendanceStatus.PRESENT);

        when(scheduleEventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(attendanceRepository.findByScheduleEventIdAndDeletedFalse(eventId)).thenReturn(List.of(existing));

        AttendanceUpdateDto update = new AttendanceUpdateDto();
        update.setStudentId(studentId);
        update.setStatus(AttendanceStatus.ABSENT);

        // Act
        attendanceService.saveAttendance(eventId, List.of(update));

        // Assert
        assertEquals(AttendanceStatus.ABSENT, existing.getStatus());
        verify(attendanceRepository, times(1)).save(existing);
        verify(notificationService, times(1)).sendPersonalAlert(any(), any(), any(), any());
    }
}
