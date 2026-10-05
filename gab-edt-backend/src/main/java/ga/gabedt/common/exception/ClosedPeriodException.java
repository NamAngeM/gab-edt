package ga.gabedt.common.exception;

/**
 * Séance planifiée pendant une fermeture de l'établissement (jour férié, vacances)
 * ou hors de l'année académique — HTTP 409, code CLOSED_PERIOD.
 * Le client peut confirmer et renvoyer la demande avec une dérogation explicite.
 */
public class ClosedPeriodException extends RuntimeException {
    public ClosedPeriodException(String message) {
        super(message);
    }
}
