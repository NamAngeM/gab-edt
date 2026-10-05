package ga.gabedt;

import ga.gabedt.support.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;

/**
 * Smoke test — le contexte démarre sur PostgreSQL : migrations Flyway appliquées
 * et schéma validé par Hibernate (ddl-auto: validate), comme en production.
 */
class GabEdtApplicationTests extends AbstractPostgresIntegrationTest {

    @Test
    void contextLoads() {
        // Échoue si une table ou une colonne manque dans les migrations
    }
}
