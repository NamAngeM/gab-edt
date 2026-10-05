package ga.gabedt.communication.dto;

import ga.gabedt.communication.TargetAudience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AnnouncementCreateDto(
    @NotBlank(message = "Le titre est requis") String title,
    @NotBlank(message = "Le contenu est requis") String content,
    @NotNull(message = "L'audience cible est requise") TargetAudience targetAudience,
    LocalDate validUntil
) {}
