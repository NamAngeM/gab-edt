package ga.gabedt.communication.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AcademicEventDto(
    UUID id,
    String title,
    String description,
    LocalDateTime startDate,
    LocalDateTime endDate,
    boolean holiday
) {}
