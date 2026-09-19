package ga.gabedt.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Format d'erreur JSON standardisé conforme au cahier des charges.
 * <p>
 * Exemple :
 * <pre>
 * {
 *   "timestamp": "2026-09-15T10:30:00Z",
 *   "status": 409,
 *   "code": "SCHEDULE_CONFLICT",
 *   "message": "La salle est déjà occupée sur cette période.",
 *   "details": []
 * }
 * </pre>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private LocalDateTime timestamp;
    private int status;
    private String code;
    private String message;
    private List<FieldError> details;

    /**
     * Détail d'une erreur de validation sur un champ spécifique.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
        private Object rejectedValue;
    }
}
