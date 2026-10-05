package ga.gabedt.attendance;

import ga.gabedt.common.exception.ResourceNotFoundException;
import ga.gabedt.notification.NotificationService;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.timetable.repository.ScheduleEventRepository;
import ga.gabedt.user.Student;
import ga.gabedt.user.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;

import ga.gabedt.user.User;
import ga.gabedt.user.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AttendanceDto> getAttendance(UUID eventId) {
        ScheduleEvent event = scheduleEventRepository.findById(eventId)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));

        List<Student> students = studentRepository.findByOrgUnits_IdAndDeletedFalse(event.getOrgUnit().getId());
        List<Attendance> existingRecords = attendanceRepository.findByScheduleEventIdAndDeletedFalse(eventId);

        Map<UUID, Attendance> recordsMap = existingRecords.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        return students.stream().map(student -> {
            AttendanceStatus status = AttendanceStatus.PRESENT;
            Integer delay = null;
            boolean printed = false;
            
            if (recordsMap.containsKey(student.getId())) {
                status = recordsMap.get(student.getId()).getStatus();
                delay = recordsMap.get(student.getId()).getDelayMinutes();
                printed = recordsMap.get(student.getId()).isEntryTicketPrinted();
            }
            return new AttendanceDto(
                    student.getId(),
                    student.getUser().getFirstName(),
                    student.getUser().getLastName(),
                    student.getStudentNumber(),
                    status,
                    delay,
                    printed
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void saveAttendance(UUID eventId, List<AttendanceUpdateDto> updates) {
        ScheduleEvent event = scheduleEventRepository.findById(eventId)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent not found"));

        List<Attendance> existingRecords = attendanceRepository.findByScheduleEventIdAndDeletedFalse(eventId);
        Map<UUID, Attendance> recordsMap = existingRecords.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User marker = userRepository.findByEmailAndDeletedFalse(currentUserEmail)
                .orElse(null);

        for (AttendanceUpdateDto update : updates) {
            Attendance attendance = recordsMap.get(update.getStudentId());
            boolean isNew = false;
            
            if (attendance == null) {
                Student student = studentRepository.findById(update.getStudentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                attendance = new Attendance();
                attendance.setScheduleEvent(event);
                attendance.setStudent(student);
                isNew = true;
            }
            
            AttendanceStatus oldStatus = attendance.getStatus();
            attendance.setStatus(update.getStatus());
            attendance.setDelayMinutes(update.getDelayMinutes());
            attendance.setMarkedBy(marker);
            attendance.setMarkedAt(LocalDateTime.now());
            
            attendanceRepository.save(attendance);

            // Send notification to parent if newly marked as ABSENT
            if ((isNew && update.getStatus() == AttendanceStatus.ABSENT) || 
                (!isNew && oldStatus != AttendanceStatus.ABSENT && update.getStatus() == AttendanceStatus.ABSENT)) {
                
                String title = "Avis d'absence";
                String message = String.format("L'élève %s a été noté(e) ABSENT(E) au cours de %s.",
                        attendance.getStudent().getUser().getFirstName(),
                        event.getCourse().getSubject().getName());
                
                notificationService.sendPersonalAlert(attendance.getStudent(), title, message, "ERROR");
            }
        }
    }

    @Transactional
    public void printEntryTicket(UUID eventId, UUID studentId) {
        Attendance attendance = attendanceRepository.findByScheduleEventIdAndDeletedFalse(eventId)
                .stream()
                .filter(a -> a.getStudent().getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));

        if (attendance.getStatus() != AttendanceStatus.LATE && attendance.getStatus() != AttendanceStatus.ABSENT) {
            throw new IllegalArgumentException("Un billet d'entrée n'est nécessaire que pour les retards ou absences.");
        }

        attendance.setEntryTicketPrinted(true);
        attendanceRepository.save(attendance);
        
        log.info("Billet d'entrée imprimé pour l'élève {} (Événement: {})", studentId, eventId);
    }
}
