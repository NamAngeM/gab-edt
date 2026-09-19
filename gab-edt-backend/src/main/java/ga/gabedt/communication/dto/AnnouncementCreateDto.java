package ga.gabedt.communication.dto;

import ga.gabedt.communication.TargetAudience;
import java.time.LocalDate;
import java.util.UUID;

public record AnnouncementCreateDto(
    String title,
    String content,
    TargetAudience targetAudience,
    LocalDate validUntil,
    UUID authorId
) {}
