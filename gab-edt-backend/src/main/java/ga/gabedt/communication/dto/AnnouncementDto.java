package ga.gabedt.communication.dto;

import ga.gabedt.communication.TargetAudience;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AnnouncementDto(
    UUID id,
    String title,
    String content,
    TargetAudience targetAudience,
    LocalDate validUntil,
    String authorName,
    LocalDateTime createdAt
) {}
