package ga.gabedt.academic.dto;

import ga.gabedt.academic.PeriodType;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AcademicPeriodDto {
    private UUID id;
    private String name;
    private PeriodType periodType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer orderIndex;
}
