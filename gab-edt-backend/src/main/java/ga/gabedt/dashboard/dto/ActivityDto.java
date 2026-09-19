package ga.gabedt.dashboard.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActivityDto {
    private String icon;
    private String text;
    private LocalDateTime time;
    private String type; // e.g., 'SUCCESS', 'WARNING', 'INFO', 'PRIMARY'
}
