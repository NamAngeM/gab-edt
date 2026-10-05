package ga.gabedt.timetable.dto;

import ga.gabedt.timetable.enums.EventStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
public class ScheduleEventCreateDto {

    @NotNull(message = "La matière est requise")
    private UUID subjectId;

    @NotNull(message = "L'enseignant est requis")
    private UUID teacherId;

    private UUID roomId;

    @NotNull(message = "L'unité organisationnelle est requise")
    private UUID orgUnitId;

    @NotNull(message = "L'heure de début est requise")
    private LocalDateTime startAt;

    @NotNull(message = "L'heure de fin est requise")
    private LocalDateTime endAt;

    private EventStatus status;
    private String notes;

    /**
     * Rattrapage : identifiant de la séance annulée à rattraper. La matière, l'enseignant
     * et la classe sont alors ceux de la séance d'origine.
     */
    private UUID makeUpOfId;

    /**
     * Dérogation explicite : planifier pendant une fermeture (vacances, jour férié) ou hors
     * année académique, par exemple un rattrapage pendant les vacances.
     */
    private boolean allowDuringClosure;
}
