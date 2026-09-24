package ga.gabedt.homework;

import ga.gabedt.common.entity.BaseEntity;
import ga.gabedt.timetable.ScheduleEvent;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "homework")
@Getter
@Setter
@NoArgsConstructor
public class Homework extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_event_id", nullable = false)
    private ScheduleEvent scheduleEvent;

    @Column(nullable = false)
    private String title;

    private String description;
}
