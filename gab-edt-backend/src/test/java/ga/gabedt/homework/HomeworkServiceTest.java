package ga.gabedt.homework;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HomeworkServiceTest {

    @Mock
    private HomeworkRepository homeworkRepository;

    @Mock
    private HomeworkStatusRepository homeworkStatusRepository;

    @Mock
    private ScheduleEventRepository scheduleEventRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private HomeworkService homeworkService;

    private ScheduleEvent event;
    private Homework homework;
    private User user;
    private Student student;

    @org.junit.jupiter.api.AfterEach

    void clearSecurityContext() {

        org.springframework.security.core.context.SecurityContextHolder.clearContext();

    }


    @BeforeEach
    void setUp() {
        event = new ScheduleEvent();
        event.setId(UUID.randomUUID());

        homework = new Homework();
        homework.setId(UUID.randomUUID());
        homework.setScheduleEvent(event);
        homework.setTitle("Math Homework");

        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("student@gab.ga");

        student = new Student();
        student.setId(UUID.randomUUID());
        student.setUser(user);
    }

    private void mockAuthentication() {
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(user.getEmail());
        SecurityContextHolder.setContext(securityContext);
        when(userRepository.findByEmailAndDeletedFalse(user.getEmail())).thenReturn(Optional.of(user));
        when(studentRepository.findByUserIdAndDeletedFalse(user.getId())).thenReturn(Optional.of(student));
    }

    @Test
    void addHomework_ShouldSaveAndReturnHomework() {
        HomeworkDto dto = new HomeworkDto(null, "Math Homework", "Do exercises 1-5", false);
        when(scheduleEventRepository.findById(event.getId())).thenReturn(Optional.of(event));
        when(homeworkRepository.save(any(Homework.class))).thenAnswer(i -> i.getArguments()[0]);

        HomeworkDto result = homeworkService.addHomework(event.getId(), dto);

        assertNotNull(result);
        assertEquals("Math Homework", result.getTitle());
        assertEquals("Do exercises 1-5", result.getDescription());
        verify(homeworkRepository, times(1)).save(any(Homework.class));
    }

    @Test
    void addHomework_ShouldThrowException_WhenEventNotFound() {
        HomeworkDto dto = new HomeworkDto();
        when(scheduleEventRepository.findById(event.getId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> homeworkService.addHomework(event.getId(), dto));
    }

    @Test
    void toggleStatus_ShouldCreateNewStatus_WhenNotExists() {
        mockAuthentication();
        when(homeworkRepository.findById(homework.getId())).thenReturn(Optional.of(homework));
        when(homeworkStatusRepository.findByHomeworkIdAndStudentIdAndDeletedFalse(homework.getId(), student.getId()))
                .thenReturn(Optional.empty());

        homeworkService.toggleStatus(homework.getId(), true);

        verify(homeworkStatusRepository, times(1)).save(argThat(status -> status.isCompleted()));
    }

    @Test
    void toggleStatus_ShouldUpdateExistingStatus() {
        mockAuthentication();
        when(homeworkRepository.findById(homework.getId())).thenReturn(Optional.of(homework));
        
        HomeworkStatus existingStatus = new HomeworkStatus();
        existingStatus.setCompleted(false);
        when(homeworkStatusRepository.findByHomeworkIdAndStudentIdAndDeletedFalse(homework.getId(), student.getId()))
                .thenReturn(Optional.of(existingStatus));

        homeworkService.toggleStatus(homework.getId(), true);

        assertTrue(existingStatus.isCompleted());
        verify(homeworkStatusRepository, times(1)).save(existingStatus);
    }

    @Test
    void toggleStatus_ShouldThrowException_WhenNotAuthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedAccessException.class, () -> homeworkService.toggleStatus(homework.getId(), true));
    }
}
