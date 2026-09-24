package ga.gabedt.dashboard;

import ga.gabedt.dashboard.dto.ActivityDto;
import ga.gabedt.dashboard.dto.DashboardStatsDto;
import ga.gabedt.timetable.Course;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.enums.EventStatus;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.resource.Subject;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.TeacherRepository;
import ga.gabedt.resource.repository.RoomRepository;
import ga.gabedt.resource.repository.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceTest {

    @Mock
    private ScheduleEventRepository scheduleEventRepository;
    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void getStats_ReturnsExpectedStats() {
        // Arrange
        when(teacherRepository.countByDeletedFalse()).thenReturn(10L);
        when(studentRepository.countByDeletedFalse()).thenReturn(500L);
        when(roomRepository.countByDeletedFalse()).thenReturn(20L);
        when(subjectRepository.countByDeletedFalse()).thenReturn(30L);
        when(scheduleEventRepository.countByStatusInAndDeletedFalse(
                Arrays.asList(EventStatus.POSTPONED, EventStatus.MOVED)))
                .thenReturn(10L);

        ScheduleEvent event1 = new ScheduleEvent();
        event1.setId(UUID.randomUUID());
        event1.setUpdatedAt(LocalDateTime.now().minusHours(1));
        Course course1 = new Course();
        Subject s1 = new Subject();
        s1.setName("Maths");
        course1.setSubject(s1);
        event1.setCourse(course1);

        ScheduleEvent event2 = new ScheduleEvent();
        event2.setId(UUID.randomUUID());
        event2.setUpdatedAt(LocalDateTime.now().minusHours(2));
        Course course2 = new Course();
        Subject s2 = new Subject();
        s2.setName("Physique");
        course2.setSubject(s2);
        event2.setCourse(course2);

        when(scheduleEventRepository.findTop5ByDeletedFalseOrderByUpdatedAtDesc())
                .thenReturn(Arrays.asList(event1, event2));

        // Act
        DashboardStatsDto stats = dashboardService.getDashboardStats();

        // Assert
        assertNotNull(stats);
        assertEquals(10L, stats.getTeacherCount());
        assertEquals(500L, stats.getStudentCount());
        assertEquals(10L, stats.getRescheduledCount());
        
        // Assert recent activity
        assertNotNull(stats.getRecentActivity());
        assertEquals(2, stats.getRecentActivity().size());
        
        ActivityDto activity1 = stats.getRecentActivity().get(0);
        assertEquals("UPDATE", activity1.getType());
        assertEquals("Mise à jour de Maths", activity1.getText());
        
        ActivityDto activity2 = stats.getRecentActivity().get(1);
        assertEquals("UPDATE", activity2.getType());
        assertEquals("Mise à jour de Physique", activity2.getText());
    }
}
