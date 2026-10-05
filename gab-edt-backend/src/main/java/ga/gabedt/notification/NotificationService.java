package ga.gabedt.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import java.util.List;
import ga.gabedt.user.StudentRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import ga.gabedt.common.exception.UnauthorizedAccessException;
import ga.gabedt.common.exception.ResourceNotFoundException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public void sendAdminAlert(String title, String message, String type) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("message", message);
        payload.put("type", type);
        payload.put("timestamp", LocalDateTime.now().toString());

        // Les alertes sont cloisonnées par établissement (cf. JwtChannelInterceptor)
        java.util.UUID tenantId = ga.gabedt.tenant.TenantContext.getTenantId();
        if (tenantId == null) {
            log.warn("Alerte admin ignorée (aucun établissement actif) : {}", title);
            return;
        }
        log.info("Sending WS Notification: {} - {}", title, message);
        messagingTemplate.convertAndSend("/topic/admin-alerts/" + tenantId, payload);
    }

    public void sendClassAlert(UUID orgUnitId, String title, String message, String type) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("message", message);
        payload.put("type", type);
        payload.put("timestamp", LocalDateTime.now().toString());
        payload.put("orgUnitId", orgUnitId.toString());

        log.info("Sending WS Class Alert for OrgUnit {}: {} - {}", orgUnitId, title, message);
        // Notifies both students and their parents subscribed to this class/orgUnit
        messagingTemplate.convertAndSend("/topic/class-alerts/" + orgUnitId, payload);

        // Send Push Notifications and Persist DB
        List<Student> students = studentRepository.findByOrgUnits_IdAndDeletedFalse(orgUnitId);
        List<String> tokens = new java.util.ArrayList<>();
        
        for (Student student : students) {
            User u = student.getUser();
            if (u != null) {
                // Save to DB
                Notification n = new Notification();
                n.setUser(u);
                n.setTitle(title);
                n.setMessage(message);
                n.setType(type);
                notificationRepository.save(n);
                
                // Collect push token
                if (u.getExpoPushToken() != null && u.getExpoPushToken().startsWith("ExponentPushToken")) {
                    if (!tokens.contains(u.getExpoPushToken())) {
                        tokens.add(u.getExpoPushToken());
                    }
                }
            }
        }

        if (!tokens.isEmpty()) {
            sendExpoPushNotifications(tokens, title, message);
        }
    }

    private void sendExpoPushNotifications(List<String> tokens, String title, String message) {
        String expoUrl = "https://exp.host/--/api/v2/push/send";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Construct the payload for Expo Push
        List<Map<String, Object>> messages = tokens.stream().map(token -> {
            Map<String, Object> msg = new HashMap<>();
            msg.put("to", token);
            msg.put("sound", "default");
            msg.put("title", title);
            msg.put("body", message);
            return msg;
        }).toList();

        HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);
        try {
            restTemplate.postForObject(expoUrl, request, String.class);
            log.info("Sent {} push notifications", tokens.size());
        } catch (Exception e) {
            log.error("Error sending push notifications", e);
        }
    }

    public List<NotificationDto> getMyNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new UnauthorizedAccessException("Not authenticated");

        User user = userRepository.findByEmailAndDeletedFalse(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(n -> new NotificationDto(n.getId(), n.getTitle(), n.getMessage(), n.getType(), n.isRead(), n.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public void markAsRead(UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new UnauthorizedAccessException("Not authenticated");

        User user = userRepository.findByEmailAndDeletedFalse(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        
        if (!n.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("Cannot mark other's notification as read");
        }

        n.setRead(true);
        notificationRepository.save(n);
    }

    public void sendPersonalAlert(Student student, String title, String message, String type) {
        User u = student.getUser();
        if (u != null) {
            // Save to DB
            Notification n = new Notification();
            n.setUser(u);
            n.setTitle(title);
            n.setMessage(message);
            n.setType(type);
            notificationRepository.save(n);
            
            // Send Push
            if (u.getExpoPushToken() != null && u.getExpoPushToken().startsWith("ExponentPushToken")) {
                sendExpoPushNotifications(List.of(u.getExpoPushToken()), title, message);
            }
            
            // Send WS
            Map<String, Object> payload = new HashMap<>();
            payload.put("title", title);
            payload.put("message", message);
            payload.put("type", type);
            payload.put("timestamp", System.currentTimeMillis());
            messagingTemplate.convertAndSend("/topic/user-alerts/" + u.getId(), payload);
        }
    }
}
