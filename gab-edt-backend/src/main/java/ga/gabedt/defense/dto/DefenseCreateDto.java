package ga.gabedt.defense.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

public record DefenseCreateDto(
    @NotNull(message = "L'étudiant est requis") UUID studentId,
    @NotBlank(message = "Le sujet est requis") String topic,
    UUID roomId,
    @NotNull(message = "L'heure de début est requise") LocalDateTime startAt,
    @NotNull(message = "L'heure de fin est requise") LocalDateTime endAt,
    UUID presidentId,
    UUID examinerId,
    UUID reporterId
) {}
