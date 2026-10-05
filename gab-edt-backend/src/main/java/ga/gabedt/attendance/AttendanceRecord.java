package ga.gabedt.attendance;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.timetable.ScheduleEvent;
import ga.gabedt.user.Student;
import ga.gabedt.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
@Getter
@Setter
@NoArgsConstructor
public class AttendanceRecord extends TenantAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_event_id", nullable = false)
    private ScheduleEvent scheduleEvent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status; // PRESENT, ABSENT, RETARD, EXCUSE

    @Column(name = "delay_minutes")
    private Integer delayMinutes; // If RETARD

    @Column(name = "entry_ticket_printed")
    private boolean entryTicketPrinted = false; // Billet d'entrée (Surveillance Générale)

    @Column(length = 500)
    private String comments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by_id", nullable = false)
    private User markedBy; // Prof ou Surveillant qui a fait l'appel

    @Column(name = "marked_at", nullable = false)
    private LocalDateTime markedAt;
}
