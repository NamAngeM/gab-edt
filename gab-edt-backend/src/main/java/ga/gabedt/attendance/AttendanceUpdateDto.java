package ga.gabedt.attendance;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceUpdateDto {
    private UUID studentId;
    private AttendanceStatus status;
    private Integer delayMinutes;
}
