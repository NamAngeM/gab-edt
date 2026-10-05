package ga.gabedt.academic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

public record AcademicYearCreateDto(
    @NotBlank(message = "Le nom de l'année académique est requis") String name,
    @NotNull(message = "La date de début est requise") LocalDate startDate,
    @NotNull(message = "La date de fin est requise") LocalDate endDate,
    /** Ignoré : l'année est toujours créée pour l'établissement de l'utilisateur connecté. */
    UUID institutionId,
    List<AcademicPeriodCreateDto> periods
) {}
