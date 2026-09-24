package ga.gabedt.evaluation.dto;

import lombok.Data;
import java.util.List;

@Data
public class BulkGradeDto {
    private String title;
    private Double coefficient;
    private List<GradeEntry> grades;

    @Data
    public static class GradeEntry {
        private String studentId;
        private Double value;
    }
}
