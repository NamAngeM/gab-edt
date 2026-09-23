package ga.gabedt.timetable.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScheduleEventRescheduleDto {
    private LocalDateTime startAt;
    private LocalDateTime endAt;
}
