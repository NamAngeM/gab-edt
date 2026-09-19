package ga.gabedt.common.exception;

import ga.gabedt.common.response.ApiError;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Gestionnaire global des exceptions pour l'API REST.
 * <p>
 * Traduit toutes les exceptions en réponses JSON cohérentes
 * conformément au format défini dans le cahier des charges (section 55).
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─── 404 — Ressource non trouvée ───────────────────────────────────

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Ressource non trouvée : {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .code("RESOURCE_NOT_FOUND")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // ─── 409 — Conflit métier ──────────────────────────────────────────

    @ExceptionHandler(BusinessConflictException.class)
    public ResponseEntity<ApiError> handleBusinessConflict(BusinessConflictException ex) {
        log.warn("Conflit métier : {} — {}", ex.getCode(), ex.getMessage());
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .code(ex.getCode())
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(ScheduleConflictException.class)
    public ResponseEntity<ApiError> handleScheduleConflict(ScheduleConflictException ex) {
        log.warn("Conflit de planification : {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .code("SCHEDULE_CONFLICT")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    // ─── 403 — Accès non autorisé ──────────────────────────────────────

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ApiError> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
        log.warn("Accès non autorisé : {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .code("ACCESS_DENIED")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // ─── 401 — Non authentifié / Identifiants incorrects ───────────────

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Erreur d'authentification : {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .code("BAD_CREDENTIALS")
                .message("Email ou mot de passe incorrect.")
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // ─── 400 — Validation DTO (@Valid) ─────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        log.warn("Erreur de validation DTO : {}", ex.getMessage());
        List<ApiError.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> ApiError.FieldError.builder()
                        .field(fe.getField())
                        .message(fe.getDefaultMessage())
                        .rejectedValue(fe.getRejectedValue())
                        .build())
                .toList();

        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("VALIDATION_ERROR")
                .message("Erreur de validation des données.")
                .details(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    // ─── 400 — Binding errors ──────────────────────────────────────────

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBindException(BindException ex) {
        log.warn("Erreur de binding : {}", ex.getMessage());
        List<ApiError.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> ApiError.FieldError.builder()
                        .field(fe.getField())
                        .message(fe.getDefaultMessage())
                        .rejectedValue(fe.getRejectedValue())
                        .build())
                .toList();

        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("BINDING_ERROR")
                .message("Erreur de liaison des données.")
                .details(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    // ─── 400 — Constraint violation ────────────────────────────────────

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(ConstraintViolationException ex) {
        log.warn("Violation de contrainte : {}", ex.getMessage());
        List<ApiError.FieldError> fieldErrors = ex.getConstraintViolations().stream()
                .map(cv -> ApiError.FieldError.builder()
                        .field(cv.getPropertyPath().toString())
                        .message(cv.getMessage())
                        .rejectedValue(cv.getInvalidValue())
                        .build())
                .toList();

        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("CONSTRAINT_VIOLATION")
                .message("Violation de contrainte de validation.")
                .details(fieldErrors)
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    // ─── 400 — Type mismatch ───────────────────────────────────────────

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.warn("Type mismatch pour le paramètre '{}' : {}", ex.getName(), ex.getMessage());
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("TYPE_MISMATCH")
                .message(String.format("Le paramètre '%s' a une valeur invalide.", ex.getName()))
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    // ─── 400 — IllegalArgument ─────────────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Argument invalide : {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("INVALID_ARGUMENT")
                .message(ex.getMessage())
                .build();
        return ResponseEntity.badRequest().body(error);
    }

    // ─── 500 — Erreur inattendue ───────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        log.error("Erreur inattendue", ex);
        ApiError error = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .code("INTERNAL_ERROR")
                .message("Une erreur interne est survenue. Veuillez réessayer plus tard.")
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
