package ga.gabedt.academic.dto;

import ga.gabedt.academic.AcademicYearStatus;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

@Data
public class AcademicYearDto {
    private UUID id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private AcademicYearStatus status;
    private UUID institutionId;
    private List<AcademicPeriodDto> periods;
}
