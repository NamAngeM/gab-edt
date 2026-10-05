package ga.gabedt.attendance;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {
    private UUID studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentNumber;
    private AttendanceStatus status;
    private Integer delayMinutes;
    private boolean entryTicketPrinted;
}
