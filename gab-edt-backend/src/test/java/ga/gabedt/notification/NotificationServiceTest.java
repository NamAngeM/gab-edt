package ga.gabedt.notification;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.common.exception.UnauthorizedAccessException;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User user;
    private Student student;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("student@gab.ga");
        user.setExpoPushToken("ExponentPushToken[123]");

        student = new Student();
        student.setId(UUID.randomUUID());
        student.setUser(user);

        notification = new Notification();
        notification.setId(UUID.randomUUID());
        notification.setUser(user);
        notification.setTitle("Alert");
        notification.setMessage("Test message");
        notification.setType("INFO");
        notification.setRead(false);
    }

    private void mockAuthentication() {
        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(user.getEmail());
        SecurityContextHolder.setContext(securityContext);
        when(userRepository.findByEmailAndDeletedFalse(user.getEmail())).thenReturn(Optional.of(user));
    }

    @Test
    void sendAdminAlert_ShouldSendToAdminTopic() {
        notificationService.sendAdminAlert("Admin Title", "Admin Msg", "WARNING");

        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/admin-alerts"), any(java.util.Map.class));
    }

    @Test
    void sendClassAlert_ShouldSendToClassTopicAndSavePush() {
        UUID orgUnitId = UUID.randomUUID();
        when(studentRepository.findByOrgUnits_IdAndDeletedFalse(orgUnitId)).thenReturn(List.of(student));

        notificationService.sendClassAlert(orgUnitId, "Class Title", "Class Msg", "INFO");

        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/class-alerts/" + orgUnitId), any(java.util.Map.class));
        verify(notificationRepository, times(1)).save(any(Notification.class));
        // Push notification logic makes HTTP call, we shouldn't fail if we just verify interactions
    }

    @Test
    void getMyNotifications_ShouldReturnUserNotifications() {
        mockAuthentication();
        when(notificationRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId())).thenReturn(List.of(notification));

        List<NotificationDto> result = notificationService.getMyNotifications();

        assertEquals(1, result.size());
        assertEquals("Alert", result.get(0).getTitle());
    }

    @Test
    void getMyNotifications_ShouldThrowException_WhenNotAuthenticated() {
        SecurityContextHolder.clearContext();
        assertThrows(UnauthorizedAccessException.class, () -> notificationService.getMyNotifications());
    }

    @Test
    void markAsRead_ShouldUpdateReadStatus() {
        mockAuthentication();
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));

        notificationService.markAsRead(notification.getId());

        assertTrue(notification.isRead());
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    void markAsRead_ShouldThrowException_WhenNotOwner() {
        mockAuthentication();
        
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        Notification otherNotification = new Notification();
        otherNotification.setId(UUID.randomUUID());
        otherNotification.setUser(otherUser);

        when(notificationRepository.findById(otherNotification.getId())).thenReturn(Optional.of(otherNotification));

        assertThrows(UnauthorizedAccessException.class, () -> notificationService.markAsRead(otherNotification.getId()));
    }

    @Test
    void sendPersonalAlert_ShouldSaveAndSendToUserTopic() {
        notificationService.sendPersonalAlert(student, "Personal Title", "Personal Msg", "ALERT");

        verify(notificationRepository, times(1)).save(any(Notification.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/user-alerts/" + user.getId()), any(java.util.Map.class));
    }
}
