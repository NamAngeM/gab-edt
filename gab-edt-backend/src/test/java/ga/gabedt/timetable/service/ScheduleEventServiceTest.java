package ga.gabedt.timetable.service;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.common.exception.ScheduleConflictException;
import ga.gabedt.notification.NotificationService;
import ga.gabedt.resource.Room;
import ga.gabedt.resource.Subject;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.resource.repository.SubjectRepository;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.structure.repository.InstitutionRepository;
import ga.gabedt.structure.repository.OrganizationalUnitRepository;
import ga.gabedt.timetable.Course;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.dto.ScheduleEventCreateDto;
import ga.gabedt.timetable.dto.ScheduleEventDto;
import ga.gabedt.timetable.enums.EventStatus;
import ga.gabedt.timetable.repository.CourseRepository;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.Teacher;
import ga.gabedt.user.User;
import ga.gabedt.user.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ScheduleEventServiceTest {

    @Mock
    private ScheduleEventRepository scheduleEventRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private OrganizationalUnitRepository orgUnitRepository;
    @Mock
    private InstitutionRepository institutionRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ScheduleEventService scheduleEventService;

    private ScheduleEventCreateDto createDto;
    private UUID teacherId;
    private UUID roomId;
    private UUID orgUnitId;
    private UUID subjectId;
    private Teacher teacher;
    private Room room;
    private OrganizationalUnit orgUnit;
    private Subject subject;
    private Course course;
    private Institution institution;

    @BeforeEach
    void setUp() {
        teacherId = UUID.randomUUID();
        roomId = UUID.randomUUID();
        orgUnitId = UUID.randomUUID();
        subjectId = UUID.randomUUID();

        createDto = new ScheduleEventCreateDto();
        createDto.setTeacherId(teacherId);
        createDto.setRoomId(roomId);
        createDto.setOrgUnitId(orgUnitId);
        createDto.setSubjectId(subjectId);
        createDto.setStartAt(LocalDateTime.now().plusDays(1).withHour(8).withMinute(0));
        createDto.setEndAt(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        createDto.setStatus(EventStatus.SCHEDULED);

        teacher = new Teacher();
        teacher.setId(teacherId);
        User u = new User();
        u.setFirstName("Prof");
        u.setLastName("X");
        teacher.setUser(u);

        room = new Room();
        room.setId(roomId);
        room.setName("Salle 1");

        orgUnit = new OrganizationalUnit();
        orgUnit.setId(orgUnitId);
        orgUnit.setName("Classe A");

        subject = new Subject();
        subject.setId(subjectId);
        subject.setName("Mathématiques");

        institution = new Institution();
        institution.setId(UUID.randomUUID());

        course = new Course();
        course.setId(UUID.randomUUID());
        course.setSubject(subject);
        course.setTeacher(teacher);
        course.setOrgUnit(orgUnit);
        course.setInstitution(institution);
    }

    @Test
    void createEvent_Success() {
        // Arrange
        when(scheduleEventRepository.existsOverlappingForTeacher(eq(teacherId), any(), any())).thenReturn(false);
        when(scheduleEventRepository.existsOverlappingForRoom(eq(roomId), any(), any())).thenReturn(false);
        when(scheduleEventRepository.existsOverlappingForOrgUnit(eq(orgUnitId), any(), any())).thenReturn(false);

        when(courseRepository.findBySubjectIdAndTeacherIdAndOrgUnitIdAndDeletedFalse(subjectId, teacherId, orgUnitId))
                .thenReturn(Optional.of(course));

        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(teacher));
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        
        when(scheduleEventRepository.save(any(ScheduleEvent.class))).thenAnswer(invocation -> {
            ScheduleEvent e = invocation.getArgument(0);
            e.setId(UUID.randomUUID());
            return e;
        });

        // Act
        ScheduleEventDto result = scheduleEventService.createEvent(createDto);

        // Assert
        assertNotNull(result);
        assertEquals(subjectId, result.getSubject().getId());
        assertEquals(teacherId, result.getTeacher().getId());
        assertEquals(roomId, result.getRoom().getId());
        assertEquals(orgUnitId, result.getGroup().getId());

        verify(notificationService).sendAdminAlert(anyString(), anyString(), anyString());
    }

    @Test
    void createEvent_Conflict_TeacherOccupied() {
        // Arrange
        when(scheduleEventRepository.existsOverlappingForTeacher(eq(teacherId), any(), any())).thenReturn(true);

        // Act & Assert
        ScheduleConflictException exception = assertThrows(ScheduleConflictException.class, 
            () -> scheduleEventService.createEvent(createDto));
            
        assertEquals("L'enseignant est déjà occupé sur cette plage horaire.", exception.getMessage());
        verify(scheduleEventRepository, never()).save(any());
    }
    
    @Test
    void createEvent_Conflict_RoomOccupied() {
        // Arrange
        when(scheduleEventRepository.existsOverlappingForTeacher(eq(teacherId), any(), any())).thenReturn(false);
        when(scheduleEventRepository.existsOverlappingForRoom(eq(roomId), any(), any())).thenReturn(true);

        // Act & Assert
        ScheduleConflictException exception = assertThrows(ScheduleConflictException.class, 
            () -> scheduleEventService.createEvent(createDto));
            
        assertEquals("La salle est déjà réservée sur cette plage horaire.", exception.getMessage());
        verify(scheduleEventRepository, never()).save(any());
    }
}
