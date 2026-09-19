package ga.gabedt.exam.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ExamSessionCreateDto(
    String name,
    LocalDate startDate,
    LocalDate endDate,
    UUID orgUnitId
) {}
