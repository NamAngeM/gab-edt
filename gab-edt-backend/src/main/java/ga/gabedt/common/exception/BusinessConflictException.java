package ga.gabedt.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsqu'une opération engendre un conflit métier.
 * <p>
 * Exemples : conflit de salle, conflit d'enseignant, conflit de groupe.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class BusinessConflictException extends RuntimeException {

    private final String code;

    public BusinessConflictException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
