package ga.gabedt.exam.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ExamCreateDto(
    UUID sessionId,
    UUID subjectId,
    UUID roomId,
    LocalDateTime startAt,
    LocalDateTime endAt,
    List<UUID> supervisorIds
) {}
