package ga.gabedt.dashboard.dto;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class TodayEventDto {
    private UUID id;
    private String title;
    private String description;
    private String roomName;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private boolean conflict;
}
