package ga.gabedt.communication.dto;

import java.time.LocalDateTime;

public record AcademicEventCreateDto(
    String title,
    String description,
    LocalDateTime startDate,
    LocalDateTime endDate,
    boolean holiday
) {}
