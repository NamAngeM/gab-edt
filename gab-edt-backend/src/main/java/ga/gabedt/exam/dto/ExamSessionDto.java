package ga.gabedt.exam.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ExamSessionDto(
    UUID id,
    String name,
    LocalDate startDate,
    LocalDate endDate,
    UUID orgUnitId,
    String orgUnitName,
    boolean published
) {}
