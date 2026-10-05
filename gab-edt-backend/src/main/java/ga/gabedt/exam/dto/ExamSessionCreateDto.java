package ga.gabedt.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record ExamSessionCreateDto(
    @NotBlank(message = "Le nom de la session est requis") String name,
    @NotNull(message = "La date de début est requise") LocalDate startDate,
    @NotNull(message = "La date de fin est requise") LocalDate endDate,
    UUID orgUnitId
) {}
