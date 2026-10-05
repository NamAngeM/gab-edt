package ga.gabedt.academic.dto;

import ga.gabedt.academic.PeriodType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AcademicPeriodCreateDto(
    @NotBlank(message = "Le nom de la période est requis") String name,
    @NotNull(message = "Le type de période est requis") PeriodType periodType,
    @NotNull(message = "La date de début est requise") LocalDate startDate,
    @NotNull(message = "La date de fin est requise") LocalDate endDate,
    Integer orderIndex
) {}
