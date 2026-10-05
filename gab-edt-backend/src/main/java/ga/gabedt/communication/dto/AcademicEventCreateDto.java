package ga.gabedt.communication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AcademicEventCreateDto(
    @NotBlank(message = "Le titre est requis") String title,
    String description,
    @NotNull(message = "La date de début est requise") LocalDateTime startDate,
    @NotNull(message = "La date de fin est requise") LocalDateTime endDate,
    boolean holiday
) {}
