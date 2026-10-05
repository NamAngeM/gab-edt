package ga.gabedt.student.disciplinary.dto;

import ga.gabedt.student.disciplinary.DisciplinaryType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DisciplinaryRecordDto {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private UUID reportedById;
    private String reportedByName;
    private DisciplinaryType type;
    private String description;
    private LocalDateTime incidentDate;
    private boolean signed;
    private LocalDateTime signedAt;
}
