package ga.gabedt.timetable.dto;

import ga.gabedt.timetable.enums.EventStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class ScheduleEventCreateDto {
    private UUID subjectId;
    private UUID teacherId;
    private UUID roomId;
    private UUID orgUnitId;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private EventStatus status;
    private String notes;
}
