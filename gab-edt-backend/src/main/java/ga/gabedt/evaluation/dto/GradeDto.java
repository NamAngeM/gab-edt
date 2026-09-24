package ga.gabedt.evaluation.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class GradeDto {
    private UUID id;
    private String title;
    private Double value;
    private Double coefficient;
    private UUID studentId;
}
