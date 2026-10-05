package ga.gabedt.timetable;

import ga.gabedt.common.entity.TenantAwareEntity;
import ga.gabedt.resource.Room;
import ga.gabedt.structure.Institution;
import ga.gabedt.structure.OrganizationalUnit;
import ga.gabedt.timetable.enums.EventStatus;
import ga.gabedt.timetable.enums.PublicationStatus;
import ga.gabedt.user.Teacher;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_events")
@Getter
@Setter
@NoArgsConstructor
public class ScheduleEvent extends TenantAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Peut être différent du Teacher du Course si remplacement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_unit_id", nullable = false)
    private OrganizationalUnit orgUnit;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.SCHEDULED;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_status", nullable = false)
    private PublicationStatus publicationStatus = PublicationStatus.DRAFT;

    @Column(name = "recurrence_rule")
    private String recurrenceRule;

    private String notes;

    @Column(name = "delay_minutes")
    private Integer delayMinutes = 0;

    /** Séance annulée que celle-ci rattrape (null pour une séance ordinaire). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "make_up_of_id")
    private ScheduleEvent makeUpOf;
}
