package ga.gabedt.timetable.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** Création d'un enseignement ; seul plannedHours est modifiable ensuite. */
public record CourseUpsertDto(
        @NotNull(message = "La matière est requise") UUID subjectId,
        @NotNull(message = "L'enseignant est requis") UUID teacherId,
        @NotNull(message = "La classe est requise") UUID orgUnitId,
        @DecimalMin(value = "0", message = "Le volume prévu doit être positif")
        @DecimalMax(value = "2000", message = "Volume prévu invalide")
        Double plannedHours
) {}
