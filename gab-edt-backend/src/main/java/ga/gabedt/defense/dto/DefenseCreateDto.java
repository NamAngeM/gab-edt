package ga.gabedt.defense.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record DefenseCreateDto(
    UUID studentId,
    String topic,
    UUID roomId,
    LocalDateTime startAt,
    LocalDateTime endAt,
    UUID presidentId,
    UUID examinerId,
    UUID reporterId
) {}
