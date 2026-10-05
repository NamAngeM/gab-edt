package ga.gabedt.exam.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ExamCreateDto(
    @NotNull(message = "La session est requise") UUID sessionId,
    @NotNull(message = "La matière est requise") UUID subjectId,
    UUID roomId,
    @NotNull(message = "L'heure de début est requise") LocalDateTime startAt,
    @NotNull(message = "L'heure de fin est requise") LocalDateTime endAt,
    List<UUID> supervisorIds
) {}
