package ga.gabedt.timetable.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScheduleEventRescheduleDto {

    @NotNull(message = "L'heure de début est requise")
    private LocalDateTime startAt;

    @NotNull(message = "L'heure de fin est requise")
    private LocalDateTime endAt;
}
