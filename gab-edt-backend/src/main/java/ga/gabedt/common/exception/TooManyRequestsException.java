package ga.gabedt.common.exception;

/**
 * Trop de requêtes (ex. tentatives de connexion répétées) — HTTP 429.
 */
public class TooManyRequestsException extends RuntimeException {
    public TooManyRequestsException(String message) {
        super(message);
    }
}
